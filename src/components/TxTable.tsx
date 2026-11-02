"use client";
import { useTransition } from "react";
import { deleteTx } from "@/app/actions/finance";
import { idr, dateId } from "@/lib/format";
import EditTx from "./EditTx";
import TxDetail from "./TxDetail";
import { toast } from "./Toast";
type T = "INCOME" | "EXPENSE" | "SAVINGS_ADD" | "SAVINGS_REDUCE";
const style: Record<T, [string, string]> = { INCOME: ["+", "text-emerald-300/90"], SAVINGS_ADD: ["+", "text-champagne"], EXPENSE: ["−", "text-red-300"], SAVINGS_REDUCE: ["−", "text-platinum"] };
type Row = { id: string; type: T; amount: { toString(): string }; occurredAt: Date; reason: string | null; description?: string | null; source?: string | null; balanceBefore: { toString(): string }; balanceAfter: { toString(): string }; savingsBefore?: { toString(): string }; savingsAfter?: { toString(): string }; category: { name: string } | null };
export default function TxTable({ rows, deletable = true, savings = false }: { rows: Row[]; deletable?: boolean; savings?: boolean }) {
  const [p, start] = useTransition();
  if (!rows.length) return <p className="glass rounded-2xl p-8 text-center text-platinum">Belum ada transaksi. Tambahkan yang pertama dari formulir di atas.</p>;
  const del = (id: string) => confirm("Hapus transaksi ini? Saldo akan dikembalikan seperti sebelum transaksi.") && start(async () => { const r = await deleteTx(id); if (r.error) toast(r.error, "error"); else toast("Transaksi dihapus"); });
  return (
    <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-left text-sm">
      <thead className="text-platinum"><tr>{["Tanggal", "Jenis", "Kategori", "Alasan", "Nominal", savings ? "Tabungan sebelum" : "Saldo sebelum", savings ? "Tabungan sesudah" : "Saldo sesudah", ""].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-white/5">
        <td className="p-3">{dateId(r.occurredAt)}</td><td className="p-3">{r.type.replace("_", " ")}</td><td className="p-3">{r.category?.name ?? "-"}</td><td className="p-3">{r.reason ?? "-"}</td>
        <td className={`p-3 tabular-nums ${style[r.type][1]}`}>{style[r.type][0]}{idr(r.amount)}</td><td className="p-3 tabular-nums">{idr(savings ? (r.savingsBefore ?? 0) : r.balanceBefore)}</td><td className="p-3 tabular-nums">{idr(savings ? (r.savingsAfter ?? 0) : r.balanceAfter)}</td>
        <td className="whitespace-nowrap p-3"><TxDetail d={{ id: r.id, type: r.type, amount: r.amount.toString(), date: r.occurredAt.toISOString(), category: r.category?.name ?? null, source: r.source ?? null, reason: r.reason, description: r.description ?? null, before: r.balanceBefore.toString(), after: r.balanceAfter.toString(), sBefore: (r.savingsBefore ?? 0).toString(), sAfter: (r.savingsAfter ?? 0).toString() }} />{deletable && <EditTx amount={r.amount.toString()} id={r.id} date={r.occurredAt.toISOString().slice(0, 10)} reason={r.reason ?? ""} description={r.description ?? ""} />}{deletable && <button disabled={p} onClick={() => del(r.id)} className="text-xs text-platinum hover:text-red-300">Hapus</button>}</td></tr>))}</tbody>
    </table></div>);
}
