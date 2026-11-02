"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import PasswordInput from "@/components/PasswordInput";
import Logo from "@/components/Logo";
import { resetPassword } from "../actions/account";
export default function Reset() {
  const [s, act] = useFormState(resetPassword, {});
  return (<main className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-md space-y-6"><div className="flex justify-center"><Logo /></div>
    <form action={act} className="glass space-y-4 rounded-3xl p-8"><h1 className="text-2xl font-semibold">Buat password baru</h1>
      <PasswordInput name="next" placeholder="Password baru" /><input className="input" type="password" name="confirm" placeholder="Konfirmasi password" autoComplete="new-password" required />
      {s.error && <p role="alert" className="text-sm text-red-300">{s.error}</p>}{s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}
      <button className="btn-gold w-full">Simpan password</button><Link href="/login" className="block text-center text-sm text-platinum hover:text-champagne">Ke halaman login</Link></form></div></main>);
}
