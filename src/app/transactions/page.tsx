import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import Pager from "@/components/Pager";
import TxFilters from "@/components/TxFilters";
import { parseTx } from "@/lib/txquery";
import TxTable from "@/components/TxTable";
import LogsTable from "@/components/LogsTable";
export const dynamic = "force-dynamic";
export const metadata = { title: "Transactions / Logs" };
export default function Page({ searchParams }: { searchParams: { q?: string; type?: string; sort?: string; page?: string; lq?: string; lcat?: string; lsort?: string; lact?: string; lpage?: string; from?: string; to?: string } }) {
  return withShell(async (u) => {
    const page = Math.max(1, Number(searchParams.page) || 1), size = 20;
    const lpage = Math.max(1, Number(searchParams.lpage) || 1);
    const lwhere = { userId: u.id, ...(searchParams.lq ? { action: { contains: searchParams.lq, mode: "insensitive" as const } } : {}), ...(searchParams.lcat ? { category: searchParams.lcat } : {}), ...(searchParams.lact ? { action: searchParams.lact } : {}),
      ...(searchParams.from || searchParams.to ? { createdAt: { ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}), ...(searchParams.to ? { lte: new Date(searchParams.to + "T23:59:59") } : {}) } } : {}) };
    const t = parseTx(u.id, { q: searchParams.q, type: searchParams.type, from: searchParams.from, to: searchParams.to, sort: searchParams.sort, page: searchParams.page }, ["INCOME", "EXPENSE", "SAVINGS_ADD", "SAVINGS_REDUCE"]);
    const total = await db.financialTransaction.count({ where: t.where });
    const [rows, logs] = await Promise.all([
      db.financialTransaction.findMany({ where: t.where, orderBy: t.orderBy, skip: (page - 1) * size, take: size, include: { category: true } }),
      db.activityLog.findMany({ where: lwhere, orderBy: { createdAt: searchParams.lsort === "asc" ? "asc" : "desc" }, skip: (lpage - 1) * 20, take: 20 })]);
    const ltotal = await db.activityLog.count({ where: lwhere });
    const actions = (await db.activityLog.findMany({ where: { userId: u.id }, distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } })).map((a) => a.action);
    return (<div className="space-y-8"><section className="space-y-3"><h1 className="text-2xl font-semibold">Riwayat transaksi</h1><TxFilters action="/transactions" types={["INCOME", "EXPENSE", "SAVINGS_ADD", "SAVINGS_REDUCE"]} sp={searchParams} /><TxTable rows={rows} /><Pager page={page} pages={Math.ceil(total / size)} base={`/transactions${t.qs ? "?" + t.qs : ""}`} /></section>
      <section className="space-y-3"><h2 className="text-xl font-semibold">System activity logs</h2>
        <form className="flex flex-wrap gap-2 text-sm"><input className="input max-w-[12rem]" name="lq" placeholder="Cari aktivitas" defaultValue={searchParams.lq} />
          <select className="input max-w-[10rem]" name="lcat" defaultValue={searchParams.lcat ?? ""}><option value="">Semua kategori</option>{["AUTH", "FINANCE", "PROFILE", "SECURITY", "SETTINGS", "ADMIN"].map((c) => <option key={c}>{c}</option>)}</select>
          <select className="input max-w-[11rem]" name="lact" defaultValue={searchParams.lact ?? ""}><option value="">Semua jenis aktivitas</option>{actions.map((a) => <option key={a}>{a}</option>)}</select>
          <select className="input max-w-[10rem]" name="lsort" defaultValue={searchParams.lsort ?? "desc"}><option value="desc">Terbaru</option><option value="asc">Terlama</option></select><button className="btn-gold">Terapkan</button></form>
        <LogsTable logs={logs.map((l) => ({ id: l.id, category: l.category, action: l.action, at: l.createdAt.toLocaleString("id-ID"), ip: l.ip, meta: l.metadata ? JSON.stringify(l.metadata) : null }))} />
        <Pager page={lpage} param="lpage" pages={Math.ceil(ltotal / 20)} base={`/transactions?${new URLSearchParams(Object.entries({ lq: searchParams.lq, lcat: searchParams.lcat, lsort: searchParams.lsort, lact: searchParams.lact, from: searchParams.from, to: searchParams.to, page: searchParams.page }).filter(([, v]) => v) as [string, string][])}`} /></section></div>);
  });
}
