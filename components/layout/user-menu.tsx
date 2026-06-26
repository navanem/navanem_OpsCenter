"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";

type Theme = "dark" | "light";

interface Labels {
  account: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  security: string;
  signOut: string;
}

export function UserMenu({
  name,
  email,
  roleName,
  locale,
  labels,
  setLocaleAction,
  logoutAction,
}: {
  name: string;
  email: string;
  roleName: string;
  locale: string;
  labels: Labels;
  setLocaleAction: (formData: FormData) => void | Promise<void>;
  logoutAction: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function applyTheme(next: Theme) {
    const el = document.documentElement;
    el.classList.remove("dark", "light");
    el.classList.add(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }

  const inits = (name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("") || "?").toUpperCase();

  const segBtn = (selected: boolean) =>
    "flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs font-medium transition-colors " +
    (selected ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labels.account}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] outline-none ring-offset-2 ring-offset-[var(--background)] transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {inits}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--background)] bg-[var(--card)] text-[var(--muted-foreground)]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9M4.6 11a1.7 1.7 0 0 0-.3-1.9" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-lg"
        >
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{email}</p>
            <span className="mt-1 inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
              {roleName}
            </span>
          </div>

          <div className="space-y-3 px-4 py-3">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{labels.language}</p>
              <div className="flex gap-1 rounded-[var(--radius)] bg-[var(--muted)]/50 p-1">
                {LOCALES.map((l) => (
                  <form key={l} action={setLocaleAction} className="flex-1">
                    <input type="hidden" name="locale" value={l} />
                    <button type="submit" className={segBtn(locale === l)}>{LOCALE_LABELS[l]}</button>
                  </form>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{labels.theme}</p>
              <div className="flex gap-1 rounded-[var(--radius)] bg-[var(--muted)]/50 p-1">
                <button type="button" onClick={() => applyTheme("light")} className={segBtn(theme === "light")}>{labels.light}</button>
                <button type="button" onClick={() => applyTheme("dark")} className={segBtn(theme === "dark")}>{labels.dark}</button>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] py-1">
            <Link href="/settings/security" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
              {labels.security}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10">
                {labels.signOut}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
