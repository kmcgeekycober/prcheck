import { createPRSizeService } from "./pr-size-service";

describe("createPRSizeService", () => {
  const service = createPRSizeService();

  describe("computeAndLabel", () => {
    it("returns XS label for tiny PRs", () => {
      expect(service.computeAndLabel(2, 1, 1)).toBe("size/XS");
    });

    it("returns S label for small PRs", () => {
      expect(service.computeAndLabel(20, 10, 3)).toBe("size/S");
    });

    it("returns M label for medium PRs", () => {
      expect(service.computeAndLabel(100, 50, 10)).toBe("size/M");
    });

    it("returns XL label for large PRs", () => {
      expect(service.computeAndLabel(600, 200, 30)).toBe("size/XL");
    });

    it("uses custom config thresholds", () => {
      const custom = createPRSizeService({
        thresholds: { XS: 5, S: 20, M: 100, L: 300, XL: 600 },
      });
      expect(custom.computeAndLabel(3, 1, 1)).toBe("size/XS");
      expect(custom.computeAndLabel(10, 5, 2)).toBe("size/S");
    });
  });

  describe("getCurrentSizeLabel", () => {
    it("returns the first size label found", () => {
      expect(service.getCurrentSizeLabel(["bug", "size/M", "enhancement"])).toBe("size/M");
    });

    it("returns null when no size label present", () => {
      expect(service.getCurrentSizeLabel(["bug", "enhancement"])).toBeNull();
    });

    it("returns null for empty label list", () => {
      expect(service.getCurrentSizeLabel([])).toBeNull();
    });
  });

  describe("shouldUpdateLabel", () => {
    it("returns true when labels differ", () => {
      expect(service.shouldUpdateLabel("size/S", "size/M")).toBe(true);
    });

    it("returns false when labels are the same", () => {
      expect(service.shouldUpdateLabel("size/M", "size/M")).toBe(false);
    });

    it("returns false when new label is null", () => {
      expect(service.shouldUpdateLabel("size/S", null)).toBe(false);
    });

    it("returns false when both labels are null", () => {
      expect(service.shouldUpdateLabel(null, null)).toBe(false);
    });
  });

  describe("getLabelsToRemove", () => {
    it("returns only size labels", () => {
      const result = service.getLabelsToRemove(["bug", "size/S", "size/M", "enhancement"]);
      expect(result).toEqual(["size/S", "size/M"]);
    });

    it("returns empty array when no size labels", () => {
      expect(service.getLabelsToRemove(["bug", "enhancement"])).toEqual([]);
    });

    it("returns empty array for empty input", () => {
      expect(service.getLabelsToRemove([])).toEqual([]);
    });
  });
});
