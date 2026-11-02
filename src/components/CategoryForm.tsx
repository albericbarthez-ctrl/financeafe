"use client";
import { useFormState } from "react-dom";
import { createCategory } from "@/app/actions/finance";
export default function CategoryForm() {
  const [s, act] = useFormState(createCategory, {});
  return (<form action={act} className="glass flex flex-wrap items-end gap-2 rounded-2xl p-4 text-sm"><input className="input max-w-xs" name="name" placeholder="Kategori baru" required />
    <select name="kind" className="input max-w-[10rem]"><option value="INCOME">Pemasukan</option><option value="EXPENSE">Pengeluaran</option><option value="SAVINGS">Tabungan</option></select><button className="btn-gold">Tambah kategori</button>
    {s.error && <span role="alert" className="text-red-300">{s.error}</span>}{s.ok && <span role="status" className="text-champagne">{s.ok}</span>}</form>);
}
