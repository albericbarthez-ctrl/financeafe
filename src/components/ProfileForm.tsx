"use client";
import { useFormState } from "react-dom";
import { updateProfile } from "@/app/actions/profile";
export default function ProfileForm({ fullName, username, bio }: { fullName: string; username: string; bio: string }) {
  const [s, act] = useFormState(updateProfile, {});
  return (<form action={act} className="glass space-y-3 rounded-2xl p-5">
    <input className="input" name="fullName" defaultValue={fullName} required /><input className="input" name="username" defaultValue={username} required />
    <textarea className="input" name="bio" defaultValue={bio} rows={3} placeholder="Tentang saya" />
    {s.error && <p role="alert" className="text-sm text-red-300">{s.error}</p>}{s.ok && <p role="status" className="text-sm text-champagne">{s.ok}</p>}
    <button className="btn-gold">Simpan perubahan</button></form>);
}
