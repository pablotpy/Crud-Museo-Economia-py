import { Visitor } from "./visitor.model";

export interface AttendanceRecord {
    id?: number;
    visitor_id?: number;
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