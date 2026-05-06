import * as core from '@actions/core';

export type AuditEventType =
  | 'config_loaded'
  | 'rules_matched'
  | 'validation_passed'
  | 'validation_failed'
  | 'labels_applied'
  | 'labels_skipped'
  | 'pr_checked';

export interface AuditEvent {
  type: AuditEventType;
  timestamp: string;
  prNumber: number;
  details: Record<string, unknown>;
}

const auditLog: AuditEvent[] = [];

export function recordEvent(
  type: AuditEventType,
  prNumber: number,
  details: Record<string, unknown> = {}
): AuditEvent {
  const event: AuditEvent = {
    type,
    timestamp: new Date().toISOString(),
    prNumber,
    details,
  };
  auditLog.push(event);
  core.debug(`[audit] ${type} pr=${prNumber} ${JSON.stringify(details)}`);
  return event;
}

export function getAuditLog(): Readonly<AuditEvent[]> {
  return auditLog;
}

export function clearAuditLog(): void {
  auditLog.splice(0, auditLog.length);
}

export function summarizeAuditLog(prNumber: number): string {
  const events = auditLog.filter((e) => e.prNumber === prNumber);
  if (events.length === 0) return `No audit events for PR #${prNumber}`;
  const lines = events.map(
    (e) => `[${e.timestamp}] ${e.type}: ${JSON.stringify(e.details)}`
  );
  return `Audit log for PR #${prNumber}:\n${lines.join('\n')}`;
}
