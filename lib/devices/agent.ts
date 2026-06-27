// A device is considered "online" if it reported within this window.
export const ONLINE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function isDeviceOnline(lastSeenAt: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!lastSeenAt) return false;
  return now.getTime() - new Date(lastSeenAt).getTime() <= ONLINE_WINDOW_MS;
}

export function mbToHuman(mb: number | null | undefined): string {
  if (mb == null) return "—";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export function pct(used: number | null | undefined, total: number | null | undefined): number | null {
  if (used == null || total == null || total === 0) return null;
  return Math.min(100, Math.round((used / total) * 100));
}

// Windows PowerShell agent. Reports a single snapshot to the OpsCenter API.
// Embed the per-device token + report URL. Intended to be scheduled (Task Scheduler) every few minutes.
export function buildWindowsAgent(token: string, reportUrl: string): string {
  return `# OpsCenter monitoring agent (Windows)
# Reports system metrics to OpsCenter. Schedule this to run every 5 minutes.
$Token = "${token}"
$Url   = "${reportUrl}"

$os   = Get-CimInstance Win32_OperatingSystem
$cpu  = Get-CimInstance Win32_Processor | Select-Object -First 1
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$ip   = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1).IPAddress
$totalMb = [math]::Round($os.TotalVisibleMemorySize / 1024)
$freeMb  = [math]::Round($os.FreePhysicalMemory / 1024)

$payload = @{
  agentVersion = "1.0"
  hostname     = $env:COMPUTERNAME
  ipAddress    = $ip
  osName       = $os.Caption
  osVersion    = $os.Version
  cpuModel     = $cpu.Name
  cpuPhysical  = $cpu.NumberOfCores
  cpuLogical   = $cpu.NumberOfLogicalProcessors
  cpuFreqMhz   = $cpu.MaxClockSpeed
  cpuUsagePct  = $cpu.LoadPercentage
  ramTotalMb   = $totalMb
  ramUsedMb    = $totalMb - $freeMb
  diskTotalMb  = [math]::Round($disk.Size / 1MB)
  diskUsedMb   = [math]::Round(($disk.Size - $disk.FreeSpace) / 1MB)
} | ConvertTo-Json

Invoke-RestMethod -Uri $Url -Method Post -Body $payload -ContentType "application/json" -Headers @{ "X-Agent-Token" = $Token }
`;
}

// Linux/macOS bash agent.
export function buildUnixAgent(token: string, reportUrl: string): string {
  return `#!/usr/bin/env bash
# OpsCenter monitoring agent (Linux/macOS). Schedule via cron, e.g. every 5 minutes.
TOKEN="${token}"
URL="${reportUrl}"

OS_NAME=$(uname -s); OS_VER=$(uname -r)
HOSTNAME=$(hostname)
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
CPU_LOGICAL=$(nproc 2>/dev/null || echo null)
MEM_TOTAL_MB=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo null)
MEM_AVAIL_MB=$(awk '/MemAvailable/ {printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)
MEM_USED_MB=$(( MEM_TOTAL_MB - MEM_AVAIL_MB ))
DISK_TOTAL_MB=$(df -m / | awk 'NR==2 {print $2}')
DISK_USED_MB=$(df -m / | awk 'NR==2 {print $3}')

curl -s -X POST "$URL" -H "Content-Type: application/json" -H "X-Agent-Token: $TOKEN" -d "{
  \\"agentVersion\\": \\"1.0\\",
  \\"hostname\\": \\"$HOSTNAME\\",
  \\"ipAddress\\": \\"$IP\\",
  \\"osName\\": \\"$OS_NAME\\",
  \\"osVersion\\": \\"$OS_VER\\",
  \\"cpuLogical\\": $CPU_LOGICAL,
  \\"ramTotalMb\\": $MEM_TOTAL_MB,
  \\"ramUsedMb\\": $MEM_USED_MB,
  \\"diskTotalMb\\": $DISK_TOTAL_MB,
  \\"diskUsedMb\\": $DISK_USED_MB
}"
`;
}
