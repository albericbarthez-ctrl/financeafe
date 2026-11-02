import { db } from "./db";
export type SysKey = "registrationOpen" | "maintenanceMode";
const DEFAULTS: Record<SysKey, boolean> = { registrationOpen: true, maintenanceMode: false };
export async function getFlag(key: SysKey): Promise<boolean> {
  const r = await db.systemSetting.findUnique({ where: { key } });
  return r ? r.value === "true" : DEFAULTS[key];
}
