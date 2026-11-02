import { redirect } from "next/navigation";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { idr, dateId } from "@/lib/format";
import UserActions from "@/components/UserActions";
import Pager from "@/components/Pager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Administration" };
export default function Page({ searchParams }: { searchParams: { q?: string; role?: string; status?: string; sort?: string; page?: string } }) {
  return withShell(async (u) => {
    if (u.role === "USER") redirect("/dashboard"); // dicek ulang di server; aksi tetap dilindungi requireRole
    const q = searchParams.q?.trim();
    const where = { ...(q ? { OR: [{ username: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }, { fullName: { contains: q, mode: "insensitive" as const } }] } : {}),
      ...(searchParams.role && ["ADMIN", "USER", "FOUNDER"].includes(searchParams.role) ? { role: searchParams.role as "ADMIN" | "USER" | "FOUNDER" } : {}),
      ...(searchParams.status && ["ACTIVE", "SUSPENDED"].includes(searchParams.status) ? { status: searchParams.status as "ACTIVE" | "SUSPENDED" } : {}) };
    const page = Math.max(1, Number(searchParams.page) || 1), size = 20;
    const filtered = await db.user.count({ where });
    const [users, total, admins, active, txCount, savings, logs] = await Promise.all([
      db.user.findMany({ where, orderBy: { createdAt: searchParams.sort === "old" ? "asc" : "desc" }, skip: (page - 1) * size, take: size, include: { profile: { select: { avatarUrl: true } } } }), db.user.count(), db.user.count({ where: { role: "ADMIN" } }), db.user.count({ where: { status: "ACTIVE" } }),
      u.role === "FOUNDER" ? db.financialTransaction.count() : Promise.resolve(null), // Admin tidak melihat agregat keuangan
      u.role === "FOUNDER" ? db.wallet.aggregate({ _sum: { savings: true } }) : Promise.resolve(null),
      db.activityLog.findMany({ where: { category: { in: ["AUTH", "ADMIN"] } }, orderBy: { createdAt: "desc" }, take: 8 })]);
    const recent = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, username: true, email: true, createdAt: true, role: true } });
    const stats: [string, string][] = [["Akun terdaftar", String(total)], ["User aktif", String(active)], ["Administrator", String(admins)],
      ...(txCount !== null ? [["Total transaksi", String(txCount)], ["Total tabungan tercatat", idr(savings?._sum.savings ?? 0)]] as [string, string][] : [])];
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">{u.role === "FOUNDER" ? "Founder Dashboard" : "Admin Dashboard"}</h1>
      {u.role === "FOUNDER" && <div className="flex gap-3 text-sm"><a href="/founder/audit" className="rounded-xl border border-champagne/30 px-4 py-2">Audit Logs</a><a href="/founder/logs" className="rounded-xl border border-champagne/30 px-4 py-2">System logs</a><a href="/founder/system" className="rounded-xl border border-champagne/30 px-4 py-2">Sistem & status</a></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map(([l, v]) => <div key={l} className="glass rounded-2xl p-5"><p className="text-sm text-platinum">{l}</p><p className="text-2xl font-semibold tabular-nums text-champagne">{v}</p></div>)}</div>
      <section><h2 className="mb-2 text-lg font-semibold">Recent registrations</h2><ul className="glass space-y-1 rounded-2xl p-4 text-sm">{recent.map((x) => <li key={x.id} className="flex justify-between gap-3"><span>{x.username} <span className="text-platinum">({x.email})</span></span><span className="text-platinum">{dateId(x.createdAt)} · {x.role}</span></li>)}{!recent.length && <li className="text-platinum">Belum ada pendaftaran.</li>}</ul></section>
      <form className="flex flex-wrap gap-2"><input className="input max-w-xs" name="q" placeholder="Cari pengguna" defaultValue={q} />
        <select className="input max-w-[10rem]" name="role" defaultValue={searchParams.role ?? ""}><option value="">Semua role</option><option>USER</option><option>ADMIN</option><option>FOUNDER</option></select><select className="input max-w-[10rem]" name="status" defaultValue={searchParams.status ?? ""}><option value="">Semua status</option><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option></select><select className="input max-w-[10rem]" name="sort" defaultValue={searchParams.sort ?? "new"}><option value="new">Terbaru</option><option value="old">Terlama</option></select><button className="btn-gold">Cari</button></form>
      <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-left text-sm"><thead className="text-platinum"><tr>{["Foto", "Username", "Nama", "Email", "Role", "Daftar", "Status", "Aksi"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{users.map((x) => (<tr key={x.id} className="border-t border-white/5"><td className="p-3">{x.profile?.avatarUrl /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={x.profile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ivory to-gold text-xs font-semibold text-matte">{x.username[0]?.toUpperCase()}</span>}</td><td className="p-3"><a href={`/founder/user/${x.id}`} className="text-champagne hover:underline">{x.username}</a></td><td className="p-3">{x.fullName}</td><td className="p-3">{x.email}</td><td className="p-3">{x.role}</td><td className="p-3">{dateId(x.createdAt)}</td><td className="p-3">{x.status}</td>
          <td className="p-3"><UserActions id={x.id} role={x.role} status={x.status} actor={u.role} /></td></tr>))}</tbody></table></div>
      <Pager page={page} pages={Math.ceil(filtered / size)} base={`/founder?${new URLSearchParams(Object.entries({ q: searchParams.q, role: searchParams.role, status: searchParams.status, sort: searchParams.sort }).filter(([, v]) => v) as [string, string][])}`} />
      <section><h2 className="mb-2 text-lg font-semibold">Aktivitas sistem terbaru</h2><ul className="glass space-y-1 rounded-2xl p-4 text-sm">{logs.map((l) => <li key={l.id}>{l.createdAt.toLocaleString("id-ID")} — {l.category} / {l.action}</li>)}{!logs.length && <li className="text-platinum">Belum ada aktivitas.</li>}</ul></section>
    </div>);
  });
}
