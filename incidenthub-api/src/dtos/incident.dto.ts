import { IncidentPriority } from "../models/incident.model";

export interface CreateIncidentDto {
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
}