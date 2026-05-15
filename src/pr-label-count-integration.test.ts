import { createLabelCountService } from "./pr-label-count-validator-service";

describe("pr-label-count integration", () => {
  it("rejects PR with no labels when minimum is 1", () => {
    const service = createLabelCountService({ minLabels: 1 });
    const result = service.validate([]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least 1/);
  });

  it("rejects PR exceeding max labels", () => {
    const service = createLabelCountService({ maxLabels: 2 });
    const result = service.validate(["a", "b", "c"]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at most 2/);
  });

  it("rejects PR missing a required label", () => {
    const service = createLabelCountService({ required: ["type/bug"] });
    const result = service.validate(["size/small"]);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/type\/bug/);
  });

  it("accepts PR satisfying all constraints", () => {
    const service = createLabelCountService({
      minLabels: 1,
      maxLabels: 4,
      required: ["type/bug"],
    });
    const result = service.validate(["type/bug", "size/small"]);
    expect(result.valid).toBe(true);
    expect(result.appliedLabels).toHaveLength(2);
  });

  it("accepts PR with no constraints", () => {
    const service = createLabelCountService({});
    expect(service.validate([]).valid).toBe(true);
    expect(service.validate(["a", "b", "c", "d", "e"]).valid).toBe(true);
  });
});
