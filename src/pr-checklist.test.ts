import {
  extractChecklistItems,
  validateChecklist,
  buildChecklistMessage,
} from './pr-checklist';

const BODY_WITH_CHECKLIST = `
## Checklist
- [x] Tests added
- [ ] Docs updated
- [x] Reviewed by peer
`;

const BODY_ALL_CHECKED = `
- [x] Tests added
- [x] Docs updated
`;

describe('extractChecklistItems', () => {
  it('extracts all checklist items', () => {
    const items = extractChecklistItems(BODY_WITH_CHECKLIST);
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ text: 'Tests added', checked: true });
    expect(items[1]).toEqual({ text: 'Docs updated', checked: false });
    expect(items[2]).toEqual({ text: 'Reviewed by peer', checked: true });
  });

  it('returns empty array when no checklist present', () => {
    expect(extractChecklistItems('No checklist here')).toEqual([]);
  });
});

describe('validateChecklist', () => {
  it('reports unchecked items when requireAllChecked=true', () => {
    const result = validateChecklist(BODY_WITH_CHECKLIST, true);
    expect(result.total).toBe(3);
    expect(result.checked).toBe(2);
    expect(result.unchecked).toHaveLength(1);
    expect(result.allChecked).toBe(false);
  });

  it('passes when requireAllChecked=false even with unchecked items', () => {
    const result = validateChecklist(BODY_WITH_CHECKLIST, false);
    expect(result.allChecked).toBe(true);
  });

  it('passes when all items are checked', () => {
    const result = validateChecklist(BODY_ALL_CHECKED, true);
    expect(result.allChecked).toBe(true);
    expect(result.unchecked).toHaveLength(0);
  });
});

describe('buildChecklistMessage', () => {
  it('returns empty string when no items', () => {
    const result = validateChecklist('no checklist', true);
    expect(buildChecklistMessage(result)).toBe('');
  });

  it('returns success message when all checked', () => {
    const result = validateChecklist(BODY_ALL_CHECKED, true);
    expect(buildChecklistMessage(result)).toContain('✅');
  });

  it('returns failure message listing unchecked items', () => {
    const result = validateChecklist(BODY_WITH_CHECKLIST, true);
    const msg = buildChecklistMessage(result);
    expect(msg).toContain('❌');
    expect(msg).toContain('Docs updated');
  });
});
