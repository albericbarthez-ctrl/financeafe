"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/rbac";
import { db } from "@/lib/db";
import type { FormState } from "./auth";

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const p = z.object({ fullName: z.string().min(2).max(80), username: z.string().regex(/^[a-z0-9_]{3,20}$/i), bio: z.string().max(300).optional() }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Data profil tidak valid" };
  const taken = await db.user.findFirst({ where: { username: p.data.username.toLowerCase(), NOT: { id: u.id } } });
  if (taken) return { error: "Username sudah dipakai" };
  await db.$transaction([ // role tidak pernah dibaca dari input
    db.user.update({ where: { id: u.id }, data: { fullName: p.data.fullName, username: p.data.username.toLowerCase() } }),
    db.userProfile.upsert({ where: { userId: u.id }, update: { bio: p.data.bio ?? null }, create: { userId: u.id, bio: p.data.bio ?? null } }),
    db.activityLog.create({ data: { userId: u.id, category: "PROFILE", action: "PROFILE_UPDATE" } }),
  ]);
  revalidatePath("/profile");
  return { ok: "Profil diperbarui" };
}
