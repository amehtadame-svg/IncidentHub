#!/bin/bash
# Pruebas minimas del PDF (seccion 14). Uso:  bash pruebas.sh
# Con el servidor corriendo (npm run dev). Reinicia el servidor para volver a los datos semilla.
BASE="${BASE:-http://localhost:3000}"
ADMIN="${ADMIN:-instructor-token}"
TECH="${TECH:-technician-token}"
J="Content-Type: application/json"
PASS=0; FAIL=0

req(){ curl -s -o /tmp/body -w "%{http_code}" "$@"; }
check(){ # nombre esperado obtenido
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); m="✅"; else FAIL=$((FAIL+1)); m="❌"; fi
  printf "%s %-42s esperado %-3s obtuvo %-3s %s\n" "$m" "$1" "$2" "$3" "$(head -c 80 /tmp/body | tr '\n' ' ')"
}
new='{"title":"Prueba","description":"desc","reporter":"Tester","location":"Lab","priority":"HIGH","estimatedMinutes":40}'

check "1  GET todos"                 200 $(req $BASE/api/incidents)
check "2  GET existente (id 1)"      200 $(req $BASE/api/incidents/1)
check "3  GET inexistente"           404 $(req $BASE/api/incidents/9999)
check "4  GET id abc"                400 $(req $BASE/api/incidents/abc)
check "5  POST valido"               201 $(req -X POST -H "$J" -H "Authorization: Bearer $TECH" -d "$new" $BASE/api/incidents)
ID=$(grep -o '"id":[0-9]*' /tmp/body | head -1 | cut -d: -f2)
check "6  POST sin titulo"           400 $(req -X POST -H "$J" -H "Authorization: Bearer $TECH" -d '{"description":"d","reporter":"R","location":"L","priority":"LOW","estimatedMinutes":10}' $BASE/api/incidents)
check "7  POST prioridad invalida"   400 $(req -X POST -H "$J" -H "Authorization: Bearer $TECH" -d '{"title":"t","description":"d","reporter":"R","location":"L","priority":"SUPER_IMPORTANT","estimatedMinutes":10}' $BASE/api/incidents)
check "8  POST minutos negativos"    400 $(req -X POST -H "$J" -H "Authorization: Bearer $TECH" -d '{"title":"t","description":"d","reporter":"R","location":"L","priority":"LOW","estimatedMinutes":-5}' $BASE/api/incidents)
check "9  POST CRITICAL > 60 min"    400 $(req -X POST -H "$J" -H "Authorization: Bearer $TECH" -d '{"title":"t","description":"d","reporter":"R","location":"L","priority":"CRITICAL","estimatedMinutes":180}' $BASE/api/incidents)
check "10 PUT existente"             200 $(req -X PUT -H "$J" -H "Authorization: Bearer $TECH" -d '{"title":"Pantalla sin imagen","description":"d","location":"Of 407","priority":"HIGH","estimatedMinutes":60}' $BASE/api/incidents/$ID)
check "11 PUT inexistente"           404 $(req -X PUT -H "$J" -H "Authorization: Bearer $TECH" -d '{"title":"t","description":"d","location":"L","priority":"HIGH","estimatedMinutes":60}' $BASE/api/incidents/9999)
check "12 PATCH OPEN -> IN_PROGRESS" 200 $(req -X PATCH -H "$J" -H "Authorization: Bearer $TECH" -d '{"status":"IN_PROGRESS"}' $BASE/api/incidents/$ID/status)
check "13 PATCH IN_PROGRESS -> RESOLVED" 200 $(req -X PATCH -H "$J" -H "Authorization: Bearer $TECH" -d '{"status":"RESOLVED"}' $BASE/api/incidents/$ID/status)
check "14 PATCH RESOLVED -> OPEN"    400 $(req -X PATCH -H "$J" -H "Authorization: Bearer $TECH" -d '{"status":"OPEN"}' $BASE/api/incidents/$ID/status)
check "14b PATCH status invalido"    400 $(req -X PATCH -H "$J" -H "Authorization: Bearer $TECH" -d '{"status":"FOO"}' $BASE/api/incidents/1/status)
check "15 DELETE sin token"          401 $(req -X DELETE $BASE/api/incidents/$ID)
check "16 DELETE technician-token"   403 $(req -X DELETE -H "Authorization: Bearer $TECH" $BASE/api/incidents/$ID)
check "17 DELETE instructor-token"   204 $(req -X DELETE -H "Authorization: Bearer $ADMIN" $BASE/api/incidents/$ID)
check "18 Ruta inexistente"          404 $(req $BASE/api/planets)
check "19 GET /critical"             200 $(req $BASE/api/incidents/critical)
check "19b GET /pending"             200 $(req $BASE/api/incidents/pending)
check "20 GET /stats"                200 $(req $BASE/api/incidents/stats)
echo; echo "Resultado: $PASS OK, $FAIL fallidas"