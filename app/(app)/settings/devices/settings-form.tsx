"use client";

import { useActionState } from "react";
import { updateDeviceSettingsAction, type DeviceSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function DeviceSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<DeviceSettingsState, FormData>(
    updateDeviceSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="devicesEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable device management
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track managed devices and assets (laptops, servers, network gear…) with type, status, serial, warranty, and client assignment. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
