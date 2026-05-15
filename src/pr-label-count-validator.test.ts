import { validateLabelCount, buildLabelCountMessage } from "./pr-label-count-validator";

describe("validateLabelCount", () => {
  it("passes when label count is within range", () => {
    const result = validateLabelCount(["bug", "backend"], { minLabels: 1, maxLabels: 3 });
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("fails when fewer labels than minimum", () => {
    const result = validateLabelCount([], { minLabels: 1 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least 1/);
  });

  it("fails when more labels than maximum", () => {
    const result = validateLabelCount(["a", "b", "c", "d"], { maxLabels: 3 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at most 3/);
  });

  it("fails when required label is missing", () => {
    const result = validateLabelCount(["bug"], { required: ["bug", "priority"] });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/priority/);
  });

  it("passes when all required labels are present", () => {
    const result = validateLabelCount(["bug", "priority"], { required: ["bug", "priority"] });
    expect(result.valid).toBe(true);
  });

  it("returns appliedLabels in result", () => {
    const labels = ["bug"];
    const result = validateLabelCount(labels, {});
    expect(result.appliedLabels).toEqual(labels);
  });

  it("passes with no options", () => {
    const result = validateLabelCount(["x", "y", "z"], {});
    expect(result.valid).toBe(true);
  });
});

describe("buildLabelCountMessage", () => {
  it("returns min message when below min", () => {
    expect(buildLabelCountMessage([], { minLabels: 2 })).toMatch(/at least 2/);
  });

  it("returns max message when above max", () => {
    expect(buildLabelCountMessage(["a", "b", "c"], { maxLabels: 2 })).toMatch(/at most 2/);
  });

  it("returns fallback message otherwise", () => {
    expect(buildLabelCountMessage(["a"], {})).toMatch(/outside allowed range/);
  });
});
