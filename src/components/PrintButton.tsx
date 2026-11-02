"use client";
export default function PrintButton() { return <button onClick={() => window.print()} className="rounded-xl border border-champagne/30 px-4 py-2 text-sm print:hidden">Simpan PDF</button>; }
