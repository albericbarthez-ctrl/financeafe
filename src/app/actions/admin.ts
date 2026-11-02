"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/rbac";
import { canChangeRole, canSetStatus, canDeleteAccount } from "@/lib/policy";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase-admin";

const isFounderUser = (u: { role: string; email: string }) => u.role === "FOUNDER" || u.email.toLowerCase() === process.env.FOUNDER_EMAIL?.toLowerCase();
const adminLog = (actorId: string, action: string, metadata: object) => db.activityLog.create({ data: { userId: actorId, category: "ADMIN", action, metadata } });

export async function setRole(id: string, role: "ADMIN" | "USER") {
  z.enum(["ADMIN", "USER"]).parse(role);
  const actor = await requireRole("FOUNDER");
  const t = await db.user.findUniqueOrThrow({ where: { id } });
  if (isFounderUser(t) || !canChangeRole(actor.role, t.role, role)) throw new AuthError(403, "Perubahan role tidak diizinkan");
  await db.$transaction([
    db.user.update({ where: { id }, data: { role } }),
    db.auditLog.create({ data: { actorId: actor.id, targetId: id, action: "ROLE_CHANGE", detail: { from: t.role, to: role } } }),
    adminLog(actor.id, "ROLE_CHANGE", { target: t.username, from: t.role, to: role }),
  ]);
  revalidatePath("/founder");
}

export async function setStatus(id: string, status: "ACTIVE" | "SUSPENDED") {
  const actor = await requireRole("FOUNDER", "ADMIN");
  const t = await db.user.findUniqueOrThrow({ where: { id } });
  if (isFounderUser(t) || !canSetStatus(actor.role, t.role)) throw new AuthError(403, "Moderasi akun tidak diizinkan");
  await db.$transaction([
    db.user.update({ where: { id }, data: { status } }),
    db.auditLog.create({ data: { actorId: actor.id, targetId: id, action: `ACCOUNT_${status}` } }),
    adminLog(actor.id, `ACCOUNT_${status}`, { target: t.username }),
  ]);
  revalidatePath("/founder");
}

export async function deleteAccount(id: string) {
  const actor = await requireRole("FOUNDER");
  const t = await db.user.findUniqueOrThrow({ where: { id } });
  if (isFounderUser(t) || !canDeleteAccount(actor.role, t.role)) throw new AuthError(403, "Akun ini dilindungi");
  await db.auditLog.create({ data: { actorId: actor.id, targetId: id, action: "ACCOUNT_DELETE", detail: { email: t.email } } });
  await adminLog(actor.id, "ACCOUNT_DELETE", { target: t.username });
  await db.user.delete({ where: { id } });
  await supabaseAdmin().auth.admin.deleteUser(id);
  revalidatePath("/founder");
}
