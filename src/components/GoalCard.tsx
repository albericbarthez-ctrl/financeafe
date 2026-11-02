"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { deleteGoal, updateGoal } from "@/app/actions/finance";
export default function GoalCard({ id, name, pct, current, target, deadline, rawTarget, deadlineIso, status }: { status: string; id: string; name: string; pct: number; current: string; target: string; deadline: string | null; rawTarget: string; deadlineIso: string }) {
  const [edit, setEdit] = useState(false); const [s, act] = useFormState(updateGoal, {});
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="glass flex flex-wrap items-center gap-5 rounded-2xl p-5">
      <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`${pct}%`}>
        <circle cx="48" cy="48" r={r} stroke="#2a2a2a" strokeWidth="8" fill="none" />
        <circle cx="48" cy="48" r={r} stroke="#D6C39A" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset .8s" }} />
        <text x="48" y="53" textAnchor="middle" fill="#F0E7D5" fontSize="18" fontWeight="600">{pct}%</text>
      </svg>
      <div className="flex-1"><p className="font-semibold">{name}</p><p className="text-sm tabular-nums text-platinum">{current} / {target}</p><div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded bg-gradient-to-r from-gold to-ivory" style={{ width: `${pct}%`, transition: "width .8s" }} /></div><span className="mt-1 inline-block rounded-full border border-champagne/30 px-2 text-xs text-champagne">{status === "COMPLETED" ? "Tercapai" : status === "CANCELLED" ? "Dibatalkan" : "Aktif"}</span>{deadline && <p className="text-xs text-platinum">Tenggat {deadline}</p>}</div>
      <button onClick={() => setEdit(!edit)} className="text-xs text-platinum hover:text-champagne">Edit</button>
      <button onClick={() => confirm("Hapus target ini?") && deleteGoal(id)} className="text-xs text-platinum hover:text-red-300">Hapus</button>
      {edit && <form action={act} className="basis-full space-y-2"><input type="hidden" name="id" value={id} /><input className="input" name="name" defaultValue={name} required /><input className="input" name="target" defaultValue={rawTarget} inputMode="decimal" required /><input className="input" type="date" name="deadline" defaultValue={deadlineIso} />{s.error && <p className="text-sm text-red-300">{s.error}</p>}{s.ok && <p className="text-sm text-champagne">{s.ok}</p>}<button className="btn-gold">Simpan target</button></form>}
    </div>
  );
}
