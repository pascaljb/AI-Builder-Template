import { describe, it, expect } from "vitest";
import { cn, truncate, getInitials, invariant } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "end")).toBe("base end");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when under the limit", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("truncates and adds ellipsis when over the limit", () => {
    expect(truncate("a long string here", 10)).toBe("a long st…");
  });

  it("returns the string unchanged when exactly at the limit", () => {
    expect(truncate("exactly10!", 10)).toBe("exactly10!");
  });
});

describe("getInitials", () => {
  it("returns initials from a full name", () => {
    expect(getInitials("John Smith")).toBe("JS");
  });

  it("returns a single initial for a single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("limits to two initials for long names", () => {
    expect(getInitials("John Paul Smith")).toBe("JP");
  });
});

describe("invariant", () => {
  it("does not throw when condition is truthy", () => {
    expect(() => invariant(true, "should not throw")).not.toThrow();
  });

  it("throws when condition is falsy", () => {
    expect(() => invariant(false, "broke")).toThrow("Invariant failed: broke");
  });
});
