import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("affiche son contenu", () => {
    render(<Button>Enregistrer</Button>);
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDefined();
  });

  it("applique la variante primary par défaut", () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole("button", { name: "OK" });
    expect(btn.className).toContain("bg-[var(--primary)]");
  });
});
