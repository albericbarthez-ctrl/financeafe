import { Prisma, TxType, type FinancialTransaction } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

const Money = z.string().regex(/^\d{1,16}(\.\d{1,2})?$/, "Nominal tidak valid")
  .transform((v) => new Prisma.Decimal(v)).refine((v) => v.gt(0), "Nominal harus lebih dari 0");

export const TxInput = z.object({
  type: z.nativeEnum(TxType), amount: Money, categoryId: z.string().optional(), source: z.string().max(120).optional(),
  reason: z.string().max(200).optional(), description: z.string().max(1000).optional(), occurredAt: z.coerce.date(), goalId: z.string().optional(),
});
type Input = z.infer<typeof TxInput>;
type Tx = Prisma.TransactionClient;
export class LedgerError extends Error {}

const lock = (tx: Tx, userId: string) => tx.$queryRaw`SELECT "userId" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE`;
// ReadCommitted + FOR UPDATE: transaksi paralel antre pada baris wallet dan membaca saldo terbaru (tanpa error serialisasi).
const SERIAL = { maxWait: 10_000, timeout: 20_000 };

/** Terapkan transaksi ke wallet (wallet sudah terkunci oleh pemanggil). */
async function applyIn(tx: Tx, userId: string, input: Input) {
  const w = await tx.wallet.findUniqueOrThrow({ where: { userId } });
  let balance = w.balance, savings = w.savings; const a = input.amount;
  switch (input.type) {
    case "INCOME": balance = balance.add(a); break;
    case "EXPENSE": if (a.gt(balance)) throw new LedgerError("Saldo tidak mencukupi"); balance = balance.sub(a); break;
    case "SAVINGS_ADD": if (a.gt(balance)) throw new LedgerError("Saldo tidak mencukupi untuk ditabung"); balance = balance.sub(a); savings = savings.add(a); break;
    case "SAVINGS_REDUCE": if (a.gt(savings)) throw new LedgerError("Pengurangan melebihi saldo tabungan"); savings = savings.sub(a); balance = balance.add(a); break;
  }
  if (input.goalId) {
    const goal = await tx.savingsGoal.findFirst({ where: { id: input.goalId, userId } }); // validasi kepemilikan
    if (!goal) throw new LedgerError("Target tidak ditemukan");
    if (input.type !== "SAVINGS_ADD" && input.type !== "SAVINGS_REDUCE") throw new LedgerError("Target hanya untuk transaksi tabungan");
    const next = input.type === "SAVINGS_ADD" ? goal.currentAmount.add(a) : goal.currentAmount.sub(a);
    if (next.lt(0)) throw new LedgerError("Dana target tidak mencukupi");
    await tx.savingsGoal.update({ where: { id: goal.id }, data: { currentAmount: next, status: next.gte(goal.targetAmount) ? "COMPLETED" : "ACTIVE" } });
  }
  await tx.wallet.update({ where: { userId }, data: { balance, savings } });
  return tx.financialTransaction.create({ data: { userId, ...input, balanceBefore: w.balance, balanceAfter: balance, savingsBefore: w.savings, savingsAfter: savings } });
}

/** Balikkan efek transaksi lama lalu hapus barisnya. */
async function reverseIn(tx: Tx, userId: string, t: FinancialTransaction) {
  const w = await tx.wallet.findUniqueOrThrow({ where: { userId } });
  let balance = w.balance, savings = w.savings; const a = t.amount;
  if (t.type === "INCOME") balance = balance.sub(a);
  else if (t.type === "EXPENSE") balance = balance.add(a);
  else if (t.type === "SAVINGS_ADD") { balance = balance.add(a); savings = savings.sub(a); }
  else { balance = balance.sub(a); savings = savings.add(a); }
  if (balance.lt(0) || savings.lt(0)) throw new LedgerError("Tidak dapat diubah/dihapus: saldo akan menjadi negatif");
  if (t.goalId) {
    const g = await tx.savingsGoal.findUnique({ where: { id: t.goalId } });
    if (g) { const cur = t.type === "SAVINGS_ADD" ? g.currentAmount.sub(a) : g.currentAmount.add(a);
      if (cur.lt(0)) throw new LedgerError("Dana target tidak cukup untuk pembalikan");
      await tx.savingsGoal.update({ where: { id: g.id }, data: { currentAmount: cur, status: cur.gte(g.targetAmount) ? "COMPLETED" : "ACTIVE" } }); }
  }
  await tx.wallet.update({ where: { userId }, data: { balance, savings } });
  await tx.financialTransaction.delete({ where: { id: t.id } });
}

export async function recordTransaction(userId: string, raw: unknown) {
  const input = TxInput.parse(raw);
  return db.$transaction(async (tx) => {
    await lock(tx, userId);
    const rec = await applyIn(tx, userId, input);
    await tx.activityLog.create({ data: { userId, category: "FINANCE", action: `TX_${input.type}`, metadata: { id: rec.id, amount: input.amount.toString() } } });
    return rec;
  }, SERIAL);
}

export async function deleteTransaction(userId: string, id: string) {
  return db.$transaction(async (tx) => {
    await lock(tx, userId);
    const t = await tx.financialTransaction.findFirst({ where: { id, userId } });
    if (!t) throw new LedgerError("Transaksi tidak ditemukan");
    await reverseIn(tx, userId, t);
    await tx.activityLog.create({ data: { userId, category: "FINANCE", action: "TX_DELETE", metadata: { id, type: t.type, amount: t.amount.toString() } } });
  }, SERIAL);
}

/** Ubah nominal (dan field lain) secara atomik: balikkan yang lama, terapkan yang baru. Jenis tidak berubah. */
export async function editTransaction(userId: string, id: string, raw: Record<string, string | undefined>) {
  return db.$transaction(async (tx) => {
    await lock(tx, userId);
    const old = await tx.financialTransaction.findFirst({ where: { id, userId } });
    if (!old) throw new LedgerError("Transaksi tidak ditemukan");
    const input = TxInput.parse({ type: old.type, categoryId: old.categoryId ?? undefined, goalId: old.goalId ?? undefined, source: old.source ?? undefined, ...raw });
    await reverseIn(tx, userId, old);
    const rec = await applyIn(tx, userId, input);
    await tx.activityLog.create({ data: { userId, category: "FINANCE", action: "TX_EDIT", metadata: { from: old.id, to: rec.id, oldAmount: old.amount.toString(), newAmount: input.amount.toString() } } });
    return rec;
  }, SERIAL);
}

export async function summary(userId: string, from: Date, to: Date) {
  const [w, rows] = await Promise.all([
    db.wallet.findUniqueOrThrow({ where: { userId } }),
    db.financialTransaction.groupBy({ by: ["type"], where: { userId, occurredAt: { gte: from, lte: to } }, _sum: { amount: true } }),
  ]);
  const sum = (t: TxType) => rows.find((r) => r.type === t)?._sum.amount ?? new Prisma.Decimal(0);
  return { balance: w.balance, savings: w.savings, netWorth: w.balance.add(w.savings), income: sum("INCOME"), expense: sum("EXPENSE") };
}
