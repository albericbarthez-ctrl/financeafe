"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import Logo from "@/components/Logo";
import { forgotPassword } from "../actions/auth";
export default function Forgot() {
  const [s, act] = useFormState(forgotPassword, {});
  return (<main className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-md space-y-6"><div className="flex justify-center"><Logo /></div>
    <form action={act} className="glass space-y-4 rounded-3xl p-8"><h1 className="text-2xl font-semibold">Reset password</h1><p className="text-sm text-platinum">Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru.</p>
      <input className="input" type="email" name="email" placeholder="Email" required />{s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}<button className="btn-gold w-full">Kirim tautan</button>
      <Link href="/login" className="block text-center text-sm text-platinum hover:text-champagne">Kembali ke login</Link></form></div></main>);
}
