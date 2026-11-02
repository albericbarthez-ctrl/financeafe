import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import SettingsForms from "@/components/SettingsForms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };
export default function Page() {
  return withShell(async (u) => {
    const [p, n, sess] = await Promise.all([db.userProfile.findUnique({ where: { userId: u.id } }), db.notificationPreference.findUnique({ where: { userId: u.id } }), db.userSession.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 10 })]);
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForms theme={p?.theme ?? "dark"} reducedMotion={p?.reducedMotion ?? false} displayMode={p?.displayMode ?? "fullName"} n={{ financial: n?.financial ?? true, savings: n?.savings ?? true, security: n?.security ?? true }} />
      <section className="glass rounded-2xl p-5"><h2 className="mb-2 font-semibold text-champagne">Sesi login terbaru</h2><ul className="space-y-1 text-sm">{sess.map((s) => <li key={s.id} className="flex justify-between gap-3"><span className="truncate">{s.userAgent ?? "Perangkat tidak dikenal"}</span><span className="shrink-0 text-platinum">{s.createdAt.toLocaleString("id-ID")} · {s.revokedAt ? "dikeluarkan" : "aktif"}</span></li>)}{!sess.length && <li className="text-platinum">Belum ada sesi tercatat.</li>}</ul></section></div>);
  });
}
