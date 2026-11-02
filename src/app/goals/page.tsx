import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { idr, dateId } from "@/lib/format";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import TxForm from "@/components/TxForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Savings Goals" };
export default function Page() {
  return withShell(async (u) => {
    const goals = await db.savingsGoal.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });
    const opts = goals.map((g) => ({ id: g.id, name: g.name }));
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">Savings Goals</h1>
      <div className="grid gap-4 md:grid-cols-3"><GoalForm />
        <TxForm type="SAVINGS_ADD" label="Tambah dana ke target" goals={opts} />
        <TxForm type="SAVINGS_REDUCE" label="Kurangi dana target" goals={opts} /></div>
      {goals.length === 0 ? <p className="glass rounded-2xl p-8 text-center text-platinum">Belum ada target. Buat target pertama Anda.</p> :
        <div className="grid gap-4 md:grid-cols-2">{goals.map((g) => (
          <GoalCard key={g.id} id={g.id} name={g.name} current={idr(g.currentAmount)} target={idr(g.targetAmount)}
            pct={Math.min(100, Math.round(g.currentAmount.div(g.targetAmount).mul(100).toNumber()))} deadline={g.deadline ? dateId(g.deadline) : null} status={g.status} rawTarget={g.targetAmount.toString()} deadlineIso={g.deadline ? g.deadline.toISOString().slice(0, 10) : ""} />))}</div>}
    </div>);
  });
}
