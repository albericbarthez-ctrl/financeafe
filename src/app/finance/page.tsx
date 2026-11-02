import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { categoriesFor } from "@/lib/categories";
import { parseTx, type TxSP } from "@/lib/txquery";
import CategoryForm from "@/components/CategoryForm";
import TxForm from "@/components/TxForm";
import TxTable from "@/components/TxTable";
import TxFilters from "@/components/TxFilters";
import Pager from "@/components/Pager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Financial Management" };
export default function Page({ searchParams }: { searchParams: TxSP }) {
  return withShell(async (u) => {
    const t = parseTx(u.id, searchParams, ["INCOME", "EXPENSE"]);
    const [inc, exp, rows, total] = await Promise.all([categoriesFor(u.id, "INCOME"), categoriesFor(u.id, "EXPENSE"),
      db.financialTransaction.findMany({ where: t.where, orderBy: t.orderBy, skip: t.skip, take: t.size, include: { category: true } }), db.financialTransaction.count({ where: t.where })]);
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Financial Management</h1><CategoryForm />
      <div className="grid gap-4 md:grid-cols-2"><TxForm type="INCOME" label="Tambah pemasukan" categories={inc} sourceLabel="Sumber pemasukan" /><TxForm type="EXPENSE" label="Tambah pengeluaran" categories={exp} /></div>
      <TxFilters action="/finance" types={["INCOME", "EXPENSE"]} sp={searchParams} /><TxTable rows={rows} /><Pager page={t.page} pages={Math.ceil(total / t.size)} base={`/finance${t.qs ? "?" + t.qs : ""}`} /></div>);
  });
}
