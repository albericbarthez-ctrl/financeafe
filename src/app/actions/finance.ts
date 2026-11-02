"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireUser } from "@/lib/rbac";
import { recordTransaction, LedgerError } from "@/services/ledger";
import { db } from "@/lib/db";
import type { FormState } from "./auth";

export async function addTransaction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const u = await requireUser();
    const o = Object.fromEntries(fd) as Record<string, string>;
    for (const k of Object.keys(o)) if (o[k] === "") delete o[k];
    await recordTransaction(u.id, o);
    ["/dashboard", "/finance", "/savings", "/goals", "/transactions"].forEach((p) => revalidatePath(p));
    return { ok: "Tersimpan" };
  } catch (e) {
    if (e instanceof LedgerError) return { error: e.message };
    if (e instanceof ZodError) return { error: e.issues[0]?.message ?? "Data tidak valid" };
    return { error: "Gagal menyimpan. Coba lagi." };
  }
}

export async function createGoal(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const name = String(fd.get("name") ?? "").trim();
  const target = String(fd.get("target") ?? "");
  if (name.length < 2 || !/^\d{1,16}(\.\d{1,2})?$/.test(target) || Number(target) <= 0) return { error: "Nama dan target harus valid" };
  const dl = fd.get("deadline") ? new Date(String(fd.get("deadline"))) : null;
  await db.savingsGoal.create({ data: { userId: u.id, name, targetAmount: target, deadline: dl, description: String(fd.get("description") ?? "") || null } });
  await db.activityLog.create({ data: { userId: u.id, category: "FINANCE", action: "GOAL_CREATE", metadata: { name } } });
  revalidatePath("/goals");
  return { ok: "Target dibuat" };
}

export async function deleteGoal(id: string) {
  const u = await requireUser();
  const g = await db.savingsGoal.findFirst({ where: { id, userId: u.id } });
  if (!g || g.currentAmount.gt(0)) return; // dana harus dikembalikan dulu lewat Reduce Funds
  await db.savingsGoal.delete({ where: { id } });
  revalidatePath("/goals");
}

/** Hapus ACTIVITY LOG milik sendiri. Tidak menyentuh transaksi/saldo. Audit log tidak punya jalur hapus. */
export async function deleteLogs(ids: string[] | "ALL") {
  const u = await requireUser();
  await db.activityLog.deleteMany({ where: { userId: u.id, ...(ids === "ALL" ? {} : { id: { in: ids } }) } });
  revalidatePath("/transactions");
}

import { deleteTransaction, editTransaction } from "@/services/ledger";
export async function deleteTx(id: string): Promise<{ error?: string }> {
  try {
    const u = await requireUser();
    await deleteTransaction(u.id, id);
    ["/dashboard", "/finance", "/savings", "/goals", "/transactions", "/reports"].forEach((p) => revalidatePath(p));
    return {};
  } catch (e) { return { error: e instanceof LedgerError ? e.message : "Gagal menghapus" }; }
}

export async function createCategory(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const name = String(fd.get("name") ?? "").trim().slice(0, 40);
  const kind = String(fd.get("kind"));
  if (name.length < 2 || !["INCOME", "EXPENSE", "SAVINGS"].includes(kind)) return { error: "Nama atau jenis tidak valid" };
  try { await db.category.create({ data: { userId: u.id, name, kind: kind as "INCOME" | "EXPENSE" | "SAVINGS" } }); }
  catch { return { error: "Kategori sudah ada" }; }
  revalidatePath("/finance"); revalidatePath("/savings");
  return { ok: "Kategori ditambahkan" };
}

export async function updateGoal(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const id = String(fd.get("id")), name = String(fd.get("name") ?? "").trim(), target = String(fd.get("target") ?? "");
  if (name.length < 2 || !/^\d{1,16}(\.\d{1,2})?$/.test(target) || Number(target) <= 0) return { error: "Data tidak valid" };
  const r = await db.savingsGoal.updateMany({ where: { id, userId: u.id }, data: { name, targetAmount: target, deadline: fd.get("deadline") ? new Date(String(fd.get("deadline"))) : null } });
  revalidatePath("/goals");
  return r.count ? { ok: "Target diperbarui" } : { error: "Target tidak ditemukan" };
}

/** Edit transaksi (nominal, tanggal, alasan, deskripsi). Jenis tetap. Snapshot saldo transaksi yang lebih baru tidak dihitung ulang. */
export async function updateTx(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const u = await requireUser();
    const id = String(fd.get("id"));
    await editTransaction(u.id, id, { amount: String(fd.get("amount") ?? ""), occurredAt: String(fd.get("occurredAt") ?? ""), reason: String(fd.get("reason") ?? "") || undefined, description: String(fd.get("description") ?? "") || undefined });
    ["/dashboard", "/finance", "/savings", "/goals", "/transactions", "/reports"].forEach((p) => revalidatePath(p));
    return { ok: "Diperbarui" };
  } catch (e) {
    if (e instanceof LedgerError) return { error: e.message };
    if (e instanceof ZodError) return { error: e.issues[0]?.message ?? "Data tidak valid" };
    return { error: "Gagal memperbarui" };
  }
}
