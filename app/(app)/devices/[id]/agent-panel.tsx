"use client";

import { useState } from "react";

export function AgentPanel({
  token,
  reportUrl,
  windows,
  unix,
}: {
  token: string;
  reportUrl: string;
  windows: string;
  unix: string;
}) {
  const [os, setOs] = useState<"windows" | "unix">("windows");
  const [copied, setCopied] = useState(false);
  const script = os === "windows" ? windows : unix;

  function copy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const tabCls = (active: boolean) =>
    "rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors " +
    (active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]");

  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-1 sm:grid-cols-2">
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Report URL</span>
          <p className="font-mono text-xs break-all">{reportUrl}</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Agent token</span>
          <p className="font-mono text-xs break-all">{token}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-[var(--radius)] bg-[var(--muted)]/50 p-1">
          <button type="button" onClick={() => setOs("windows")} className={tabCls(os === "windows")}>Windows (PowerShell)</button>
          <button type="button" onClick={() => setOs("unix")} className={tabCls(os === "unix")}>Linux / macOS</button>
        </div>
        <button type="button" onClick={copy} className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--muted)]">
          {copied ? "Copied ✓" : "Copy script"}
        </button>
      </div>

      <pre className="max-h-80 overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/40 p-3 font-mono text-[11px] leading-relaxed">
        {script}
      </pre>

      <p className="text-xs text-[var(--muted-foreground)]">
        {os === "windows"
          ? "Save as opscenter-agent.ps1 on the workstation, then schedule it in Task Scheduler to run every 5 minutes (you may need to allow scripts: Set-ExecutionPolicy -Scope Process Bypass)."
          : "Save as opscenter-agent.sh, make it executable (chmod +x), then add it to cron, e.g. */5 * * * * /path/opscenter-agent.sh."}
      </p>
    </div>
  );
}
