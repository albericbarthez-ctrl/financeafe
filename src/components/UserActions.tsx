"use client";
import { useTransition } from "react";
import { setRole, setStatus, deleteAccount } from "@/app/actions/admin";
export default function UserActions({ id, role, status, actor }: { id: string; role: string; status: string; actor: string }) {
  const [p, start] = useTransition();
  if (role === "FOUNDER") return <span className="text-xs text-platinum">Dilindungi</span>;
  const go = (msg: string, fn: () => Promise<void>) => confirm(msg) && start(async () => { try { await fn(); } catch (e) { alert((e as Error).message); } });
  const b = "rounded-lg border border-champagne/30 px-2 py-1 text-xs disabled:opacity-40";
  return (
    <div className="flex flex-wrap gap-1">
      {actor === "FOUNDER" && <button disabled={p} className={b} onClick={() => go(`Ubah role menjadi ${role === "ADMIN" ? "USER" : "ADMIN"}?`, () => setRole(id, role === "ADMIN" ? "USER" : "ADMIN"))}>{role === "ADMIN" ? "Jadikan User" : "Jadikan Admin"}</button>}
      {(actor === "FOUNDER" || role === "USER") && <button disabled={p} className={b} onClick={() => go(status === "ACTIVE" ? "Nonaktifkan akun ini?" : "Aktifkan akun ini?", () => setStatus(id, status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"))}>{status === "ACTIVE" ? "Suspend" : "Aktifkan"}</button>}
      {actor === "FOUNDER" && <button disabled={p} className={`${b} text-red-300`} onClick={() => go("Hapus akun ini secara permanen beserta datanya?", () => deleteAccount(id))}>Hapus</button>}
    </div>
  );
}
