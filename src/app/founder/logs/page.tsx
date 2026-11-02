import { redirect } from "next/navigation";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import Pager from "@/components/Pager";
export const dynamic = "force-dynamic";
export const metadata = { title: "System Activity Logs" };
type SP = { q?: string; cat?: string; user?: string; from?: string; to?: string; sort?: string; page?: string };
export default function Page({ searchParams }: { searchParams: SP }) {
  return withShell(async (u) => {
    if (u.role !== "FOUNDER") redirect("/dashboard");
    const page = Math.max(1, Number(searchParams.page) || 1); const range: { gte?: Date; lte?: Date } = {};
    if (searchParams.from) range.gte = new Date(searchParams.from); if (searchParams.to) range.lte = new Date(searchParams.to + "T23:59:59");
    const where = { ...(searchParams.q ? { action: { contains: searchParams.q, mode: "insensitive" as const } } : {}), ...(searchParams.cat ? { category: searchParams.cat } : {}),
      ...(searchParams.user ? { user: { username: { contains: searchParams.user, mode: "insensitive" as const } } } : {}), ...(range.gte || range.lte ? { createdAt: range } : {}) };
    const [rows, total] = await Promise.all([db.activityLog.findMany({ where, orderBy: { createdAt: searchParams.sort === "asc" ? "asc" : "desc" }, skip: (page - 1) * 30, take: 30, include: { user: { select: { username: true } } } }), db.activityLog.count({ where })]);
    const qs = new URLSearchParams(Object.entries(searchParams).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();
    return (<div className="space-y-4"><h1 className="text-2xl font-semibold">System Activity Logs</h1>
      <form className="flex flex-wrap gap-2 text-sm"><input className="input max-w-[11rem]" name="q" placeholder="Aktivitas" defaultValue={searchParams.q} /><input className="input max-w-[11rem]" name="user" placeholder="Username" defaultValue={searchParams.user} />
        <select className="input max-w-[10rem]" name="cat" defaultValue={searchParams.cat ?? ""}><option value="">Semua kategori</option>{["AUTH", "FINANCE", "PROFILE", "SECURITY", "SETTINGS", "ADMIN"].map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input max-w-[10rem]" type="date" name="from" defaultValue={searchParams.from} aria-label="Dari" /><input className="input max-w-[10rem]" type="date" name="to" defaultValue={searchParams.to} aria-label="Sampai" />
        <select className="input max-w-[9rem]" name="sort" defaultValue={searchParams.sort ?? "desc"}><option value="desc">Terbaru</option><option value="asc">Terlama</option></select><button className="btn-gold">Terapkan</button></form>
      <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-left text-sm"><thead className="text-platinum"><tr>{["Waktu", "User", "Kategori", "Aktivitas", "IP", "Metadata"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-white/5"><td className="p-3">{r.createdAt.toLocaleString("id-ID")}</td><td className="p-3">{r.user?.username ?? "-"}</td><td className="p-3">{r.category}</td><td className="p-3">{r.action}</td><td className="p-3">{r.ip ?? "-"}</td><td className="p-3 font-mono text-xs">{r.metadata ? JSON.stringify(r.metadata) : "-"}</td></tr>)}
          {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-platinum">Tidak ada aktivitas.</td></tr>}</tbody></table></div>
      <Pager page={page} pages={Math.ceil(total / 30)} base={`/founder/logs${qs ? "?" + qs : ""}`} /></div>);
  });
}
