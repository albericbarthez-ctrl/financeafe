import { withShell } from "@/lib/page";
import { summary } from "@/services/ledger";
import Magnetic from "@/components/Magnetic";
import { report, previous, rangeDates, pct, txStats } from "@/services/reports";
import { db } from "@/lib/db";
import { idr } from "@/lib/format";
import TxTable from "@/components/TxTable";
import Tilt from "@/components/Tilt";
import RangeFilter from "@/components/RangeFilter";
import SceneLoader from "@/components/three/SceneLoader";
import { IncomeExpense, SavingsGrowth, BalanceHistory, ExpenseDistribution, TxStats } from "@/components/Charts";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };
type SP = { range?: string; from?: string; to?: string };
export default function Dashboard({ searchParams }: { searchParams: SP }) {
  return withShell(async (u) => {
    const { from, to } = rangeDates(searchParams);
    const [s, r, p, recent] = await Promise.all([summary(u.id, from, to), report(u.id, from, to), previous(u.id, from, to),
      db.financialTransaction.findMany({ where: { userId: u.id }, orderBy: { occurredAt: "desc" }, take: 5, include: { category: true } })]);
    const cards: [string, { toString(): string }, number | null][] = [["Total Balance", s.balance, null], ["Total Savings", s.savings, pct(r.savingsNet, p.savingsNet)], ["Income", s.income, pct(r.income, p.income)], ["Expenses", s.expense, pct(r.expense, p.expense)], ["Net Worth", s.netWorth, null]];
    const sign = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
    return (<div className="space-y-6">
      <div className="relative h-44 overflow-hidden rounded-3xl border border-champagne/15"><div className="absolute inset-0"><SceneLoader compact /></div><h1 className="relative p-6 text-2xl font-semibold">Halo, {u.fullName}</h1></div>
      <RangeFilter action="/dashboard" range={searchParams.range} from={searchParams.from} to={searchParams.to} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([l, v, c]) => (
        <Tilt key={l} className="rounded-2xl p-6"><p className="text-sm text-platinum">{l}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-champagne">{idr(v)}</p>
          {c !== null && <p className="mt-1 text-xs text-platinum">{sign(c)} vs periode sebelumnya</p>}</Tilt>))}</section>
      <div className="flex flex-wrap gap-2 text-sm">{[["/finance", "Add Income"], ["/finance", "Add Expense"], ["/savings", "Add Savings"], ["/savings", "Reduce Savings"], ["/goals", "Create Savings Goal"]].map(([h, l]) => <Magnetic key={l}><Link href={h} className="block rounded-xl border border-champagne/30 px-4 py-2 hover:bg-champagne/10">{l}</Link></Magnetic>)}</div>
      <section className="glass rounded-2xl p-5"><h2 className="mb-3 font-semibold">Financial Insights</h2><ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li>Total pengeluaran periode ini: <b>{idr(r.expense)}</b> ({sign(pct(r.expense, p.expense))} dari periode sebelumnya)</li>
        <li>Rata-rata per pengeluaran: <b>{idr(r.avgExpense)}</b></li><li>Kategori pengeluaran terbesar: <b>{r.topCategory ?? "-"}</b></li>
        <li>Persentase tabungan dari pemasukan: <b>{r.savingsRatio.toFixed(1)}%</b></li><li>Pertumbuhan tabungan bersih: <b>{idr(r.savingsNet)}</b></li>
        <li>Selisih pemasukan − pengeluaran: <b>{idr(r.net)}</b></li></ul></section>
      <div className="grid gap-4 lg:grid-cols-2"><IncomeExpense data={r.months} /><SavingsGrowth data={r.months} /><BalanceHistory data={r.history} /><ExpenseDistribution data={r.cats} /><TxStats data={txStats(r.txs)} /></div>
      <section className="space-y-2"><div className="flex justify-between"><h2 className="text-lg font-semibold">Transaksi terbaru</h2><Link href="/transactions" className="text-sm text-champagne">View all</Link></div><TxTable rows={recent} deletable={false} /></section></div>);
  });
}
