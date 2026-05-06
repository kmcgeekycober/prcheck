import { recordEvent, getAuditLog, summarizeAuditLog, AuditEvent, AuditEventType } from './audit';

export interface AuditService {
  record(type: AuditEventType, details?: Record<string, unknown>): AuditEvent;
  getLog(): Readonly<AuditEvent[]>;
  summarize(): string;
}

export function createAuditService(prNumber: number): AuditService {
  return {
    record(type: AuditEventType, details: Record<string, unknown> = {}): AuditEvent {
      return recordEvent(type, prNumber, details);
    },

    getLog(): Readonly<AuditEvent[]> {
      return getAuditLog().filter((e) => e.prNumber === prNumber);
    },

    summarize(): string {
      return summarizeAuditLog(prNumber);
    },
  };
}
