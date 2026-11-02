// Jalankan setelah DATABASE_URL (database uji!) diisi:  npx tsx --test tests/ledger.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { recordTransaction, LedgerError } from "../src/services/ledger";
const db = new PrismaClient(); const id = "test-user-" + Date.now();
test.before(async () => { await db.user.create({ data: { id, email: `${id}@t.io`, username: id, fullName: "T", wallet: { create: {} } } }); });
test.after(async () => { await db.user.delete({ where: { id } }); await db.$disconnect(); });
const tx = (type: string, amount: string) => recordTransaction(id, { type, amount, occurredAt: "2026-01-01" });
test("income lalu menabung memindahkan saldo", async () => {
  await tx("INCOME", "1000000"); await tx("SAVINGS_ADD", "400000");
  const w = await db.wallet.findUniqueOrThrow({ where: { userId: id } }); assert.equal(w.balance.toString(), "600000"); assert.equal(w.savings.toString(), "400000");
});
test("menolak pengeluaran & pengurangan tabungan berlebih", async () => {
  await assert.rejects(tx("EXPENSE", "9999999"), LedgerError); await assert.rejects(tx("SAVINGS_REDUCE", "500000"), LedgerError);
});
test("20 transaksi paralel tidak merusak saldo", async () => {
  const before = (await db.wallet.findUniqueOrThrow({ where: { userId: id } })).balance;
  await Promise.allSettled(Array.from({ length: 20 }, () => tx("INCOME", "1000")));
  const n = await db.financialTransaction.count({ where: { userId: id, amount: "1000", type: "INCOME" } });
  const after = (await db.wallet.findUniqueOrThrow({ where: { userId: id } })).balance;
  assert.equal(after.sub(before).toString(), String(n * 1000));
});
