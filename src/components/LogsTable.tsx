"use client";
import { Fragment, useState, useTransition } from "react";
import { deleteLogs } from "@/app/actions/finance";
type L = { id: string; category: string; action: string; at: string; ip: string | null; meta: string | null };
export default function LogsTable({ logs }: { logs: L[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const [pending, start] = useTransition(); const [det, setDet] = useState<string | null>(null);
  const run = (ids: string[] | "ALL", msg: string) => confirm(msg) && start(async () => { await deleteLogs(ids); setSel([]); });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-sm">
        <button disabled={!sel.length || pending} onClick={() => run(sel, `Hapus ${sel.length} log? Transaksi dan saldo tidak terpengaruh.`)} className="rounded-lg border border-champagne/30 px-3 py-1.5 disabled:opacity-40">Hapus terpilih</button>
        <button disabled={!logs.length || pending} onClick={() => run("ALL", "PERINGATAN: semua activity log Anda akan dihapus permanen. Data keuangan tidak terhapus. Lanjutkan?")} className="rounded-lg border border-red-400/40 px-3 py-1.5 text-red-300 disabled:opacity-40">Hapus semua</button>
      </div>
      {logs.length === 0 ? <p className="glass rounded-2xl p-8 text-center text-platinum">Tidak ada activity log.</p> :
        <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-left text-sm"><thead className="text-platinum"><tr>
          <th className="p-3"><input type="checkbox" aria-label="Pilih semua" checked={logs.length > 0 && sel.length === logs.length} onChange={(e) => setSel(e.target.checked ? logs.map((l) => l.id) : [])} /></th>
          <th className="p-3">Waktu</th><th className="p-3">Kategori</th><th className="p-3">Aktivitas</th><th className="p-3" /></tr></thead>
          <tbody>{logs.map((l) => (<Fragment key={l.id}><tr className="border-t border-white/5">
            <td className="p-3"><input type="checkbox" aria-label="Pilih log" checked={sel.includes(l.id)} onChange={(e) => setSel(e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id))} /></td>
            <td className="p-3">{l.at}</td><td className="p-3">{l.category}</td><td className="p-3">{l.action}</td>
            <td className="whitespace-nowrap p-3"><button onClick={() => setDet(det === l.id ? null : l.id)} className="mr-3 text-xs text-platinum hover:text-champagne">Detail</button><button onClick={() => run([l.id], "Hapus log ini?")} className="text-xs text-platinum hover:text-red-300">Hapus</button></td></tr>{det === l.id && <tr><td colSpan={5} className="bg-white/5 p-3 font-mono text-xs">ID {l.id} · IP {l.ip ?? "-"} · {l.meta ?? "tanpa metadata"}</td></tr>}</Fragment>))}</tbody></table></div>}
    </div>
  );
}
