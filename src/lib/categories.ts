import { CategoryKind } from "@prisma/client";
import { db } from "./db";
const DEFAULTS: Record<CategoryKind, string[]> = {
  INCOME: ["Salary", "Business", "Investment", "Bonus", "Other"],
  EXPENSE: ["Food", "Transportation", "Shopping", "Entertainment", "Education", "Bills", "Health", "Other"],
  SAVINGS: ["Monthly savings", "Other"],
};
/** Seed kategori bawaan sistem (userId null) bila belum ada, lalu kembalikan bawaan + milik user. */
export async function categoriesFor(userId: string, kind: CategoryKind) {
  if ((await db.category.count({ where: { userId: null, kind } })) === 0)
    await db.category.createMany({ data: DEFAULTS[kind].map((name) => ({ name, kind })), skipDuplicates: true });
  return db.category.findMany({ where: { kind, OR: [{ userId: null }, { userId }] }, orderBy: { name: "asc" } });
}
