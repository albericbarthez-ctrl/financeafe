"use client";
import { useTransition } from "react";
import { setSystemFlag } from "@/app/actions/system";
import { toast } from "./Toast";
export default function FlagToggle({ k, on, label, hint }: { k: "registrationOpen" | "maintenanceMode"; on: boolean; label: string; hint: string }) {
  const [p, start] = useTransition();
  return (<div className="glass flex items-center justify-between gap-4 rounded-2xl p-5"><div><p className="font-medium">{label}</p><p className="text-sm text-platinum">{hint}</p></div>
    <button disabled={p} role="switch" aria-checked={on} onClick={() => confirm(`${on ? "Nonaktifkan" : "Aktifkan"} "${label}"?`) && start(async () => { try { await setSystemFlag(k, !on); toast("Pengaturan disimpan"); } catch { toast("Gagal menyimpan", "error"); } })}
      className={`h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${on ? "bg-champagne" : "bg-obsidian border border-platinum/40"}`}><span className={`block h-5 w-5 rounded-full bg-matte transition-transform ${on ? "translate-x-5" : ""} ${on ? "" : "bg-platinum"}`} /></button></div>);
}
