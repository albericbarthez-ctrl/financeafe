"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const C = ["#D6C39A", "#C5A66A", "#F0E7D5", "#C8C5BF", "#8f7743", "#6b6b6b", "#a89a7c", "#e4d9bf"];
const tip = { contentStyle: { background: "#151515", border: "1px solid #D6C39A44", borderRadius: 12 }, labelStyle: { color: "#F0E7D5" } };
const axis = { stroke: "#C8C5BF", fontSize: 12 };
const box = "glass rounded-2xl p-4";
type M = { month: string; income: number; expense: number; savings: number };
export function IncomeExpense({ data }: { data: M[] }) {
  return <div className={box}><h3 className="mb-2 text-sm text-platinum">Income vs Expenses</h3><div className="h-64"><ResponsiveContainer><BarChart data={data}><CartesianGrid vertical={false} stroke="#ffffff0d" /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={70} /><Tooltip {...tip} /><Legend />
    <Bar dataKey="income" name="Income" fill="#D6C39A" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expense" fill="#6b6b6b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>;
}
export function SavingsGrowth({ data }: { data: M[] }) {
  return <div className={box}><h3 className="mb-2 text-sm text-platinum">Savings Growth (bersih per bulan)</h3><div className="h-64"><ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D6C39A" stopOpacity={0.55} /><stop offset="100%" stopColor="#D6C39A" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff0d" /><XAxis dataKey="month" {...axis} /><YAxis {...axis} width={70} /><Tooltip {...tip} />
    <Area dataKey="savings" name="Savings" stroke="#D6C39A" strokeWidth={2} fill="url(#gold-fill)" /></AreaChart></ResponsiveContainer></div></div>;
}
export function BalanceHistory({ data }: { data: { date: string; balance: number }[] }) {
  return <div className={box}><h3 className="mb-2 text-sm text-platinum">Balance History</h3><div className="h-64"><ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D6C39A" stopOpacity={0.55} /><stop offset="100%" stopColor="#D6C39A" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff0d" /><XAxis dataKey="date" {...axis} /><YAxis {...axis} width={70} /><Tooltip {...tip} />
    <Area dataKey="balance" name="Balance" stroke="#D6C39A" strokeWidth={2} fill="url(#gold-fill)" /></AreaChart></ResponsiveContainer></div></div>;
}
export function ExpenseDistribution({ data }: { data: { name: string; value: number }[] }) {
  return <div className={box}><h3 className="mb-2 text-sm text-platinum">Expense Distribution</h3><div className="h-64">{data.length === 0 ? <p className="pt-24 text-center text-platinum">Belum ada pengeluaran pada periode ini.</p> :
    <ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} stroke="#0B0B0B">{data.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}</Pie><Tooltip {...tip} /><Legend /></PieChart></ResponsiveContainer>}</div></div>;
}
export function TxStats({ data }: { data: { month: string; income: number; expense: number; savingsAdd: number; savingsReduce: number }[] }) {
  return <div className={box}><h3 className="mb-2 text-sm text-platinum">Transaction Statistics (jumlah transaksi)</h3><div className="h-64"><ResponsiveContainer><BarChart data={data}><CartesianGrid vertical={false} stroke="#ffffff0d" /><XAxis dataKey="month" {...axis} /><YAxis {...axis} allowDecimals={false} width={40} /><Tooltip {...tip} /><Legend />
    <Bar dataKey="income" name="Income" stackId="a" fill="#D6C39A" /><Bar dataKey="expense" name="Expense" stackId="a" fill="#6b6b6b" /><Bar dataKey="savingsAdd" name="Savings +" stackId="a" fill="#F0E7D5" /><Bar dataKey="savingsReduce" name="Savings −" stackId="a" fill="#C8C5BF" /></BarChart></ResponsiveContainer></div></div>;
}
