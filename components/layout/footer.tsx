import { APP_VERSION, SUNITECH_URL } from "@/lib/version";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted-foreground)]">
      <span>
        Navanem OpsCenter by{" "}
        <a
          href={SUNITECH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
        >
          Sunitech
        </a>{" "}
        · v{APP_VERSION} · © {year} Sunitech. All rights reserved.
      </span>
    </footer>
  );
}
