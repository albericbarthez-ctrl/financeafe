import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { report, rangeDates } from "@/services/reports";
const esc = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""'); // cegah CSV/formula injection
export async function GET(req: NextRequest) {
  const u = await getCurrentUser();
  if (!u || u.status !== "ACTIVE") return new NextResponse("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(req.nextUrl.searchParams); const { from, to } = rangeDates(sp);
  const r = await report(u.id, from, to);
  const lines = ["Tanggal,Jenis,Kategori,Alasan,Nominal,Saldo sebelum,Saldo sesudah", ...r.txs.map((t) =>
    [t.occurredAt.toISOString().slice(0, 10), t.type, t.category?.name ?? "", t.reason ?? "", t.amount.toString(), t.balanceBefore.toString(), t.balanceAfter.toString()].map((c) => `"${esc(String(c))}"`).join(","))];
  return new NextResponse("\uFEFF" + lines.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="financekorn-laporan.csv"' } });
}
