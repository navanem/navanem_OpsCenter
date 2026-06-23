import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("concatène les classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("résout les conflits Tailwind (la dernière gagne)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});
