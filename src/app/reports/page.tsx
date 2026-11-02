import Link from "next/link";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { report, previous, rangeDates, pct } from "@/services/reports";
import { idr } from "@/lib/format";
import RangeFilter from "@/components/RangeFilter";
import PrintButton from "@/components/PrintButton";
import { IncomeExpense, SavingsGrowth, ExpenseDistribution } from "@/components/Charts";
export const dynamic = "force-dynamic";
export const metadata = { title: "Reports & Analytics" };
export default function Page({ searchParams }: { searchParams: { range?: string; from?: string; to?: string } }) {
  return withShell(async (u) => {
    const { from, to } = rangeDates(searchParams);
    const [r, p, goals] = await Promise.all([report(u.id, from, to), previous(u.id, from, to), db.savingsGoal.findMany({ where: { userId: u.id } })]);
    const done = goals.filter((g) => g.status === "COMPLETED").length;
    const qs = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v) as [string, string][]).toString();
    const g = pct(r.income, p.income), sg = pct(r.savingsNet, p.savingsNet);
    const rows: [string, string][] = [["Total income", idr(r.income)], ["Income growth", `${g >= 0 ? "+" : ""}${g.toFixed(1)}%`], ["Total expenses", idr(r.expense)], ["Pengeluaran terbesar", r.cats[0] ? `${r.cats[0].name} (${idr(r.cats[0].value)})` : "-"],
      ["Net balance", idr(r.net)], ["Savings ratio", `${r.savingsRatio.toFixed(1)}%`], ["Savings bersih", idr(r.savingsNet)], ["Pertumbuhan savings", `${sg >= 0 ? "+" : ""}${sg.toFixed(1)}%`], ["Savings goal tercapai", `${done} dari ${goals.length}`]];
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Reports & Analytics</h1>
      <div className="flex flex-wrap items-end gap-3 print:hidden"><RangeFilter action="/reports" range={searchParams.range} from={searchParams.from} to={searchParams.to} />
        <a href={`/reports/export?${qs}`} className="rounded-xl border border-champagne/30 px-4 py-2 text-sm">Ekspor CSV</a><a href={`/reports/pdf?${qs}`} className="rounded-xl border border-champagne/30 px-4 py-2 text-sm">Unduh PDF</a><PrintButton /><Link href="/savings" className="text-sm text-champagne">Savings history</Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map(([l, v]) => <div key={l} className="glass rounded-2xl p-5"><p className="text-sm text-platinum">{l}</p><p className="text-xl font-semibold tabular-nums text-champagne">{v}</p></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><IncomeExpense data={r.months} /><SavingsGrowth data={r.months} /><ExpenseDistribution data={r.cats} /></div>
      <section className="glass overflow-x-auto rounded-2xl"><h2 className="p-4 font-semibold">Monthly comparison</h2><table className="w-full text-left text-sm"><thead className="text-platinum"><tr>{["Bulan", "Income", "Expenses", "Net", "Savings"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{r.months.map((m) => <tr key={m.month} className="border-t border-white/5"><td className="p-3">{m.month}</td><td className="p-3 tabular-nums">{idr(m.income)}</td><td className="p-3 tabular-nums">{idr(m.expense)}</td><td className="p-3 tabular-nums">{idr(m.income - m.expense)}</td><td className="p-3 tabular-nums">{idr(m.savings)}</td></tr>)}
          {!r.months.length && <tr><td colSpan={5} className="p-6 text-center text-platinum">Belum ada data pada periode ini.</td></tr>}</tbody></table></section></div>);
  });
}
