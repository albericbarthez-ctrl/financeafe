"use client";
import { useRef, useState, useTransition } from "react";
import { uploadAvatar, removeAvatar } from "@/app/actions/account";
/** Preview + crop persegi (zoom & geser) di canvas, lalu upload ke storage cloud. */
export default function AvatarUploader({ current }: { current: string | null }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1), [ox, setOx] = useState(0), [oy, setOy] = useState(0);
  const [msg, setMsg] = useState<string>(""); const [p, start] = useTransition(); const cv = useRef<HTMLCanvasElement>(null); const drag = useRef<{ x: number; y: number } | null>(null);
  const draw = (i: HTMLImageElement, z: number, x: number, y: number) => {
    const c = cv.current!, g = c.getContext("2d")!; const base = Math.min(i.width, i.height) / z, sx = Math.min(i.width - base, Math.max(0, (i.width - base) / 2 + x * base)), sy = Math.min(i.height - base, Math.max(0, (i.height - base) / 2 + y * base));
    g.clearRect(0, 0, 256, 256); g.drawImage(i, sx, sy, base, base, 0, 0, 256, 256);
  };
  const pick = (f?: File) => { if (!f) return; if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 2 * 1024 * 1024) { setMsg("Gunakan JPG/PNG/WEBP maks 2 MB"); return; }
    const i = new Image(); i.onload = () => { setImg(i); setZoom(1); setOx(0); setOy(0); setTimeout(() => draw(i, 1, 0, 0), 0); }; i.src = URL.createObjectURL(f); };
  const upd = (z: number, x: number, y: number) => { setZoom(z); setOx(x); setOy(y); img && draw(img, z, x, y); };
  const save = () => cv.current!.toBlob((b) => b && start(async () => { const fd = new FormData(); fd.append("file", new File([b], "avatar.webp", { type: "image/webp" })); const r = await uploadAvatar(fd); setMsg(r.error ?? r.ok ?? ""); if (r.ok) setImg(null); }), "image/webp", 0.9);
  return (<div className="glass space-y-3 rounded-2xl p-5"><h2 className="font-semibold text-champagne">Foto profil</h2>
    {current && !img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={current} alt="Foto profil" className="h-24 w-24 rounded-full object-cover" />}
    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pick(e.target.files?.[0])} className="text-sm" />
    {img && <><canvas ref={cv} width={256} height={256} aria-label="Seret untuk menggeser foto" style={{ touchAction: "none", cursor: "grab" }} className="h-40 w-40 rounded-full border border-champagne/30"
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!drag.current) return; const k = 1 / 160; const nx = Math.max(-0.5, Math.min(0.5, ox - (e.clientX - drag.current.x) * k)), ny = Math.max(-0.5, Math.min(0.5, oy - (e.clientY - drag.current.y) * k)); drag.current = { x: e.clientX, y: e.clientY }; upd(zoom, nx, ny); }}
        onPointerUp={() => { drag.current = null; }} />
      <label className="block text-xs text-platinum">Zoom<input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => upd(+e.target.value, ox, oy)} className="w-full" /></label>
      <label className="block text-xs text-platinum">Geser horizontal<input type="range" min={-0.5} max={0.5} step={0.01} value={ox} onChange={(e) => upd(zoom, +e.target.value, oy)} className="w-full" /></label>
      <label className="block text-xs text-platinum">Geser vertikal<input type="range" min={-0.5} max={0.5} step={0.01} value={oy} onChange={(e) => upd(zoom, ox, +e.target.value)} className="w-full" /></label>
      <button disabled={p} onClick={save} className="btn-gold">{p ? "Mengunggah..." : "Simpan foto"}</button></>}
    {current && <button disabled={p} onClick={() => start(async () => { const r = await removeAvatar(); setMsg(r.ok ?? ""); })} className="block text-xs text-platinum hover:text-red-300">Hapus foto</button>}
    {msg && <p role="status" className="text-sm text-champagne">{msg}</p>}</div>);
}
