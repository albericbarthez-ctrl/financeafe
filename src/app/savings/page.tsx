import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { categoriesFor } from "@/lib/categories";
import { parseTx, type TxSP } from "@/lib/txquery";
import TxForm from "@/components/TxForm";
import TxTable from "@/components/TxTable";
import TxFilters from "@/components/TxFilters";
import Pager from "@/components/Pager";
import { idr } from "@/lib/format";
import { report, pct } from "@/services/reports";
import { SavingsGrowth } from "@/components/Charts";
export const dynamic = "force-dynamic";
export const metadata = { title: "Savings" };
export default function Page({ searchParams }: { searchParams: TxSP }) {
  return withShell(async (u) => {
    const t = parseTx(u.id, searchParams, ["SAVINGS_ADD", "SAVINGS_REDUCE"]);
    const [cats, w, rows, total] = await Promise.all([categoriesFor(u.id, "SAVINGS"), db.wallet.findUniqueOrThrow({ where: { userId: u.id } }),
      db.financialTransaction.findMany({ where: t.where, orderBy: t.orderBy, skip: t.skip, take: t.size, include: { category: true } }), db.financialTransaction.count({ where: t.where })]);
    const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth(), 1), mp = new Date(now.getFullYear(), now.getMonth() - 1, 1), m6 = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [cur, prev, six] = await Promise.all([report(u.id, m0, now), report(u.id, mp, m0), report(u.id, m6, now)]);
    const growth = pct(cur.savingsNet, prev.savingsNet);
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Savings</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="glass rounded-2xl p-6"><p className="text-sm text-platinum">Total Savings</p><p className="text-3xl font-semibold tabular-nums text-champagne">{idr(w.savings)}</p></div>
        <div className="glass rounded-2xl p-6"><p className="text-sm text-platinum">Monthly Savings</p><p className="text-2xl font-semibold tabular-nums">{idr(cur.savingsNet)}</p></div>
        <div className="glass rounded-2xl p-6"><p className="text-sm text-platinum">Savings Growth</p><p className="text-2xl font-semibold tabular-nums">{growth >= 0 ? "+" : ""}{growth.toFixed(1)}%</p><p className="text-xs text-platinum">vs bulan lalu</p></div>
        <div className="glass rounded-2xl p-6"><p className="text-sm text-platinum">Savings Activity</p><p className="text-2xl font-semibold tabular-nums">{total} transaksi</p></div></div><SavingsGrowth data={six.months} />
      <div className="grid gap-4 md:grid-cols-2"><TxForm type="SAVINGS_ADD" label="Tambah tabungan" categories={cats} /><TxForm type="SAVINGS_REDUCE" label="Kurangi tabungan" /></div>
      <TxFilters action="/savings" types={["SAVINGS_ADD", "SAVINGS_REDUCE"]} sp={searchParams} /><TxTable rows={rows} savings /><Pager page={t.page} pages={Math.ceil(total / t.size)} base={`/savings${t.qs ? "?" + t.qs : ""}`} /></div>);
  });
}
