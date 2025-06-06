export interface Visitor {
    id?: number;
    ci_number: string;
    first_name: string;
    last_name: string;
    country?: string;
    email?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null; // O Date
    additional_data?: any | null;
    created_at?: string; // O Date
    updated_at?: string; // O Date
    notes?: string;
    visit_type?: string;
  }