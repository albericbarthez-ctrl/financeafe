import { Prisma, TxType } from "@prisma/client";
export type TxSP = { q?: string; type?: string; from?: string; to?: string; sort?: string; page?: string };
const SORTS: Record<string, Prisma.FinancialTransactionOrderByWithRelationInput> = {
  new: { occurredAt: "desc" }, old: { occurredAt: "asc" }, high: { amount: "desc" }, low: { amount: "asc" } };
/** Bangun where/orderBy dari query string; selalu dibatasi userId & jenis yang diizinkan halaman. */
export function parseTx(userId: string, sp: TxSP, allowed: TxType[], size = 20) {
  const type = allowed.find((t) => t === sp.type);
  const range: Prisma.DateTimeFilter = {};
  if (sp.from && !isNaN(+new Date(sp.from))) range.gte = new Date(sp.from);
  if (sp.to && !isNaN(+new Date(sp.to))) range.lte = new Date(sp.to + "T23:59:59");
  const q = sp.q?.trim();
  const where: Prisma.FinancialTransactionWhereInput = { userId, type: type ?? { in: allowed }, ...(Object.keys(range).length ? { occurredAt: range } : {}),
    ...(q ? { OR: [{ reason: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { source: { contains: q, mode: "insensitive" } }, { category: { name: { contains: q, mode: "insensitive" } } }] } : {}) };
  const page = Math.max(1, Number(sp.page) || 1);
  return { where, orderBy: SORTS[sp.sort ?? "new"] ?? SORTS.new, page, size, skip: (page - 1) * size, qs: new URLSearchParams(Object.entries({ q: sp.q, type: sp.type, from: sp.from, to: sp.to, sort: sp.sort }).filter(([, v]) => v) as [string, string][]).toString() };
}
