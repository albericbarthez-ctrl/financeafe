"use client";
import { useEffect, useRef } from "react";
import { toast } from "@/components/Toast";
import { useFormState, useFormStatus } from "react-dom";
import { addTransaction } from "@/app/actions/finance";

type Opt = { id: string; name: string };
function Btn({ label }: { label: string }) { const { pending } = useFormStatus(); return <button className="btn-gold" disabled={pending}>{pending ? "Menyimpan..." : label}</button>; }

export default function TxForm({ type, label, categories = [], goals = [], sourceLabel }: {
  type: "INCOME" | "EXPENSE" | "SAVINGS_ADD" | "SAVINGS_REDUCE"; label: string; categories?: Opt[]; goals?: Opt[]; sourceLabel?: string }) {
  const [s, act] = useFormState(addTransaction, {}); const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (s.ok) { toast(s.ok); ref.current?.reset(); } else if (s.error) toast(s.error, "error"); }, [s]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form ref={ref} action={act} className="glass space-y-3 rounded-2xl p-5">
      <h2 className="font-semibold text-champagne">{label}</h2>
      <input type="hidden" name="type" value={type} />
      <input className="input" name="amount" inputMode="decimal" placeholder="Nominal (mis. 500000)" required />
      <input className="input" name="occurredAt" type="date" defaultValue={today} required />
      {categories.length > 0 && <select className="input" name="categoryId"><option value="">Kategori</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
      {sourceLabel && <input className="input" name="source" placeholder={sourceLabel} />}
      {goals.length > 0 && <select className="input" name="goalId"><option value="">Tanpa target</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>}
      <input className="input" name="reason" placeholder="Alasan" />
      <textarea className="input" name="description" placeholder="Deskripsi" rows={2} />
      {s.error && <p role="alert" className="text-sm text-red-300">{s.error}</p>}
      {s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}
      <Btn label="Simpan" />
    </form>
  );
}
