import {
  measureBodyLength,
  validateBodyLength,
  buildBodyLengthMessage,
} from "./pr-body-length";

describe("measureBodyLength", () => {
  it("returns trimmed length", () => {
    expect(measureBodyLength("  hello  ")).toBe(5);
  });

  it("returns 0 for empty string", () => {
    expect(measureBodyLength("")).toBe(0);
  });

  it("counts all characters in multi-line body", () => {
    const body = "line1\nline2\nline3";
    expect(measureBodyLength(body)).toBe(body.length);
  });
});

describe("validateBodyLength", () => {
  it("returns valid when no constraints set", () => {
    const result = validateBodyLength("some text", {});
    expect(result.valid).toBe(true);
    expect(result.length).toBe(9);
  });

  it("fails when below minLength", () => {
    const result = validateBodyLength("hi", { minLength: 10 });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("too short");
    expect(result.message).toContain("10");
  });

  it("fails when above maxLength", () => {
    const body = "a".repeat(200);
    const result = validateBodyLength(body, { maxLength: 100 });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("too long");
    expect(result.message).toContain("100");
  });

  it("passes when exactly at minLength", () => {
    const body = "a".repeat(10);
    const result = validateBodyLength(body, { minLength: 10 });
    expect(result.valid).toBe(true);
  });

  it("passes when exactly at maxLength", () => {
    const body = "a".repeat(100);
    const result = validateBodyLength(body, { maxLength: 100 });
    expect(result.valid).toBe(true);
  });

  it("passes when within both min and max", () => {
    const body = "a".repeat(50);
    const result = validateBodyLength(body, { minLength: 10, maxLength: 100 });
    expect(result.valid).toBe(true);
  });
});

describe("buildBodyLengthMessage", () => {
  it("returns success message when valid", () => {
    const result = validateBodyLength("hello world", {});
    const msg = buildBodyLengthMessage(result);
    expect(msg).toContain("within acceptable range");
  });

  it("returns failure message when invalid", () => {
    const result = validateBodyLength("hi", { minLength: 50 });
    const msg = buildBodyLengthMessage(result);
    expect(msg).toContain("too short");
  });
});
