import { Visitor } from "./visitor.model";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AttendanceRecord {
    id?: number;
    visitor_id?: number;
    visitor_details?: Visitor;
    visitor?: Visitor;
    ci_number?: string;
    first_name?: string;
    last_name?: string;
    country?: string;
    entry_timestamp?: string; // O Date
    exit_timestamp?: string | null; // O Date
    visit_type?: string | null;
    notes?: string | null;
    registered_by_user_id?: number | null;
    created_at?: string; // O Date
    updated_at?: string; // O Date
  }

  // NUEVA INTERFAZ: para los datos que ENVÍAS a la API al crear
export interface CreateAttendancePayload {
  visitor: number; // Al crear, solo envías el ID del visitante (un número)
  visit_type?: string;
  notes?: string;
}