import { Role } from "@prisma/client";
import { db } from "./db";
import { supabaseServer } from "./supabase";
import { canChangeRole } from "./policy";

export class AuthError extends Error { constructor(public status: 401 | 403, msg: string) { super(msg); } }

/** Ambil user dari sesi Supabase, sinkronkan ke tabel User, tetapkan Founder di server. */
export async function getCurrentUser() {
  const { data } = await supabaseServer().auth.getUser();
  const au = data.user;
  if (!au || !au.email) return null;

  const founderEmail = process.env.FOUNDER_EMAIL?.toLowerCase();
  const isFounder = !!founderEmail && au.email.toLowerCase() === founderEmail && !!au.email_confirmed_at; // wajib terverifikasi

  let user = await db.user.findUnique({ where: { id: au.id } });
  if (!user) {
    const meta = au.user_metadata ?? {};
    let username = String(meta.username ?? au.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20) || "user";
    if (await db.user.findUnique({ where: { username } })) username = `${username.slice(0, 14)}_${au.id.replace(/-/g, "").slice(0, 5)}`; // hindari bentrok username
    user = await db.user.create({
      data: {
        id: au.id, email: au.email,
        username,
        fullName: String(meta.full_name ?? au.email.split("@")[0]),
        role: isFounder ? "FOUNDER" : "USER",
        profile: { create: {} }, wallet: { create: {} }, notif: { create: {} },
      },
    });
  } else if (au.email.toLowerCase() !== user.email.toLowerCase() && user.role !== "FOUNDER" && au.email_confirmed_at) {
    user = await db.user.update({ where: { id: user.id }, data: { email: au.email } }).catch(() => user!);
  }
  if (user && isFounder && user.role !== "FOUNDER") {
    user = await db.user.update({ where: { id: user.id }, data: { role: "FOUNDER" } });
  }
  return user;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new AuthError(401, "Belum login");
  if (u.status === "SUSPENDED") throw new AuthError(403, "Akun dinonaktifkan");
  return u;
}

export async function requireRole(...roles: Role[]) {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new AuthError(403, "Tidak memiliki izin");
  return u;
}

/** Hanya Founder; akun Founder tidak dapat diubah; tidak ada yang bisa dijadikan FOUNDER. */
export async function changeRole(targetId: string, newRole: "ADMIN" | "USER") {
  const actor = await requireRole("FOUNDER");
  const target = await db.user.findUniqueOrThrow({ where: { id: targetId } });
  if (!canChangeRole(actor.role, target.role, newRole) || target.email.toLowerCase() === process.env.FOUNDER_EMAIL?.toLowerCase())
    throw new AuthError(403, "Akun Founder tidak dapat diubah");
  await db.$transaction([
    db.user.update({ where: { id: targetId }, data: { role: newRole } }),
    db.auditLog.create({ data: { actorId: actor.id, targetId, action: "ROLE_CHANGE", detail: { from: target.role, to: newRole } } }),
  ]);
}
