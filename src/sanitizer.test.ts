import {
  stripHtmlComments,
  normalizeNewlines,
  sanitizeDescription,
  sanitizeLabels,
} from "./sanitizer";

describe("stripHtmlComments", () => {
  it("removes single-line HTML comments", () => {
    const input = "Hello <!-- this is a comment --> world";
    expect(stripHtmlComments(input)).toBe("Hello  world");
  });

  it("removes multi-line HTML comments", () => {
    const input = "Before\n<!--\nsome\ncomment\n-->\nAfter";
    expect(stripHtmlComments(input)).toBe("Before\n\nAfter");
  });

  it("returns original string when no comments present", () => {
    const input = "No comments here";
    expect(stripHtmlComments(input)).toBe("No comments here");
  });
});

describe("normalizeNewlines", () => {
  it("converts CRLF to LF", () => {
    expect(normalizeNewlines("line1\r\nline2")).toBe("line1\nline2");
  });

  it("converts CR to LF", () => {
    expect(normalizeNewlines("line1\rline2")).toBe("line1\nline2");
  });

  it("leaves LF unchanged", () => {
    expect(normalizeNewlines("line1\nline2")).toBe("line1\nline2");
  });
});

describe("sanitizeDescription", () => {
  it("applies all defaults", () => {
    const input = "  <!-- ignore me -->\r\nReal content\r\n  ";
    expect(sanitizeDescription(input)).toBe("Real content");
  });

  it("respects maxLength option", () => {
    const input = "abcdefghij";
    expect(sanitizeDescription(input, { maxLength: 5 })).toBe("abcde");
  });

  it("skips html comment stripping when disabled", () => {
    const input = "<!-- keep -->content";
    const result = sanitizeDescription(input, { stripHtmlComments: false });
    expect(result).toContain("<!-- keep -->");
  });

  it("handles empty string", () => {
    expect(sanitizeDescription("")).toBe("");
  });
});

describe("sanitizeLabels", () => {
  it("trims and lowercases labels", () => {
    expect(sanitizeLabels(["  Bug  ", "FEATURE"])).toEqual(["bug", "feature"]);
  });

  it("filters out empty labels", () => {
    expect(sanitizeLabels(["valid", "   ", ""])).toEqual(["valid"]);
  });

  it("returns empty array for empty input", () => {
    expect(sanitizeLabels([])).toEqual([]);
  });
});
