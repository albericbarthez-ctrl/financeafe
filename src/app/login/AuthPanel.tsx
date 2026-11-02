"use client";
import { useState } from "react";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import Magnetic from "@/components/Magnetic";
import { useFormState, useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { login, register, type FormState } from "../actions/auth";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Magnetic className="w-full"><button className="btn-gold w-full" disabled={pending}>{pending ? "Memproses..." : children}</button></Magnetic>;
}
function Err({ s, f }: { s: FormState; f?: string }) {
  const msg = f ? s.fields?.[f]?.[0] : s.error;
  return msg ? <p role="alert" className="mt-1 text-sm text-red-300">{msg}</p> : null;
}

export default function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [ls, la] = useFormState(login, {});
  const [rs, ra] = useFormState(register, {});
  return (
    <div className="glass-auth auth w-full max-w-md rounded-3xl p-8">
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, x: mode === "login" ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: mode === "login" ? 24 : -24 }} transition={{ duration: 0.25 }}>
          {mode === "login" ? (
            <form action={la} className="space-y-4">
              <h1 className="auth-title">Login</h1>
              <input className="input" name="email" type="email" placeholder="Email" autoComplete="email" required />
              <input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              <label className="flex items-center gap-2 text-sm text-platinum"><input type="checkbox" name="remember" defaultChecked className="accent-[#D6C39A]" />Remember me</label>
              <Err s={ls} /> <Submit>Sign in</Submit>
              <Link href="/forgot" className="block text-center text-sm text-platinum hover:text-champagne">Lupa password?</Link>
            </form>
          ) : (
            <form action={ra} className="space-y-3">
              <h1 className="auth-title">Register</h1>
              {([["fullName","Nama lengkap","text"],["username","Username","text"],["email","Email","email"],["password","Password","password"],["confirm","Konfirmasi password","password"]] as const).map(([n,p,t]) => (
                <div key={n}>{n === "password" ? <PasswordInput name={n} placeholder={p} /> : n === "confirm" ? <PasswordInput name={n} placeholder={p} meter={false} /> : <input className="input" name={n} type={t} placeholder={p} required />}<Err s={rs} f={n} /></div>
              ))}
              <Err s={rs} />{rs.ok && <p role="status" className="text-sm text-champagne">{rs.ok}</p>}
              <Submit>Create account</Submit>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="mt-6 w-full text-sm text-platinum underline-offset-4 hover:underline">
        {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
    </div>
  );
}
