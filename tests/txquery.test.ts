import test from "node:test";
import assert from "node:assert/strict";
import { parseTx } from "../src/lib/txquery";
test("selalu dibatasi userId dan jenis yang diizinkan", () => {
  const t = parseTx("u1", { type: "SAVINGS_ADD" }, ["INCOME", "EXPENSE"]);
  assert.equal((t.where as { userId: string }).userId, "u1"); assert.deepEqual((t.where as { type: unknown }).type, { in: ["INCOME", "EXPENSE"] });
});
test("sort dan page tidak valid kembali ke default", () => {
  const t = parseTx("u1", { sort: "'; DROP", page: "-5" }, ["INCOME"]); assert.deepEqual(t.orderBy, { occurredAt: "desc" }); assert.equal(t.page, 1);
});
