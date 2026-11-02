"use client";
import { useEffect, useState } from "react";
export const toast = (message: string, kind: "ok" | "error" = "ok") => window.dispatchEvent(new CustomEvent("fk-toast", { detail: { message, kind } }));
export default function ToastHost() {
  const [items, setItems] = useState<{ id: number; message: string; kind: string }[]>([]);
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail; const id = Date.now() + Math.random(); setItems((x) => [...x, { id, ...d }]); setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3500); };
    window.addEventListener("fk-toast", h); return () => window.removeEventListener("fk-toast", h);
  }, []);
  return <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] space-y-2">{items.map((i) => (
    <div key={i.id} className={`glass rounded-xl px-4 py-3 text-sm ${i.kind === "error" ? "text-red-300" : "text-champagne"}`}>{i.message}</div>))}</div>;
}
