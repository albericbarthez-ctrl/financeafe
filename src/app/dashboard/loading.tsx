export default function Loading() {
  return (<div className="mx-auto max-w-6xl animate-pulse space-y-4 p-6"><div className="h-44 rounded-3xl bg-obsidian" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-obsidian" />)}</div><div className="h-64 rounded-2xl bg-obsidian" /></div>);
}
