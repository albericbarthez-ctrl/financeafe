import { redirect } from "next/navigation";
import { getCurrentUser } from "./rbac";
import Shell from "@/components/Shell";
import { db } from "./db";
import { getFlag } from "./settings";

/** Pembungkus halaman: otorisasi di server, lalu render dalam Shell. */
export async function withShell(render: (u: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<React.ReactNode>) {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  if (u.status === "SUSPENDED") redirect("/login");
  if (u.role === "USER" && (await getFlag("maintenanceMode"))) return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-semibold text-champagne">Sedang pemeliharaan</h1><p className="mt-2 text-platinum">Financekorn akan kembali sebentar lagi.</p></div></main>;
  const pr = await db.userProfile.findUnique({ where: { userId: u.id } });
  return <Shell user={{ username: u.username, fullName: u.fullName, role: u.role, avatarUrl: pr?.avatarUrl ?? null, displayMode: pr?.displayMode ?? "fullName" }} theme={pr?.theme ?? "dark"} reduced={pr?.reducedMotion ?? false}>{await render(u)}</Shell>;
}
