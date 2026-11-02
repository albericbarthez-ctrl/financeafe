import { db } from "@/lib/db";

export const RANGES: Record<string, number> = { "7": 7, "30": 30, "90": 90, "180": 180, "365": 365 };
export function rangeDates(sp: { range?: string; from?: string; to?: string }) {
  if (sp.from && sp.to && !isNaN(+new Date(sp.from)) && !isNaN(+new Date(sp.to))) return { from: new Date(sp.from), to: new Date(sp.to + "T23:59:59") };
  const days = RANGES[sp.range ?? "30"] ?? 30; const to = new Date(); const from = new Date(to.getTime() - days * 864e5);
  return { from, to };
}

export async function report(userId: string, from: Date, to: Date) {
  const txs = await db.financialTransaction.findMany({ where: { userId, occurredAt: { gte: from, lte: to } }, orderBy: { occurredAt: "asc" }, include: { category: true } });
  const byMonth = new Map<string, { month: string; income: number; expense: number; savings: number }>();
  const byCat = new Map<string, number>(); const history: { date: string; balance: number }[] = [];
  let income = 0, expense = 0, savingsNet = 0, expCount = 0;
  for (const t of txs) {
    const n = Number(t.amount.toString()); const m = t.occurredAt.toISOString().slice(0, 7);
    const row = byMonth.get(m) ?? { month: m, income: 0, expense: 0, savings: 0 }; byMonth.set(m, row);
    if (t.type === "INCOME") { income += n; row.income += n; }
    else if (t.type === "EXPENSE") { expense += n; row.expense += n; expCount++; byCat.set(t.category?.name ?? "Lainnya", (byCat.get(t.category?.name ?? "Lainnya") ?? 0) + n); }
    else { const s = t.type === "SAVINGS_ADD" ? n : -n; savingsNet += s; row.savings += s; }
    history.push({ date: t.occurredAt.toISOString().slice(0, 10), balance: Number(t.balanceAfter.toString()) });
  }
  const cats = [...byCat].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  return { txs, income, expense, savingsNet, months: [...byMonth.values()], cats, history, expCount,
    avgExpense: expCount ? expense / expCount : 0, topCategory: cats[0]?.name ?? null, savingsRatio: income ? (savingsNet / income) * 100 : 0, net: income - expense };
}

/** Pembanding periode sebelumnya dengan durasi sama. */
export async function previous(userId: string, from: Date, to: Date) {
  const span = to.getTime() - from.getTime(); return report(userId, new Date(from.getTime() - span), from);
}
export const pct = (cur: number, prev: number) => (prev === 0 ? (cur === 0 ? 0 : 100) : ((cur - prev) / prev) * 100);

/** Statistik jumlah transaksi per jenis per bulan. */
export function txStats(txs: { type: string; occurredAt: Date }[]) {
  const m = new Map<string, { month: string; income: number; expense: number; savingsAdd: number; savingsReduce: number }>();
  for (const t of txs) {
    const k = t.occurredAt.toISOString().slice(0, 7); const r = m.get(k) ?? { month: k, income: 0, expense: 0, savingsAdd: 0, savingsReduce: 0 }; m.set(k, r);
    if (t.type === "INCOME") r.income++; else if (t.type === "EXPENSE") r.expense++; else if (t.type === "SAVINGS_ADD") r.savingsAdd++; else r.savingsReduce++;
  }
  return [...m.values()];
}
