import { redirect } from "next/navigation";
import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { getFlag } from "@/lib/settings";
import FlagToggle from "@/components/FlagToggle";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sistem" };
export default function Page() {
  return withShell(async (u) => {
    if (u.role !== "FOUNDER") redirect("/dashboard");
    const t0 = Date.now(); await db.$queryRaw`SELECT 1`; const latency = Date.now() - t0;
    const [reg, maint, users, txs, since] = await Promise.all([getFlag("registrationOpen"), getFlag("maintenanceMode"), db.user.count(), db.financialTransaction.count(), db.activityLog.count({ where: { category: "AUTH", action: "LOGIN", createdAt: { gte: new Date(Date.now() - 864e5) } } })]);
    const env = (v?: string) => (v ? "terkonfigurasi" : "BELUM DIISI");
    const rows: [string, string][] = [["Database", `terhubung (${latency} ms)`], ["Supabase URL", env(process.env.NEXT_PUBLIC_SUPABASE_URL)], ["Service role key", env(process.env.SUPABASE_SERVICE_ROLE_KEY)], ["Founder email", env(process.env.FOUNDER_EMAIL)], ["Site URL", env(process.env.NEXT_PUBLIC_SITE_URL)], ["Login 24 jam terakhir", String(since)], ["Akun / transaksi", `${users} / ${txs}`]];
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Pengaturan sistem & status</h1>
      <FlagToggle k="registrationOpen" on={reg} label="Pendaftaran terbuka" hint="Matikan untuk menolak registrasi akun baru." />
      <FlagToggle k="maintenanceMode" on={maint} label="Mode pemeliharaan" hint="User biasa melihat halaman pemeliharaan. Founder dan Admin tetap bisa masuk." />
      <div className="glass rounded-2xl p-5"><h2 className="mb-2 font-semibold text-champagne">Status sistem</h2><dl className="space-y-1 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-platinum">{k}</dt><dd>{v}</dd></div>)}</dl></div></div>);
  });
}
