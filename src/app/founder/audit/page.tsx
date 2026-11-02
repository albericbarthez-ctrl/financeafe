import { redirect } from "next/navigation";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import Pager from "@/components/Pager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Audit Logs" };
export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return withShell(async (u) => {
    if (u.role !== "FOUNDER") redirect("/dashboard");
    const page = Math.max(1, Number(searchParams.page) || 1); const where = searchParams.q ? { action: { contains: searchParams.q, mode: "insensitive" as const } } : {};
    const [rows, total] = await Promise.all([db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 30, take: 30 }), db.auditLog.count({ where })]);
    const ids = [...new Set(rows.flatMap((r) => [r.actorId, r.targetId]).filter(Boolean))] as string[];
    const names = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } })).map((x) => [x.id, x.username]));
    return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Audit Logs</h1><p className="text-sm text-platinum">Catatan keamanan bersifat hanya-tambah; tidak ada fitur hapus.</p>
      <form className="flex gap-2"><input className="input max-w-xs" name="q" placeholder="Cari aksi" defaultValue={searchParams.q} /><button className="btn-gold">Cari</button></form>
      <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-left text-sm"><thead className="text-platinum"><tr>{["Waktu", "Pelaku", "Target", "Aksi", "Detail"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-white/5"><td className="p-3">{r.createdAt.toLocaleString("id-ID")}</td><td className="p-3">{(r.actorId && names.get(r.actorId)) || r.actorId || "-"}</td><td className="p-3">{(r.targetId && names.get(r.targetId)) || r.targetId || "-"}</td><td className="p-3">{r.action}</td><td className="p-3 font-mono text-xs">{r.detail ? JSON.stringify(r.detail) : "-"}</td></tr>)}
          {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-platinum">Belum ada catatan audit.</td></tr>}</tbody></table></div>
      <Pager page={page} pages={Math.ceil(total / 30)} base={`/founder/audit${searchParams.q ? "?q=" + encodeURIComponent(searchParams.q) : ""}`} /></div>);
  });
}
