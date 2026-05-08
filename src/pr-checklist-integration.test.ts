/**
 * Integration test: checklist validation end-to-end
 * with realistic PR bodies containing mixed content.
 */
import { extractChecklistItems, validateChecklist, buildChecklistMessage } from './pr-checklist';
import { createChecklistService } from './pr-checklist-service';

const REALISTIC_BODY = `
## Description
This PR adds a new feature.

## Checklist
- [x] Unit tests added
- [x] Integration tests added
- [ ] Documentation updated
- [ ] Changelog entry added

## Notes
Some additional notes here.
`;

describe('pr-checklist integration', () => {
  it('correctly identifies 2 unchecked items in a realistic body', () => {
    const items = extractChecklistItems(REALISTIC_BODY);
    expect(items).toHaveLength(4);
    const unchecked = items.filter((i) => !i.checked);
    expect(unchecked.map((i) => i.text)).toEqual([
      'Documentation updated',
      'Changelog entry added',
    ]);
  });

  it('full pipeline: validate and build message', () => {
    const result = validateChecklist(REALISTIC_BODY, true);
    expect(result.total).toBe(4);
    expect(result.checked).toBe(2);
    expect(result.allChecked).toBe(false);

    const msg = buildChecklistMessage(result);
    expect(msg).toContain('Documentation updated');
    expect(msg).toContain('Changelog entry added');
  });

  it('service reports failure correctly', () => {
    const service = createChecklistService({ enabled: true, requireAllChecked: true });
    const result = service.validate(REALISTIC_BODY);
    expect(result).not.toBeNull();
    expect(result!.allChecked).toBe(false);
    expect(() => service.report(result!)).not.toThrow();
  });

  it('service passes when all items checked', () => {
    const allChecked = REALISTIC_BODY
      .replace(/- \[ \]/g, '- [x]');
    const service = createChecklistService({ enabled: true, requireAllChecked: true });
    const result = service.validate(allChecked);
    expect(result!.allChecked).toBe(true);
  });
});
