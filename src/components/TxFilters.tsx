import { TxType } from "@prisma/client";
const label: Record<TxType, string> = { INCOME: "Income", EXPENSE: "Expense", SAVINGS_ADD: "Savings +", SAVINGS_REDUCE: "Savings −" };
export default function TxFilters({ action, types, sp }: { action: string; types: TxType[]; sp: { q?: string; type?: string; from?: string; to?: string; sort?: string } }) {
  return (<form action={action} className="flex flex-wrap gap-2 text-sm">
    <input className="input max-w-[12rem]" name="q" placeholder="Cari transaksi" defaultValue={sp.q} />
    <select className="input max-w-[10rem]" name="type" defaultValue={sp.type ?? ""}><option value="">Semua jenis</option>{types.map((t) => <option key={t} value={t}>{label[t]}</option>)}</select>
    <input className="input max-w-[10rem]" type="date" name="from" defaultValue={sp.from} aria-label="Dari" /><input className="input max-w-[10rem]" type="date" name="to" defaultValue={sp.to} aria-label="Sampai" />
    <select className="input max-w-[11rem]" name="sort" defaultValue={sp.sort ?? "new"}><option value="new">Terbaru</option><option value="old">Terlama</option><option value="high">Nominal terbesar</option><option value="low">Nominal terkecil</option></select>
    <button className="btn-gold">Terapkan</button></form>);
}
