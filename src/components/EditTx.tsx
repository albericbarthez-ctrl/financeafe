"use client";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { updateTx } from "@/app/actions/finance";
import { toast } from "./Toast";
export default function EditTx({ id, date, reason, description, amount }: { id: string; date: string; reason: string; description: string; amount: string }) {
  const [open, setOpen] = useState(false); const [s, act] = useFormState(updateTx, {});
  useEffect(() => { if (s.ok) { toast(s.ok); setOpen(false); } else if (s.error) toast(s.error, "error"); }, [s]);
  return (<>
    <button onClick={() => setOpen(true)} className="mr-3 text-xs text-platinum hover:text-champagne">Edit</button>
    {open && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
      <form action={act} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md space-y-3 rounded-2xl bg-obsidian p-5">
        <h2 className="font-semibold text-champagne">Edit transaksi</h2><input type="hidden" name="id" value={id} />
        <input className="input" name="amount" inputMode="decimal" defaultValue={amount} placeholder="Nominal" required /><input className="input" type="date" name="occurredAt" defaultValue={date} required /><input className="input" name="reason" defaultValue={reason} placeholder="Alasan" />
        <textarea className="input" name="description" defaultValue={description} rows={3} placeholder="Deskripsi" />
        <p className="text-xs text-platinum">Jenis transaksi tetap. Saldo dihitung ulang secara atomik; ditolak bila hasilnya negatif.</p>
        <div className="flex gap-2"><button className="btn-gold">Simpan</button><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-champagne/30 px-4">Batal</button></div></form></div>}
  </>);
}
