import { withShell } from "@/lib/page";
import { db } from "@/lib/db";
import { dateId } from "@/lib/format";
import AvatarUploader from "@/components/AvatarUploader";
import ProfileForm from "@/components/ProfileForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "My Profile" };
export default function Page() {
  return withShell(async (u) => {
    const p = await db.userProfile.findUnique({ where: { userId: u.id } });
    return (<div className="space-y-6"><h1 className="text-2xl font-semibold">My Profile</h1>
      <div className="glass flex flex-wrap items-center gap-5 rounded-2xl p-6 text-sm">{p?.avatarUrl /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={p.avatarUrl} alt="Foto profil" className="h-20 w-20 rounded-full border border-champagne/40 object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-ivory to-gold text-2xl font-semibold text-matte">{u.username[0]?.toUpperCase()}</span>}<div><p className="text-lg font-semibold text-champagne">{u.fullName}</p><p>@{u.username} · {u.email}</p><p className="text-platinum">Role {u.role} · Status {u.status} · Bergabung {dateId(u.createdAt)}</p><p className="text-xs text-platinum">ID {u.id}</p></div></div>
      <AvatarUploader current={p?.avatarUrl ?? null} /><ProfileForm fullName={u.fullName} username={u.username} bio={p?.bio ?? ""} /></div>);
  });
}
