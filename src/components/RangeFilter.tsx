export default function RangeFilter({ action, range, from, to }: { action: string; range?: string; from?: string; to?: string }) {
  return <form action={action} className="flex flex-wrap items-end gap-2 text-sm">
    <select name="range" defaultValue={range ?? "30"} className="input max-w-[11rem]"><option value="7">7 hari terakhir</option><option value="30">30 hari terakhir</option><option value="90">3 bulan</option><option value="180">6 bulan</option><option value="365">1 tahun</option></select>
    <span className="text-platinum">atau</span><input type="date" name="from" defaultValue={from} className="input max-w-[11rem]" aria-label="Dari" /><input type="date" name="to" defaultValue={to} className="input max-w-[11rem]" aria-label="Sampai" />
    <button className="btn-gold">Terapkan</button></form>;
}
