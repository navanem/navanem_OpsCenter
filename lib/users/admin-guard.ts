export function wouldLockOutLastAdmin(opts: {
  targetIsActiveAdmin: boolean;
  activeAdminCount: number;
}): boolean {
  if (!opts.targetIsActiveAdmin) return false;
  return opts.activeAdminCount <= 1;
}
