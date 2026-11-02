import { notFound, redirect } from "next/navigation";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { dateId } from "@/lib/format";
export const dynamic = "force-dynamic";
export const metadata = { title: "Profil pengguna" };
// Hanya metadata akun. Data keuangan pribadi tidak ditampilkan di sini (hanya jumlah).
export default function Page({ params }: { params: { id: string } }) {
  return withShell(async (u) => {
    if (u.role === "USER") redirect("/dashboard");
    const x = await db.user.findUnique({ where: { id: params.id }, include: { profile: true, _count: { select: { transactions: true, goals: true } } } });
    if (!x) notFound();
    const rows: [string, string][] = [["User ID", x.id], ["Nama", x.fullName], ["Username", x.username], ["Email", x.email], ["Role", x.role], ["Status", x.status], ["Terdaftar", dateId(x.createdAt)], ["Jumlah transaksi", String(x._count.transactions)], ["Jumlah target", String(x._count.goals)]];
    return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Profil pengguna</h1><div className="glass flex items-center gap-4 rounded-2xl p-5">
      {x.profile?.avatarUrl /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={x.profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-ivory to-gold text-xl font-semibold text-matte">{x.username[0]?.toUpperCase()}</span>}
      <p className="text-platinum">{x.profile?.bio ?? "Belum ada bio."}</p></div>
      <dl className="glass space-y-1 rounded-2xl p-5 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-platinum">{k}</dt><dd className="break-all text-right">{v}</dd></div>)}</dl></div>);
  });
}
