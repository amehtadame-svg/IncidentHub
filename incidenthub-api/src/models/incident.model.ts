export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Incident {
  id: number;
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  estimatedMinutes: number;
  createdAt: string;
}