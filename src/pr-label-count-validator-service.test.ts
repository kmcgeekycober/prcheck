import { createLabelCountService, loadLabelCountOptionsFromInputs } from "./pr-label-count-validator-service";
import * as core from "@actions/core";

jest.mock("@actions/core");

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((key: string) => inputs[key] ?? "");
}

describe("loadLabelCountOptionsFromInputs", () => {
  afterEach(() => jest.resetAllMocks());

  it("parses minLabels from input", () => {
    setupInputs({ label_min_count: "2" });
    const opts = loadLabelCountOptionsFromInputs();
    expect(opts.minLabels).toBe(2);
  });

  it("parses maxLabels from input", () => {
    setupInputs({ label_max_count: "5" });
    const opts = loadLabelCountOptionsFromInputs();
    expect(opts.maxLabels).toBe(5);
  });

  it("parses required labels from comma-separated input", () => {
    setupInputs({ required_labels: "bug, priority, backend" });
    const opts = loadLabelCountOptionsFromInputs();
    expect(opts.required).toEqual(["bug", "priority", "backend"]);
  });

  it("returns empty options when inputs are empty", () => {
    setupInputs({});
    const opts = loadLabelCountOptionsFromInputs();
    expect(opts.minLabels).toBeUndefined();
    expect(opts.maxLabels).toBeUndefined();
    expect(opts.required).toBeUndefined();
  });

  it("ignores non-numeric min/max", () => {
    setupInputs({ label_min_count: "abc", label_max_count: "xyz" });
    const opts = loadLabelCountOptionsFromInputs();
    expect(opts.minLabels).toBeUndefined();
    expect(opts.maxLabels).toBeUndefined();
  });
});

describe("createLabelCountService", () => {
  it("validates labels using provided options", () => {
    const service = createLabelCountService({ minLabels: 1, maxLabels: 3 });
    expect(service.validate(["bug"]).valid).toBe(true);
    expect(service.validate([]).valid).toBe(false);
  });

  it("exposes options", () => {
    const options = { minLabels: 2 };
    const service = createLabelCountService(options);
    expect(service.options).toBe(options);
  });
});
