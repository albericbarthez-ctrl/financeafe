import Logo from "@/components/Logo";
export default function Loading() {
  return <div className="grid min-h-[60vh] place-items-center"><div className="animate-pulse"><Logo size={44} /></div></div>;
}
