"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import PasswordInput from "./PasswordInput";
import { savePreferences, changePassword, logoutOthers, changeEmail } from "@/app/actions/account";
const Msg = ({ s }: { s: { error?: string; ok?: string } }) => <>{s.error && <p role="alert" className="text-sm text-red-300">{s.error}</p>}{s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}</>;
export default function SettingsForms({ theme, reducedMotion, displayMode, n }: { theme: string; reducedMotion: boolean; displayMode: string; n: { financial: boolean; savings: boolean; security: boolean } }) {
  const [a, pa] = useFormState(savePreferences, {}); const [b, pb] = useFormState(changePassword, {}); const [c, pc] = useFormState(logoutOthers, {}); const [e, pe] = useFormState(changeEmail, {});
  const ck = "mr-2 accent-[#D6C39A]"; const [tab, setTab] = useState("pref");
  const tabs: [string, string][] = [["pref", "Tampilan & notifikasi"], ["pass", "Password"], ["mail", "Email"], ["sess", "Sesi"]];
  return (<div className="space-y-0"><div role="tablist" className="flex flex-wrap gap-1">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="tab">{l}</button>)}</div>
    {tab === "pref" && <form action={pa} className="glass space-y-3 rounded-b-2xl rounded-tr-2xl p-5"><h2 className="font-semibold text-champagne">Tampilan & notifikasi</h2>
      <select name="theme" defaultValue={theme} className="input"><option value="dark">Dark (Matte Black)</option><option value="light">Light (Warm Ivory)</option></select>
      <select name="displayMode" defaultValue={displayMode} className="input"><option value="fullName">Tampilkan nama lengkap</option><option value="username">Tampilkan username</option></select>
      <label className="block text-sm"><input className={ck} type="checkbox" name="reducedMotion" defaultChecked={reducedMotion} />Kurangi animasi</label>
      {([["financial", "Notifikasi keuangan"], ["savings", "Notifikasi tabungan"], ["security", "Notifikasi keamanan"]] as const).map(([k, l]) => <label key={k} className="block text-sm"><input className={ck} type="checkbox" name={k} defaultChecked={n[k]} />{l}</label>)}
      <Msg s={a} /><button className="btn-gold w-full">Save changes</button></form>}
    {tab === "pass" && <form action={pb} className="glass space-y-3 rounded-b-2xl rounded-tr-2xl p-5"><h2 className="font-semibold text-champagne">Ganti password</h2>
      <input className="input" type="password" name="current" placeholder="Password saat ini" autoComplete="current-password" required /><PasswordInput name="next" placeholder="Password baru" /><input className="input" type="password" name="confirm" placeholder="Konfirmasi password baru" autoComplete="new-password" required />
      <Msg s={b} /><button className="btn-gold w-full">Save changes</button></form>}
    {tab === "mail" && <form action={pe} className="glass space-y-3 rounded-b-2xl rounded-tr-2xl p-5"><h2 className="font-semibold text-champagne">Ganti email</h2><input className="input" type="email" name="email" placeholder="Email baru" required /><Msg s={e} /><button className="btn-gold w-full">Kirim verifikasi</button></form>}
    {tab === "sess" && <form action={pc} className="glass space-y-3 rounded-b-2xl rounded-tr-2xl p-5"><h2 className="font-semibold text-champagne">Sesi</h2><p className="text-sm text-platinum">Keluarkan semua perangkat lain; sesi ini tetap aktif.</p><Msg s={c} /><button className="btn-gold w-full">Logout sesi lain</button></form>}</div>);
}
