import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
  ghost: "bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)]",
  outline:
    "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
