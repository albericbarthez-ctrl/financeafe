import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getCurrentUser } from "@/lib/rbac";
import { report, rangeDates } from "@/services/reports";
import { idr } from "@/lib/format";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const u = await getCurrentUser();
  if (!u || u.status !== "ACTIVE") return new NextResponse("Unauthorized", { status: 401 });
  const { from, to } = rangeDates(Object.fromEntries(req.nextUrl.searchParams)); const r = await report(u.id, from, to);
  const doc = new PDFDocument({ margin: 48, size: "A4" }); const chunks: Buffer[] = []; doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<void>((res) => doc.on("end", () => res()));
  doc.fillColor("#8f7743").fontSize(20).text("FINANCEKORN", { continued: false }); doc.fillColor("#000").fontSize(11).text(`Laporan keuangan — ${u.fullName}`).text(`Periode ${from.toISOString().slice(0, 10)} s/d ${to.toISOString().slice(0, 10)}`).moveDown();
  ([["Total income", idr(r.income)], ["Total expenses", idr(r.expense)], ["Net balance", idr(r.net)], ["Savings bersih", idr(r.savingsNet)], ["Savings ratio", `${r.savingsRatio.toFixed(1)}%`], ["Kategori pengeluaran terbesar", r.topCategory ?? "-"]] as const).forEach(([k, v]) => doc.text(`${k}: ${v}`));
  doc.moveDown().fontSize(13).text("Perbandingan bulanan").fontSize(10);
  r.months.forEach((m) => doc.text(`${m.month}   Income ${idr(m.income)}   Expense ${idr(m.expense)}   Savings ${idr(m.savings)}`));
  doc.moveDown().fontSize(13).text("Pengeluaran per kategori").fontSize(10); r.cats.forEach((c) => doc.text(`${c.name}: ${idr(c.value)}`));
  doc.end(); await done;
  return new NextResponse(Buffer.concat(chunks), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="financekorn-laporan.pdf"' } });
}
