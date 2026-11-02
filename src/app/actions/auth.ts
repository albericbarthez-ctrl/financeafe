"use server";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { db } from "@/lib/db";
import { getFlag } from "@/lib/settings";
import { limited } from "@/lib/ratelimit";

const RegisterSchema = z.object({
  fullName: z.string().min(2).max(80),
  username: z.string().regex(/^[a-z0-9_]{3,20}$/i, "3-20 karakter: huruf, angka, _"),
  email: z.string().email(),
  password: z.string().min(10, "Minimal 10 karakter").regex(/[A-Z]/, "Perlu huruf besar").regex(/[0-9]/, "Perlu angka"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama" });

export type FormState = { error?: string; ok?: string; fields?: Record<string, string[]> };
const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "";

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  if (await limited(`reg:${ip}`, 5)) return { error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." };
  if (!(await getFlag("registrationOpen"))) return { error: "Pendaftaran sedang ditutup" };
  const p = RegisterSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { fields: p.error.flatten().fieldErrors as Record<string, string[]> };
  const d = p.data;
  if (await db.user.findFirst({ where: { OR: [{ username: d.username.toLowerCase() }, { email: d.email.toLowerCase() }] } }))
    return { error: "Email atau username sudah terdaftar" };
  const { error } = await supabaseServer().auth.signUp({ email: d.email, password: d.password,
    options: { data: { full_name: d.fullName, username: d.username.toLowerCase() }, emailRedirectTo: `${site()}/auth/callback` } });
  if (error) return { error: error.message };
  await db.activityLog.create({ data: { userId: null, category: "AUTH", action: "REGISTER", ip, metadata: { email: d.email.toLowerCase(), username: d.username.toLowerCase() } } }).catch(() => {});
  return { ok: "Akun dibuat. Periksa email Anda untuk verifikasi." };
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  if (await limited(`login:${ip}`, 6)) return { error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." };
  const remember = fd.get("remember") === "on";
  const p = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Email atau password tidak valid" };
  const { data, error } = await supabaseServer({ sessionOnly: !remember }).auth.signInWithPassword({ email: p.data.email, password: p.data.password });
  if (error || !data.user) return { error: "Email atau password salah, atau email belum diverifikasi" };
  const dbu = await db.user.findUnique({ where: { id: data.user.id }, select: { status: true } });
  if (dbu?.status === "SUSPENDED") { await supabaseServer().auth.signOut(); return { error: "Akun Anda dinonaktifkan. Hubungi administrator." }; }
  cookies().set("fk_remember", remember ? "1" : "0", { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
  const ua = headers().get("user-agent")?.slice(0, 200) ?? null;
  await db.userSession.create({ data: { userId: data.user.id, ip, userAgent: ua } }).catch(() => {});
  await db.activityLog.create({ data: { userId: data.user.id, category: "AUTH", action: "LOGIN", ip } }).catch(() => {});
  redirect("/dashboard");
}

export async function logout() {
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  if (data.user) await db.activityLog.create({ data: { userId: data.user.id, category: "AUTH", action: "LOGOUT", ip: headers().get("x-forwarded-for") } }).catch(() => {});
  await sb.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  if (await limited(`forgot:${ip}`, 4, 300)) return { error: "Terlalu banyak permintaan. Coba lagi nanti." };
  const email = z.string().email().safeParse(fd.get("email"));
  if (email.success) await supabaseServer().auth.resetPasswordForEmail(email.data, { redirectTo: `${site()}/auth/callback?next=/reset-password` });
  return { ok: "Jika email terdaftar, tautan reset telah dikirim." };
}
