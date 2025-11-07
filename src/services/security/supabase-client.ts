import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { AuditActionType, AuditFlag, JsonValue, KeyStatus, RequestTimestamp } from './types';

type JsonRecord = Record<string, JsonValue>;

type GenericTable = {
  Row: JsonRecord;
  Insert: JsonRecord;
  Update: Partial<JsonRecord>;
  Relationships: [];
};

export interface AuditLogRow extends Record<string, JsonValue> {
  id?: string;
  timestamp: string;
  user_id: string;
  action_type: AuditActionType;
  endpoint: string;
  metadata: JsonValue;
  ip_address?: string | null;
  user_agent?: string | null;
  success?: boolean;
  error_message?: string | null;
  latency_ms?: number | null;
  flags?: AuditFlag[] | null;
}

export interface EncryptionKeyRow extends Record<string, JsonValue> {
  id?: string;
  user_id: string;
  key_id: string;
  encrypted_key: string;
  algorithm: string;
  created_at: string;
  rotated_at?: string | null;
  status: KeyStatus;
}

export interface RateLimitRow extends Record<string, JsonValue> {
  id?: string;
  user_id: string;
  endpoint: string;
  requests: JsonValue;
  blocked_until?: string | null;
  updated_at: string;
}

export interface SecurityDatabase {
  public: {
    Tables: {
      nathia_audit_logs: GenericTable;
      nathia_encryption_keys: GenericTable;
      nathia_rate_limits: GenericTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SecuritySupabaseClient = SupabaseClient<SecurityDatabase>;

export function createSecurityClient(supabaseUrl: string, supabaseKey: string): SecuritySupabaseClient {
  return createClient<SecurityDatabase>(supabaseUrl, supabaseKey);
}
