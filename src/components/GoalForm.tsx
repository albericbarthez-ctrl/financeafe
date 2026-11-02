"use client";
import { useEffect } from "react";
import { toast } from "@/components/Toast";
import { useFormState } from "react-dom";
import { createGoal } from "@/app/actions/finance";
export default function GoalForm() {
  const [s, act] = useFormState(createGoal, {});
  useEffect(() => { if (s.ok) toast(s.ok); else if (s.error) toast(s.error, "error"); }, [s]);
  return (
    <form action={act} className="glass space-y-3 rounded-2xl p-5">
      <h2 className="font-semibold text-champagne">Buat target tabungan</h2>
      <input className="input" name="name" placeholder="Nama target (mis. Dana darurat)" required />
      <input className="input" name="target" inputMode="decimal" placeholder="Nominal target" required />
      <input className="input" name="deadline" type="date" />
      <textarea className="input" name="description" placeholder="Deskripsi" rows={2} />
      {s.error && <p role="alert" className="text-sm text-red-300">{s.error}</p>}{s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}
      <button className="btn-gold">Buat target</button>
    </form>
  );
}
