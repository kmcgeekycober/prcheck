import { createChecklistService } from './pr-checklist-service';

const BODY_PARTIAL = `
- [x] Tests added
- [ ] Docs updated
`;

const BODY_FULL = `
- [x] Tests added
- [x] Docs updated
`;

describe('createChecklistService', () => {
  describe('when disabled', () => {
    const service = createChecklistService({
      enabled: false,
      requireAllChecked: true,
    });

    it('returns null from validate', () => {
      expect(service.validate(BODY_PARTIAL)).toBeNull();
    });
  });

  describe('when enabled and requireAllChecked=true', () => {
    const service = createChecklistService({
      enabled: true,
      requireAllChecked: true,
    });

    it('returns a result with allChecked=false for partial body', () => {
      const result = service.validate(BODY_PARTIAL);
      expect(result).not.toBeNull();
      expect(result!.allChecked).toBe(false);
      expect(result!.unchecked).toHaveLength(1);
    });

    it('returns allChecked=true for fully checked body', () => {
      const result = service.validate(BODY_FULL);
      expect(result!.allChecked).toBe(true);
    });
  });

  describe('when enabled and requireAllChecked=false', () => {
    const service = createChecklistService({
      enabled: true,
      requireAllChecked: false,
    });

    it('returns allChecked=true even with unchecked items', () => {
      const result = service.validate(BODY_PARTIAL);
      expect(result!.allChecked).toBe(true);
    });
  });

  describe('report', () => {
    it('does not throw for valid result', () => {
      const service = createChecklistService({
        enabled: true,
        requireAllChecked: true,
      });
      const result = service.validate(BODY_FULL)!;
      expect(() => service.report(result)).not.toThrow();
    });
  });
});
