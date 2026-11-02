"use client";
import { useState } from "react";
export function strength(v: string) { return [v.length >= 10, /[A-Z]/.test(v), /[a-z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length; }
const L = ["Sangat lemah", "Lemah", "Cukup", "Baik", "Kuat", "Sangat kuat"];
export default function PasswordInput({ name, placeholder, autoComplete = "new-password", meter = true }: { name: string; placeholder: string; autoComplete?: string; meter?: boolean }) {
  const [v, setV] = useState(""); const s = strength(v);
  return (<div><input className="input" type="password" name={name} placeholder={placeholder} autoComplete={autoComplete} value={v} onChange={(e) => setV(e.target.value)} required />
    {meter && v && <div aria-live="polite" className="mt-1"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-1 flex-1 rounded ${i <= s ? (s < 3 ? "bg-red-400" : s < 5 ? "bg-gold" : "bg-champagne") : "bg-white/10"}`} />)}</div><p className="mt-1 text-xs text-platinum">Kekuatan: {L[s]}</p></div>}</div>);
}
