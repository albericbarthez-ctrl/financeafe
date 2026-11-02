import test from "node:test";
import assert from "node:assert/strict";
import { canChangeRole, canSetStatus, canDeleteAccount, canViewAuditLogs, canViewUserList, canViewFinancialData, type R } from "../src/lib/policy";
const roles: R[] = ["FOUNDER", "ADMIN", "USER"];
test("hanya Founder yang dapat mengubah role, dan tidak pernah ke FOUNDER", () => {
  for (const a of roles) for (const t of roles) for (const n of ["ADMIN", "USER", "FOUNDER"]) assert.equal(canChangeRole(a, t, n), a === "FOUNDER" && t !== "FOUNDER" && n !== "FOUNDER");
});
test("Founder tidak dapat disuspend/dihapus oleh siapa pun", () => {
  for (const a of roles) { assert.equal(canSetStatus(a, "FOUNDER"), false); assert.equal(canDeleteAccount(a, "FOUNDER"), false); }
});
test("Admin hanya memoderasi User; tidak dapat menghapus akun", () => {
  assert.equal(canSetStatus("ADMIN", "USER"), true); assert.equal(canSetStatus("ADMIN", "ADMIN"), false); assert.equal(canDeleteAccount("ADMIN", "USER"), false); assert.equal(canSetStatus("USER", "USER"), false);
});
test("audit log hanya Founder; daftar user Founder/Admin; data keuangan hanya pemilik", () => {
  assert.deepEqual(roles.filter(canViewAuditLogs), ["FOUNDER"]); assert.deepEqual(roles.filter(canViewUserList), ["FOUNDER", "ADMIN"]);
  assert.equal(canViewFinancialData("a", "a"), true); assert.equal(canViewFinancialData("a", "b"), false);
});
