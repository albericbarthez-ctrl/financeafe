import Logo from "@/components/Logo";
import SceneLoader from "@/components/three/SceneLoader";
import AuthPanel from "./AuthPanel";
export const metadata = { title: "Masuk" };
export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0"><SceneLoader auth /></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <Logo />
        <AuthPanel />
      </div>
    </main>
  );
}
