import Link from "next/link";
export default function Pager({ page, pages, base, param = "page" }: { page: number; pages: number; base: string; param?: string }) {
  if (pages <= 1) return null;
  const href = (p: number) => `${base}${base.includes("?") ? "&" : "?"}${param}=${p}`;
  return <nav className="flex items-center justify-center gap-4 text-sm" aria-label="Halaman">
    {page > 1 && <Link href={href(page - 1)} className="text-champagne">Sebelumnya</Link>}<span className="text-platinum">{page} / {pages}</span>
    {page < pages && <Link href={href(page + 1)} className="text-champagne">Berikutnya</Link>}</nav>;
}
