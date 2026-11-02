"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial, ContactShadows, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const GOLD = "#D6C39A", GOLD2 = "#C5A66A";
const gold = (r = 0.22) => <meshStandardMaterial color={GOLD} metalness={1} roughness={r} envMapIntensity={1.4} />;

/** Parallax kursor + cahaya dinamis yang mengikuti kursor. */
function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!); const light = useRef<THREE.PointLight>(null!);
  useFrame((s) => {
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, s.pointer.x * 0.45, 0.05);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -s.pointer.y * 0.28, 0.05);
    const near = 1 - Math.min(1, Math.hypot(s.pointer.x, s.pointer.y));
    light.current.position.set(s.pointer.x * 5, s.pointer.y * 3, 3.2);
    light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, 12 + near * 45, 0.08);
  });
  return <><pointLight ref={light} color="#F0E7D5" distance={14} decay={2} /><group ref={g}>{children}</group></>;
}

/** Objek tertarik tipis ke arah kursor (magnetic). */
function Mag({ children, position, strength = 0.5 }: { children: React.ReactNode; position: [number, number, number]; strength?: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((s) => { const t = new THREE.Vector3(position[0] + s.pointer.x * strength, position[1] + s.pointer.y * strength, position[2]); g.current.position.lerp(t, 0.06); });
  return <group ref={g} position={position}>{children}</group>;
}

/** Drag (mouse/sentuh) memutar objek dengan momentum; scroll vertikal tetap berjalan (touch-action: pan-y). */
function Spin({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!); const v = useRef(0); const last = useRef<number | null>(null);
  useFrame(() => { g.current.rotation.y += v.current; v.current *= 0.94; });
  return (<group ref={g}
    onPointerDown={(e) => { last.current = e.clientX; (e.target as unknown as Element).setPointerCapture?.(e.pointerId); }}
    onPointerMove={(e) => { if (last.current !== null) { v.current += (e.clientX - last.current) * 0.0009; last.current = e.clientX; } }}
    onPointerUp={() => { last.current = null; }} onPointerLeave={() => { last.current = null; }}>{children}</group>);
}

function Coin({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const m = useRef<THREE.Mesh>(null!); useFrame((_, d) => { m.current.rotation.z += d * 0.4; });
  return <Mag position={position}><Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}><Spin><mesh ref={m} scale={scale} rotation={[Math.PI / 2.4, 0, 0]} castShadow><cylinderGeometry args={[1, 1, 0.16, 96]} />{gold()}</mesh></Spin></Float></Mag>;
}

function CreditCard() {
  return <Mag position={[0.1, -0.3, 0.6]} strength={0.8}><Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}><Spin><group rotation={[0.2, -0.5, 0.12]}>
    <RoundedBox args={[2.5, 1.58, 0.06]} radius={0.1} smoothness={6}><meshStandardMaterial color="#151515" metalness={0.9} roughness={0.28} envMapIntensity={1.2} /></RoundedBox>
    <mesh position={[-0.75, 0.25, 0.04]}><boxGeometry args={[0.42, 0.32, 0.02]} />{gold(0.3)}</mesh>
    <mesh position={[0, -0.45, 0.04]}><boxGeometry args={[2.0, 0.05, 0.01]} /><meshStandardMaterial color={GOLD2} metalness={1} roughness={0.35} /></mesh>
    <mesh position={[0.75, 0.45, 0.04]} rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.16, 0.03, 16, 48]} />{gold(0.2)}</mesh></group></Spin></Float></Mag>;
}

function Sculpture() {
  const k = useRef<THREE.Mesh>(null!); useFrame((_, d) => { k.current.rotation.x += d * 0.2; k.current.rotation.y += d * 0.3; });
  return <Mag position={[-2.6, -1.1, -0.5]} strength={0.35}><Float speed={1.1} floatIntensity={1.4}><Spin><mesh ref={k} scale={0.55}><torusKnotGeometry args={[1, 0.28, 180, 24, 2, 3]} /><meshStandardMaterial color={GOLD2} metalness={1} roughness={0.16} /></mesh></Spin></Float></Mag>;
}

/** Simbol finansial melayang: bar tumbuh + prisma. */
function Symbols() {
  return <>{[[-3.1, 1.6, -1], [3.2, 1.7, -1.5], [1.6, -2, -0.5]].map((p, i) => (
    <Mag key={i} position={p as [number, number, number]} strength={0.25}><Float speed={1.6 + i * 0.3} floatIntensity={2}><group scale={0.24}>
      {[0, 1, 2].map((b) => <mesh key={b} position={[(b - 1) * 0.9, b * 0.45, 0]}><boxGeometry args={[0.6, 1 + b * 0.9, 0.6]} />{gold(0.25 + b * 0.05)}</mesh>)}</group></Float></Mag>))}
    <Mag position={[2.4, 0.6, -1]} strength={0.3}><Float speed={2} floatIntensity={2}><mesh scale={0.28}><octahedronGeometry /><meshStandardMaterial color="#C8C5BF" metalness={1} roughness={0.15} /></mesh></Float></Mag></>;
}

function Wealth() { // visualisasi kekayaan: tumpukan koin
  return <Mag position={[2.6, -1.5, 0.2]} strength={0.4}><Float speed={1} floatIntensity={0.8}><group scale={0.5} rotation={[0.3, 0, 0]}>{Array.from({ length: 7 }).map((_, i) => (
    <mesh key={i} position={[0, i * 0.2, 0]} rotation={[0, i * 0.4, 0]}><cylinderGeometry args={[1, 1, 0.16, 64]} />{gold(0.2 + (i % 3) * 0.04)}</mesh>))}</group></Float></Mag>;
}

/** Bola emas satin besar (referensi halaman login): material matte-metallic, kedalaman lewat skala & posisi. */
function BigSpheres() {
  const S: [number, number, number, number][] = [[-3.4, -0.5, -1, 1.5], [3.7, -1.1, -1.5, 1.7], [2.9, 2.0, -2.5, 0.6], [-0.9, -2.2, 0.8, 0.7], [-2.7, 2.0, -3, 0.5], [0.3, 2.4, -3.5, 0.9]];
  return <>{S.map(([x, y, z, r], i) => (
    <Mag key={i} position={[x, y, z]} strength={0.3}><Float speed={0.9 + i * 0.15} floatIntensity={1.2}><mesh scale={r}><sphereGeometry args={[1, 96, 96]} />
      <meshStandardMaterial color={i % 3 === 2 ? GOLD : GOLD2} metalness={1} roughness={0.38} envMapIntensity={1.2} /></mesh></Float></Mag>))}</>;
}

/** Pita perak terpilin (referensi "twisted ribbon"). */
function Ribbon() {
  const k = useRef<THREE.Mesh>(null!); useFrame((_, d) => { k.current.rotation.y += d * 0.15; });
  return <Mag position={[0, 0.2, -4]} strength={0.2}><mesh ref={k} scale={1.1}><torusKnotGeometry args={[1.6, 0.12, 300, 20, 3, 2]} /><meshStandardMaterial color="#C8C5BF" metalness={1} roughness={0.2} /></mesh></Mag>;
}

/** Tumpukan panel kaca buram + bingkai & cincin emas di atas batu hitam (referensi "Ivory & Cream"). */
function GlassStack() {
  return <Mag position={[3.1, -0.2, -0.5]} strength={0.4}><Float speed={1.1} floatIntensity={1}><group rotation={[0.55, 0.6, 0]} scale={0.55}>
    <RoundedBox args={[2.4, 0.3, 2.4]} radius={0.04} position={[0, -0.5, 0]}><meshStandardMaterial color="#151515" metalness={0.4} roughness={0.6} /></RoundedBox>
    <mesh position={[0, -0.2, 0]}><boxGeometry args={[2.1, 0.04, 2.1]} />{gold(0.3)}</mesh>
    <RoundedBox args={[2, 0.16, 2]} radius={0.03} position={[0, 0, 0]}><meshPhysicalMaterial color="#e8e0cc" transmission={0.9} roughness={0.35} thickness={0.4} metalness={0} /></RoundedBox>
    <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.6, 0.025, 16, 96]} />{gold(0.2)}</mesh></group></Float></Mag>;
}

export default function Scene({ reduced = false, compact = false, auth = false }: { reduced?: boolean; compact?: boolean; auth?: boolean }) {
  return (
    <Canvas dpr={[1, compact ? 1.25 : 1.5]} camera={{ position: [0, 0, 7.5], fov: 38 }} shadows frameloop={reduced ? "demand" : "always"} style={{ touchAction: "pan-y" }} gl={{ antialias: !compact, powerPreference: "high-performance" }}>
      <color attach="background" args={["#0B0B0B"]} />
      <ambientLight intensity={0.12} />
      <spotLight position={[5, 6, 5]} angle={0.4} penumbra={1} intensity={70} color="#F0E7D5" castShadow />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -4]} scale={[12, 4, 1]} color="#F0E7D5" />
        <Lightformer form="rect" intensity={2.5} position={[-6, 1, 3]} scale={[3, 6, 1]} color="#D6C39A" />
        <Lightformer form="ring" intensity={2} position={[5, -1, 2]} scale={4} color="#C8C5BF" />
      </Environment>
      <Rig>
        {auth ? <><BigSpheres /><Ribbon /></> : <>
        <Coin position={[-2.2, 0.9, 0]} scale={0.9} />
        <Coin position={[2.5, -0.2, -1]} scale={1.1} />
        <CreditCard />
        {compact ? <GlassStack /> : <><Sculpture /><Symbols /><Wealth /></>}
        <Float speed={1.2} floatIntensity={1.5}><mesh position={[0.2, 0.9, -1]}><torusGeometry args={[1.5, 0.1, 48, 160]} /><meshStandardMaterial color={GOLD2} metalness={1} roughness={0.18} /></mesh></Float>
        <Float speed={1.8} floatIntensity={2}><mesh position={[-0.9, -1.7, 1]}><sphereGeometry args={[0.6, 64, 64]} /><MeshTransmissionMaterial thickness={0.6} roughness={0.05} transmission={1} color="#2a2622" backside samples={compact ? 2 : 4} /></mesh></Float></>}
      </Rig>
      <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={12} blur={2.6} far={4} />
    </Canvas>
  );
}
