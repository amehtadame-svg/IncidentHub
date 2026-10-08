# IncidentHub# IncidentHub API

## Problema que resuelve

Hoy los incidentes se reportan por llamadas, mensajes y conversaciones informales, y no queda
control ni trazabilidad. IncidentHub centraliza esos reportes en una API: cada incidente queda
registrado con su prioridad, su estado y su tiempo estimado, y solo se puede cambiar siguiendo
reglas claras.

## Tecnologías

- Node.js
- Express 5
- TypeScript
- Persistencia en memoria (arreglo de TypeScript, sin base de datos)

## Instalación y ejecución

```bash
cd incidenthub-api
npm install
npm run dev      # servidor en http://localhost:3000
```

## Arquitectura por capas

```
incidenthub-api/src/
├── server.ts          → arranca el servidor (listen)
├── app.ts             → configura Express y monta middlewares globales y rutas
├── routes/            → define URLs y el ORDEN de middlewares de cada una
├── middlewares/       → logger, auth, admin, validaciones, 404 y errores
├── controllers/       → lógica de cada endpoint
├── data/              → arreglo en memoria con los incidentes
├── models/            → interfaz Incident (cómo existe el dato dentro de la app)
├── dtos/              → interfaces de lo que el cliente puede enviar
├── errors/            → clase AppError
└── utils/             → reglas reutilizables (transiciones de estado)
```

Cada capa tiene una sola responsabilidad: las rutas deciden *qué pasa antes*, los middlewares
*filtran*, el controller *ejecuta*, y los datos *guardan*.

## Flujo de una petición

```
CLIENTE
  ↓
Logger → Request Info          (globales, en app.ts)
  ↓
Router (incident.routes.ts)
  ↓
Auth → Admin (solo DELETE)     (¿quién eres y qué puedes hacer?)
  ↓
Validate ID → Validate Incident → Validate Priority → Validate Time
  ↓
Controller → Data              (se ejecuta la operación)
  ↓
Respuesta HTTP

Si algo falla en cualquier paso:  AppError → Error Middleware → { "ok": false, "message": ... }
Si la ruta no existe:             Not Found Middleware → 404 → Error Middleware
```

## Autenticación

Las operaciones que modifican datos requieren el encabezado `Authorization: Bearer <token>`.

| Token | Rol | Permisos |
|---|---|---|
| `instructor-token` | Administrador | GET, POST, PUT, PATCH y DELETE |
| `technician-token` | Técnico | GET, POST, PUT y PATCH (no DELETE) |

Las consultas (GET) son públicas.

## Endpoints

Base: `http://localhost:3000/api/incidents`

| Método | Ruta | Auth | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/` | No | Lista todos los incidentes | 200 |
| GET | `/critical` | No | Solo prioridad CRITICAL | 200 |
| GET | `/pending` | No | Estado OPEN o IN_PROGRESS | 200 |
| GET | `/stats` | No | Métricas calculadas dinámicamente | 200 |
| GET | `/:id` | No | Un incidente por id | 200 / 400 / 404 |
| POST | `/` | Sí | Registra un incidente | 201 / 400 / 401 |
| PUT | `/:id` | Sí | Actualiza datos editables | 200 / 400 / 401 / 404 |
| PATCH | `/:id/status` | Sí | Cambia el estado | 200 / 400 / 401 / 404 |
| DELETE | `/:id` | Admin | Elimina un incidente | 204 / 401 / 403 / 404 |

`GET /` acepta filtros opcionales: `?status=OPEN`, `?priority=HIGH`, `?sort=estimatedMinutes|priority|createdAt` y `?order=asc|desc`.

### Formato de respuestas

Éxito (un elemento): `{ "ok": true, "data": { ... } }`
Éxito (lista): `{ "ok": true, "total": 5, "data": [ ... ] }`
Error: `{ "ok": false, "message": "Incident not found" }`

### GET /api/incidents/stats

```json
{
  {
  "ok": true,
  "data": {
    "total": 7,
    "open": 3,
    "inProgress": 2,
    "resolved": 2,
    "critical": 2,
    "averageEstimatedMinutes": 47,
    "totalEstimatedMinutes": 330,
    "byPriority": { "LOW": 1, "MEDIUM": 2, "HIGH": 2, "CRITICAL": 2 }
  }
}
```

Todo se calcula recorriendo el arreglo en cada petición, no hay valores escritos a mano.
`totalEstimatedMinutes` y `byPriority` son campos adicionales: dan más contexto sin afectar los exigidos.

### POST /api/incidents

```json
{
  "title": "Pantalla con parpadeos",
  "description": "El monitor presenta parpadeos constantes.",
  "reporter": "Miguel Torres",
  "location": "Oficina 407",
  "priority": "MEDIUM",
  "estimatedMinutes": 35
}
```

El servidor agrega `id`, `status: "OPEN"` y `createdAt`. El cliente no puede enviarlos.

### PUT /api/incidents/:id

Campos editables: `title`, `description`, `location`, `priority`, `estimatedMinutes`.
No modifica `id`, `reporter`, `status` ni `createdAt`. El estado solo cambia con PATCH.

### PATCH /api/incidents/:id/status

```json
{ "status": "IN_PROGRESS" }
```

Transiciones permitidas:

```
OPEN → IN_PROGRESS → RESOLVED
OPEN → RESOLVED
```

`RESOLVED` es un estado final: no se puede volver a `OPEN` ni a `IN_PROGRESS` (responde 400).

### Ejemplos con cURL

```bash
# Consultar
curl http://localhost:3000/api/incidents

# Crear
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Router sin conectividad","description":"El router del segundo piso perdió conexión.","reporter":"Ana Torres","location":"Piso 2","priority":"HIGH","estimatedMinutes":40}'

# Cambiar estado
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"IN_PROGRESS"}'

# Eliminar (solo admin)
curl -X DELETE http://localhost:3000/api/incidents/3 \
  -H "Authorization: Bearer instructor-token"
```

## Orden de los middlewares en las rutas

| Ruta | Cadena de middlewares |
|---|---|
| `GET /critical`, `/pending`, `/stats`, `/` | Controller |
| `GET /:id` | validateId → controller |
| `POST /` | auth → validateIncident → validatePriority → validateTime → controller |
| `PUT /:id` | auth → validateId → validateIncidentUpdate → validatePriority → validateTime → controller |
| `PATCH /:id/status` | auth → validateId → controller |
| `DELETE /:id` | auth → admin → validateId → controller |

Por qué este orden:

- **Auth va primero** en las rutas protegidas: no tiene sentido validar datos de alguien que ni siquiera está identificado (401 antes que 400).
- **Admin va justo después de auth**, porque necesita saber quién es el usuario para revisar su rol (403).
- **Las validaciones van antes del controller**, para que a este solo llegue información correcta.
- **`/critical`, `/pending` y `/stats` se declaran antes de `/:id`.** Express evalúa las rutas en el orden en que se escriben. Si `/:id` va primero, la palabra `stats` se interpreta como un id, `validateId` la rechaza y responde 400 sin llegar nunca al endpoint.

## Middlewares

| Middleware | Qué hace |
|---|---|
| `logger` | Registra en consola cada petición (fecha, método y ruta) |
| `requestInfo` | Agrega datos a `req` para que los siguientes componentes los usen |
| `auth` | Verifica el token Bearer. Sin token o con token incorrecto: 401 |
| `admin` | Permite DELETE solo al administrador. Un técnico recibe 403 |
| `validateId` | Comprueba que `:id` sea un entero positivo. Si no: 400 |
| `validateIncident` | Comprueba que los campos obligatorios existan y sean válidos |
| `validatePriority` | Solo acepta LOW, MEDIUM, HIGH o CRITICAL |
| `validateTime` | `estimatedMinutes` numérico, mayor que 0 y máximo 480. Un CRITICAL no puede superar 60 (Reto 4) |
| `notFound` | Responde 404 `Route not found` cuando ninguna ruta coincide |
| `error` | Convierte cualquier error (`AppError` o inesperado) en una respuesta JSON uniforme |

**Reto 4 — ¿Por qué la regla CRITICAL ≤ 60 min está en `validateTime`?**
Porque es una regla sobre `estimatedMinutes`. Dejarla junto al resto de reglas de tiempo agrupa
todo en un solo lugar y se aplica igual en POST y en PUT sin repetir código.

## Model vs DTO

**Model** (`Incident`) es cómo vive un incidente dentro de la aplicación: todos sus campos,
incluidos los que el sistema administra (`id`, `status`, `createdAt`). Es el objeto completo
que se guarda y se devuelve.

**DTO** (`CreateIncidentDto`) es lo que el cliente tiene permitido enviar para una operación
concreta. Solo trae título, descripción, reportante, ubicación, prioridad y minutos estimados.

Se separan porque el cliente no debe decidir ciertos datos. Si el body se guardara tal cual, alguien
podría enviar `"status": "RESOLVED"` o un `id` repetido y saltarse las reglas. Con el DTO, el
servidor toma solo lo permitido y completa el resto: `id` autoincremental, `status` en `OPEN` y
`createdAt` con la fecha actual.

## Manejo de errores

Los controllers y middlewares no responden errores a mano: lanzan o pasan un `AppError(statusCode, message)`,
y el `errorMiddleware` los transforma en `{ "ok": false, "message": ... }`. Un error inesperado
responde 500 sin exponer detalles internos.

| Código | Significado en esta API |
|---|---|
| 400 | La petición es incorrecta (id inválido, campo faltante, transición no permitida) |
| 401 | No estás identificado (sin token o token incorrecto) |
| 403 | Estás identificado, pero no tienes permiso (técnico intentando DELETE) |
| 404 | El incidente o la ruta no existe |
| 500 | Error inesperado del servidor |

## Reflexión: ¿por qué middlewares y no todo dentro del controller?

Si cada controller validara datos, revisara el token y armara sus propios errores, el mismo código
se repetiría en seis lugares. Cambiar una regla, por ejemplo el máximo de minutos, obligaría a
editar todos y sería fácil olvidar alguno. Con middlewares, cada regla vive en un solo archivo
y se reutiliza simplemente poniéndola en la ruta.

Además, el controller queda corto y fácil de leer: solo contiene lo que hace el endpoint, porque
cuando llega hasta él ya se sabe que el usuario está autenticado y que los datos son válidos.
Los errores también salen siempre con el mismo formato, porque pasan por un único punto.
Y es más fácil probar y explicar cada pieza por separado.

## Evidencias de pruebas
✅ 1  GET todos                               esperado 200 obtuvo 200 {"ok":true,"total":7,"data":[{"id":1,"title":"Proyector sin señal","description
✅ 2  GET existente (id 1)                    esperado 200 obtuvo 200 {"ok":true,"data":{"id":1,"title":"Proyector sin señal","description":"El proye
✅ 3  GET inexistente                         esperado 404 obtuvo 404 {"ok":false,"message":"Incident not found"}
✅ 4  GET id abc                              esperado 400 obtuvo 400 {"ok":false,"message":"Invalid incident id"}
✅ 5  POST valido                             esperado 201 obtuvo 201 {"ok":true,"data":{"id":8,"title":"Prueba","description":"desc","reporter":"Test
✅ 6  POST sin titulo                         esperado 400 obtuvo 400 {"ok":false,"message":"title is required and must be a non-empty string"}
✅ 7  POST prioridad invalida                 esperado 400 obtuvo 400 {"ok":false,"message":"Invalid priority. Allowed values: LOW, MEDIUM, HIGH, CRIT
✅ 8  POST minutos negativos                  esperado 400 obtuvo 400 {"ok":false,"message":"estimatedMinutes debe ser un número mayor que 0 y menor 
✅ 9  POST CRITICAL > 60 min                  esperado 400 obtuvo 400 {"ok":false,"message":"Los incidentes CRITICAL deben tener un tiempo estimado me
✅ 10 PUT existente                           esperado 200 obtuvo 200 {"ok":true,"data":{"id":8,"title":"Pantalla sin imagen","description":"d","repor
✅ 11 PUT inexistente                         esperado 404 obtuvo 404 {"ok":false,"message":"Incident not found"}
✅ 12 PATCH OPEN -> IN_PROGRESS               esperado 200 obtuvo 200 {"ok":true,"data":{"id":8,"title":"Pantalla sin imagen","description":"d","repor
✅ 13 PATCH IN_PROGRESS -> RESOLVED           esperado 200 obtuvo 200 {"ok":true,"data":{"id":8,"title":"Pantalla sin imagen","description":"d","repor
✅ 14 PATCH RESOLVED -> OPEN                  esperado 400 obtuvo 400 {"ok":false,"message":"Invalid status transition: RESOLVED -> OPEN"}
✅ 14b PATCH status invalido                  esperado 400 obtuvo 400 {"ok":false,"message":"Invalid status. Allowed: OPEN, IN_PROGRESS, RESOLVED"}
✅ 15 DELETE sin token                        esperado 401 obtuvo 401 {"ok":false,"message":"Authentication required: send 'Authorization: Bearer <tok
✅ 16 DELETE technician-token                 esperado 403 obtuvo 403 {"ok":false,"message":"Forbidden: administrator permissions required"}
✅ 17 DELETE instructor-token                 esperado 204 obtuvo 204 
✅ 18 Ruta inexistente                        esperado 404 obtuvo 404 {"ok":false,"message":"Route not found"}
✅ 19 GET /critical                           esperado 200 obtuvo 200 {"ok":true,"total":2,"data":[{"id":3,"title":"Servidor de correo no responde","d
✅ 19b GET /pending                           esperado 200 obtuvo 200 {"ok":true,"total":5,"data":[{"id":1,"title":"Proyector sin señal","description
✅ 20 GET /stats                              esperado 200 obtuvo 200 {"ok":true,"data":{"total":7,"open":3,"inProgress":2,"resolved":2,"critical":2,"