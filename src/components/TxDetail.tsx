"use client";
import { useState } from "react";
import { idr, dateId } from "@/lib/format";
type D = { id: string; type: string; amount: string; date: string; category: string | null; source: string | null; reason: string | null; description: string | null; before: string; after: string; sBefore: string; sAfter: string };
export default function TxDetail({ d }: { d: D }) {
  const [open, setOpen] = useState(false);
  const rows: [string, string][] = [["ID transaksi", d.id], ["Tanggal", dateId(new Date(d.date))], ["Jenis", d.type.replace("_", " ")], ["Nominal", idr(d.amount)], ["Kategori", d.category ?? "-"], ["Sumber", d.source ?? "-"], ["Alasan", d.reason ?? "-"], ["Deskripsi", d.description ?? "-"],
    ["Saldo kas", `${idr(d.before)} → ${idr(d.after)}`], ["Tabungan", `${idr(d.sBefore)} → ${idr(d.sAfter)}`]];
  return (<>
    <button onClick={() => setOpen(true)} className="mr-3 text-xs text-platinum hover:text-champagne">Detail</button>
    {open && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md space-y-2 rounded-2xl bg-obsidian p-5 text-sm"><h2 className="font-semibold text-champagne">Detail transaksi</h2>
        <dl className="space-y-1">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-platinum">{k}</dt><dd className="break-all text-right">{v}</dd></div>)}</dl>
        <button onClick={() => setOpen(false)} className="btn-gold mt-2 w-full">Tutup</button></div></div>}
  </>);
}
