"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
// Pengaturan sistem eksklusif Founder; setiap perubahan masuk Audit Log.
export async function setSystemFlag(key: "registrationOpen" | "maintenanceMode", value: boolean) {
  const actor = await requireRole("FOUNDER");
  z.enum(["registrationOpen", "maintenanceMode"]).parse(key);
  await db.$transaction([
    db.systemSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } }),
    db.auditLog.create({ data: { actorId: actor.id, action: "SYSTEM_SETTING", detail: { key, value } } }),
  ]);
  revalidatePath("/founder/system");
}
