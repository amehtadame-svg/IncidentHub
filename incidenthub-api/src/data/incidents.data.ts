import { Incident } from "../models/incident.model";

/**
 * Datos semilla en memoria (Persona 1 - Base).
 *
 * NOTA P4: ampliados de 1 a 7 incidentes con variedad de prioridades y
 * estados para poder probar los endpoints de consulta (Reto 1 /critical,
 * Reto 2 /pending, Reto 3 /stats). P1 puede ajustarlos cuando entregue.
 */
export const incidents: Incident[] = [
  {
    id: 1,
    title: "Proyector sin señal",
    description: "El proyector no reconoce ningún computador conectado.",
    reporter: "Carlos Díaz",
    location: "Aula 201",
    priority: "MEDIUM",
    status: "OPEN",
    estimatedMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "WiFi caído en biblioteca",
    description: "Los access points de la biblioteca no dan señal a los estudiantes.",
    reporter: "Laura Pérez",
    location: "Biblioteca central",
    priority: "HIGH",
    status: "OPEN",
    estimatedMinutes: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Servidor de correo no responde",
    description: "El servidor SMTP no acepta conexiones; correo institucional caído.",
    reporter: "Jorge Ruiz",
    location: "Sala de servidores",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    estimatedMinutes: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Impresora atascada",
    description: "La impresora del segundo piso atasca el papel constantemente.",
    reporter: "Carlos Díaz",
    location: "Administración, piso 2",
    priority: "LOW",
    status: "RESOLVED",
    estimatedMinutes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Aire acondicionado apagado en sala de servidores",
    description: "La temperatura de la sala de servidores supera los 30 °C.",
    reporter: "Mónica León",
    location: "Sala de servidores",
    priority: "CRITICAL",
    status: "OPEN",
    estimatedMinutes: 40,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: "Proyector del aula 305 parpadea",
    description: "La imagen del proyector se congela y parpadea cada pocos minutos.",
    reporter: "Laura Pérez",
    location: "Aula 305",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    estimatedMinutes: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: "Sin internet en laboratorio 3",
    description: "Los equipos del laboratorio 3 no tienen salida a internet.",
    reporter: "Jorge Ruiz",
    location: "Laboratorio 3",
    priority: "HIGH",
    status: "RESOLVED",
    estimatedMinutes: 90,
    createdAt: new Date().toISOString(),
  },
];
