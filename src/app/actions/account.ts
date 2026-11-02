"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/rbac";
import { db } from "@/lib/db";
import { supabaseServer } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { FormState } from "./auth";

export async function savePreferences(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const theme = fd.get("theme") === "light" ? "light" : "dark"; const displayMode = fd.get("displayMode") === "username" ? "username" : "fullName";
  await db.$transaction([
    db.userProfile.upsert({ where: { userId: u.id }, update: { theme, displayMode, reducedMotion: fd.get("reducedMotion") === "on" }, create: { userId: u.id, theme, displayMode, reducedMotion: fd.get("reducedMotion") === "on" } }),
    db.notificationPreference.upsert({ where: { userId: u.id }, update: { financial: fd.get("financial") === "on", savings: fd.get("savings") === "on", security: fd.get("security") === "on" }, create: { userId: u.id, financial: fd.get("financial") === "on", savings: fd.get("savings") === "on", security: fd.get("security") === "on" } }),
    db.activityLog.create({ data: { userId: u.id, category: "SETTINGS", action: "SETTINGS_UPDATE" } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: "Pengaturan disimpan" };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const p = z.object({ current: z.string().min(1), next: z.string().min(10).regex(/[A-Z]/).regex(/[0-9]/), confirm: z.string() }).refine((d) => d.next === d.confirm).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Password baru minimal 10 karakter, ada huruf besar dan angka, dan konfirmasi harus sama" };
  const sb = supabaseServer();
  const chk = await sb.auth.signInWithPassword({ email: u.email, password: p.data.current });
  if (chk.error) return { error: "Password saat ini salah" };
  const { error } = await sb.auth.updateUser({ password: p.data.next });
  if (error) return { error: error.message };
  await db.activityLog.create({ data: { userId: u.id, category: "SECURITY", action: "PASSWORD_CHANGE" } });
  return { ok: "Password diperbarui" };
}

export async function logoutOthers(): Promise<FormState> {
  const u = await requireUser();
  await supabaseServer().auth.signOut({ scope: "others" });
  const latest = await db.userSession.findFirst({ where: { userId: u.id, revokedAt: null }, orderBy: { createdAt: "desc" } });
  await db.userSession.updateMany({ where: { userId: u.id, revokedAt: null, ...(latest ? { id: { not: latest.id } } : {}) }, data: { revokedAt: new Date() } });
  await db.activityLog.create({ data: { userId: u.id, category: "SECURITY", action: "LOGOUT_OTHER_SESSIONS" } });
  return { ok: "Sesi lain telah dikeluarkan" };
}

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export async function uploadAvatar(fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const f = fd.get("file");
  if (!(f instanceof File)) return { error: "File tidak ditemukan" };
  if (!TYPES[f.type]) return { error: "Format harus JPG, PNG, atau WEBP" };
  if (f.size > 2 * 1024 * 1024) return { error: "Ukuran maksimal 2 MB" };
  const buf = Buffer.from(await f.arrayBuffer());
  const sig = buf.subarray(0, 4).toString("hex"); // validasi magic bytes, bukan hanya MIME dari klien
  const ok = (f.type === "image/png" && sig === "89504e47") || (f.type === "image/jpeg" && sig.startsWith("ffd8ff")) || (f.type === "image/webp" && buf.subarray(0, 4).toString() === "RIFF");
  if (!ok) return { error: "Isi file bukan gambar yang valid" };
  const path = `${u.id}/avatar-${Date.now()}.${TYPES[f.type]}`;
  const sb = supabaseAdmin();
  const up = await sb.storage.from("avatars").upload(path, buf, { contentType: f.type, upsert: true });
  if (up.error) return { error: "Upload gagal. Pastikan bucket 'avatars' (public) sudah dibuat." };
  const url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  await db.$transaction([db.userProfile.upsert({ where: { userId: u.id }, update: { avatarUrl: url }, create: { userId: u.id, avatarUrl: url } }), db.activityLog.create({ data: { userId: u.id, category: "PROFILE", action: "AVATAR_UPDATE" } })]);
  revalidatePath("/", "layout");
  return { ok: "Foto profil diperbarui" };
}

export async function removeAvatar(): Promise<FormState> {
  const u = await requireUser();
  await db.userProfile.update({ where: { userId: u.id }, data: { avatarUrl: null } });
  revalidatePath("/", "layout");
  return { ok: "Foto profil dihapus" };
}

export async function changeEmail(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  if (u.role === "FOUNDER") return { error: "Email Founder dilindungi dan tidak dapat diubah" };
  const e = z.string().email().safeParse(fd.get("email"));
  if (!e.success) return { error: "Email tidak valid" };
  if (e.data.toLowerCase() === process.env.FOUNDER_EMAIL?.toLowerCase()) return { error: "Email ini tidak dapat digunakan" };
  if (await db.user.findFirst({ where: { email: e.data.toLowerCase(), NOT: { id: u.id } } })) return { error: "Email sudah terdaftar" };
  const { error } = await supabaseServer().auth.updateUser({ email: e.data }, { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/settings` });
  if (error) return { error: error.message };
  await db.activityLog.create({ data: { userId: u.id, category: "SECURITY", action: "EMAIL_CHANGE_REQUESTED" } });
  return { ok: "Kami mengirim tautan verifikasi. Email berubah setelah diverifikasi." };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ next: z.string().min(10).regex(/[A-Z]/).regex(/[0-9]/), confirm: z.string() }).refine((d) => d.next === d.confirm).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Minimal 10 karakter, ada huruf besar dan angka, dan konfirmasi harus sama" };
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return { error: "Tautan reset tidak valid atau kedaluwarsa. Minta tautan baru." };
  const { error } = await sb.auth.updateUser({ password: p.data.next });
  if (error) return { error: error.message };
  await db.activityLog.create({ data: { userId: data.user.id, category: "SECURITY", action: "PASSWORD_RESET" } }).catch(() => {});
  return { ok: "Password diperbarui. Anda dapat masuk dengan password baru." };
}
