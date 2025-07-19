import { addNumbers } from "../src/tools/add";

describe("addNumbers", () => {
  it("adds positive integers", () => {
    expect(addNumbers(3, 4)).toBe(7);
  });

  it("handles negative values", () => {
    expect(addNumbers(-2, 5)).toBe(3);
  });

  it("works with floats", () => {
    expect(addNumbers(2.5, 3.1)).toBeCloseTo(5.6);
  });
});
