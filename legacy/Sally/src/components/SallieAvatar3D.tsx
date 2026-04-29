'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useRef, useMemo, useState, useEffect, useCallback } from 'react';

import type { LimbicState } from '@/store/useLimbicStore';

export interface SallieAvatar3DProps {
  limbicState: LimbicState;
  isThinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  degradationState?: 'FULL' | 'FADING' | 'DORMANT' | 'DREAMING';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { width: 80, height: 80 },
  md: { width: 150, height: 180 },
  lg: { width: 280, height: 340 },
  xl: { width: 400, height: 500 },
} as const;

const POSTURE_COLORS: Record<string, [string, string]> = {
  COMPANION: ['#10b981', '#34d399'],
  COPILOT: ['#3b82f6', '#60a5fa'],
  PEER: ['#14b8a6', '#2dd4bf'],
  CONFIDANTE: ['#8b5cf6', '#a78bfa'],
  EXPERT: ['#f97316', '#fb923c'],
  MENTOR: ['#ec4899', '#f472b6'],
  GUIDE: ['#06b6d4', '#22d3ee'],
  ADVOCATE: ['#ef4444', '#f87171'],
  NURTURER: ['#fb7185', '#fda4af'],
};

function valenceToColor(valence: number, degradation: string): THREE.Color {
  if (degradation === 'DORMANT') return new THREE.Color('#4a4a5a');
  if (degradation === 'DREAMING') return new THREE.Color('#6366f1');

  if (valence < 0.33) {
    return new THREE.Color('#7c3aed').lerp(new THREE.Color('#3b82f6'), valence / 0.33);
  } else if (valence < 0.66) {
    const t = (valence - 0.33) / 0.33;
    return new THREE.Color('#3b82f6').lerp(new THREE.Color('#14b8a6'), t);
  } else {
    const t = (valence - 0.66) / 0.34;
    return new THREE.Color('#14b8a6').lerp(new THREE.Color('#f59e0b'), t);
  }
}

function degradationMultiplier(state: string) {
  switch (state) {
    case 'FULL': return { colorSaturation: 1, particleCount: 1, glowIntensity: 1, speed: 1 };
    case 'FADING': return { colorSaturation: 0.7, particleCount: 0.6, glowIntensity: 0.6, speed: 0.8 };
    case 'DORMANT': return { colorSaturation: 0.2, particleCount: 0.2, glowIntensity: 0.25, speed: 0.3 };
    case 'DREAMING': return { colorSaturation: 0.85, particleCount: 0.8, glowIntensity: 0.7, speed: 0.4 };
    default: return { colorSaturation: 1, particleCount: 1, glowIntensity: 1, speed: 1 };
  }
}

function Head({ limbicState, isThinking, isSpeaking, isListening, degradation }: {
  limbicState: LimbicState; isThinking: boolean; isSpeaking: boolean; isListening: boolean; degradation: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = useMemo(() => valenceToColor(limbicState.valence, degradation), [limbicState.valence, degradation]);
  const deg = degradationMultiplier(degradation);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const arousalSpeed = 0.5 + limbicState.arousal * 1.5;

    if (isThinking) {
      meshRef.current.rotation.z = Math.sin(t * 2) * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 1.5) * 0.08;
    } else if (isListening) {
      meshRef.current.rotation.x = -0.1 + Math.sin(t * 1.2) * 0.03;
      meshRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    } else {
      meshRef.current.rotation.z = Math.sin(t * arousalSpeed * deg.speed) * 0.04;
      meshRef.current.rotation.x = Math.sin(t * arousalSpeed * 0.7 * deg.speed) * 0.02;
    }
  });

  const distortSpeed = useMemo(() => {
    if (isThinking) return 4;
    return 1.5 + limbicState.arousal * 3;
  }, [isThinking, limbicState.arousal]);

  const distortAmount = useMemo(() => {
    if (degradation === 'DORMANT') return 0.15;
    if (degradation === 'DREAMING') return 0.4;
    return 0.25 + limbicState.arousal * 0.2;
  }, [degradation, limbicState.arousal]);

  return (
    <mesh ref={meshRef} position={[0, 1.2, 0]}>
      <Sphere args={[0.55, 64, 64]}>
        <MeshDistortMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.3 * limbicState.trust * deg.glowIntensity}
          roughness={0.15}
          metalness={0.8}
          distort={distortAmount}
          speed={distortSpeed * deg.speed}
          transparent
          opacity={degradation === 'DORMANT' ? 0.7 : 0.95}
        />
      </Sphere>
    </mesh>
  );
}

function Eyes({ limbicState, isThinking, isSpeaking, isListening, degradation }: {
  limbicState: LimbicState; isThinking: boolean; isSpeaking: boolean; isListening: boolean; degradation: string;
}) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const [blinkScale, setBlinkScale] = useState(1);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deg = degradationMultiplier(degradation);

  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 5000;
      blinkTimerRef.current = setTimeout(() => {
        setBlinkScale(0.05);
        setTimeout(() => {
          setBlinkScale(1);
          scheduleBlink();
        }, 120);
      }, delay);
    };
    scheduleBlink();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, []);

  const eyeColor = useMemo(() => {
    if (isListening) return new THREE.Color('#fbbf24');
    if (isThinking) return new THREE.Color('#a78bfa');
    if (degradation === 'DREAMING') return new THREE.Color('#818cf8');
    return new THREE.Color('#67e8f9');
  }, [isListening, isThinking, degradation]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    [leftRef, rightRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.scale.y = blinkScale;
      if (isSpeaking) {
        (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (0.8 + Math.sin(t * 8) * 0.4) * deg.glowIntensity;
      }
    });
  });

  return (
    <group position={[0, 1.35, 0.42]}>
      <mesh ref={leftRef} position={[-0.16, 0, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={1.2 * deg.glowIntensity}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={rightRef} position={[0.16, 0, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={1.2 * deg.glowIntensity}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function MouthGlow({ isSpeaking, degradation }: { isSpeaking: boolean; degradation: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const deg = degradationMultiplier(degradation);

  useFrame((state) => {
    if (!ref.current) return;
    if (isSpeaking) {
      const t = state.clock.elapsedTime;
      const scale = 0.6 + Math.sin(t * 10) * 0.3 + Math.sin(t * 7) * 0.15;
      ref.current.scale.set(scale, scale * 0.5, scale);
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (0.8 + Math.sin(t * 12) * 0.5) * deg.glowIntensity;
      ref.current.visible = true;
    } else {
      ref.current.visible = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 1.05, 0.5]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial
        color="#f472b6"
        emissive="#f472b6"
        emissiveIntensity={1}
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </mesh>
  );
}

function ListeningGlow({ isListening, degradation }: { isListening: boolean; degradation: string }) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const deg = degradationMultiplier(degradation);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.8 + Math.sin(t * 3) * 0.3;
    [leftRef, rightRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.visible = isListening;
      if (isListening) {
        ref.current.scale.setScalar(pulse);
        (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (0.6 + Math.sin(t * 4) * 0.4) * deg.glowIntensity;
      }
    });
  });

  return (
    <group position={[0, 1.3, 0]}>
      <mesh ref={leftRef} position={[-0.55, 0.05, 0.1]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh ref={rightRef} position={[0.55, 0.05, 0.1]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Body({ limbicState, degradation }: { limbicState: LimbicState; degradation: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const deg = degradationMultiplier(degradation);

  const bodyColor = useMemo(() => {
    const posture = limbicState.posture || 'COMPANION';
    const colors = POSTURE_COLORS[posture] || POSTURE_COLORS.COMPANION;
    const base = new THREE.Color(colors[0]);
    if (degradation === 'DORMANT') base.multiplyScalar(0.3);
    if (degradation === 'DREAMING') base.lerp(new THREE.Color('#4338ca'), 0.5);
    return base;
  }, [limbicState.posture, degradation]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const breathe = Math.sin(t * 1.5 * deg.speed) * 0.02;
    meshRef.current.scale.set(1, 1 + breathe, 1);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.15, 0]}>
      <capsuleGeometry args={[0.35, 0.9, 12, 24]} />
      <MeshDistortMaterial
        color={bodyColor}
        emissive={bodyColor}
        emissiveIntensity={0.15 * deg.glowIntensity}
        roughness={0.3}
        metalness={0.6}
        distort={0.12}
        speed={1.2 * deg.speed}
        transparent
        opacity={degradation === 'DORMANT' ? 0.6 : 0.9}
      />
    </mesh>
  );
}

function EnergyParticles({ limbicState, isThinking, degradation }: {
  limbicState: LimbicState; isThinking: boolean; degradation: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const deg = degradationMultiplier(degradation);

  const particles = useMemo(() => {
    const count = Math.floor(24 * deg.particleCount);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      radius: 0.9 + Math.random() * 0.6,
      speed: 0.3 + Math.random() * 0.8,
      offset: (i / count) * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 2,
      size: 0.02 + Math.random() * 0.03,
      color: degradation === 'DREAMING'
        ? ['#818cf8', '#a78bfa', '#c4b5fd', '#6366f1'][i % 4]
        : ['#8b5cf6', '#06b6d4', '#f472b6', '#fbbf24', '#22d3ee', '#a78bfa'][i % 6],
    }));
  }, [degradation, deg.particleCount]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const speedMult = isThinking ? 3 : (1 + limbicState.arousal * 2);

    groupRef.current.children.forEach((child, i) => {
      if (i >= particles.length) return;
      const p = particles[i];
      const angle = p.offset + t * p.speed * speedMult * deg.speed;
      child.position.x = Math.cos(angle) * p.radius;
      child.position.z = Math.sin(angle) * p.radius;
      child.position.y = p.yOffset + Math.sin(t * 2 + p.offset) * 0.2;

      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = (0.5 + Math.sin(t * 3 + p.offset) * 0.5) * deg.glowIntensity;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.6, 0]}>
      {particles.map((p) => (
        <mesh key={p.id}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={1}
            toneMapped={false}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function EnergyRings({ limbicState, isThinking, degradation }: {
  limbicState: LimbicState; isThinking: boolean; degradation: string;
}) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const deg = degradationMultiplier(degradation);

  const ringColor = useMemo(() => {
    if (degradation === 'DREAMING') return new THREE.Color('#6366f1');
    if (degradation === 'DORMANT') return new THREE.Color('#64748b');
    return valenceToColor(limbicState.valence, degradation);
  }, [limbicState.valence, degradation]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = isThinking ? 2 : (0.5 + limbicState.arousal * 1.5);

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * speed * deg.speed * 0.3) * 0.3;
      ring1Ref.current.rotation.z = t * speed * deg.speed * 0.2;
      (ring1Ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (0.3 + Math.sin(t * 2) * 0.2) * limbicState.trust * deg.glowIntensity;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * speed * deg.speed * 0.15;
      ring2Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * speed * deg.speed * 0.25) * 0.2;
      (ring2Ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (0.2 + Math.sin(t * 2.5 + 1) * 0.15) * limbicState.trust * deg.glowIntensity;
    }
  });

  return (
    <group position={[0, 0.6, 0]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.0, 0.008, 8, 64]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.4 * deg.glowIntensity}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.15, 0.006, 8, 64]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.3 * deg.glowIntensity}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function AuraGlow({ limbicState, isThinking, degradation }: {
  limbicState: LimbicState; isThinking: boolean; degradation: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const deg = degradationMultiplier(degradation);

  const glowColor = useMemo(() => {
    if (isThinking) return new THREE.Color('#7c3aed');
    return valenceToColor(limbicState.valence, degradation);
  }, [isThinking, limbicState.valence, degradation]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * (isThinking ? 4 : 1.5) * deg.speed) * 0.08;
    ref.current.scale.setScalar(pulse);
    (ref.current.material as THREE.MeshStandardMaterial).opacity =
      (0.06 + Math.sin(t * 2) * 0.03) * limbicState.trust * deg.glowIntensity;
  });

  return (
    <mesh ref={ref} position={[0, 0.6, 0]}>
      <sphereGeometry args={[1.3, 32, 32]} />
      <meshStandardMaterial
        color={glowColor}
        emissive={glowColor}
        emissiveIntensity={0.2}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function AvatarScene({ limbicState, isThinking, isSpeaking, isListening, degradationState, interactive }: {
  limbicState: LimbicState;
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  degradationState: string;
  interactive: boolean;
}) {
  const floatSpeed = useMemo(() => {
    if (degradationState === 'DREAMING') return 0.8;
    if (degradationState === 'DORMANT') return 0.5;
    return 1 + limbicState.arousal * 2;
  }, [limbicState.arousal, degradationState]);

  const floatIntensity = useMemo(() => {
    if (degradationState === 'DORMANT') return 0.3;
    if (degradationState === 'DREAMING') return 0.8;
    return 0.5 + limbicState.arousal * 0.5;
  }, [limbicState.arousal, degradationState]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#e2e8f0" />
      <pointLight position={[-3, 3, -3]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#06b6d4" />

      <Float
        speed={floatSpeed}
        rotationIntensity={0.15}
        floatIntensity={floatIntensity}
        floatingRange={[-0.15, 0.15]}
      >
        <group>
          <Head
            limbicState={limbicState}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            isListening={isListening}
            degradation={degradationState}
          />
          <Eyes
            limbicState={limbicState}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            isListening={isListening}
            degradation={degradationState}
          />
          <MouthGlow isSpeaking={isSpeaking} degradation={degradationState} />
          <ListeningGlow isListening={isListening} degradation={degradationState} />
          <Body limbicState={limbicState} degradation={degradationState} />
        </group>
      </Float>

      <EnergyParticles
        limbicState={limbicState}
        isThinking={isThinking}
        degradation={degradationState}
      />
      <EnergyRings
        limbicState={limbicState}
        isThinking={isThinking}
        degradation={degradationState}
      />
      <AuraGlow
        limbicState={limbicState}
        isThinking={isThinking}
        degradation={degradationState}
      />

      <Environment preset="night" />
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
        />
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
      <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
}

export function SallieAvatar3D({
  limbicState,
  isThinking = false,
  isSpeaking = false,
  isListening = false,
  degradationState = 'FULL',
  size = 'lg',
  interactive = false,
  className = '',
}: SallieAvatar3DProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={`relative ${className}`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      role="img"
      aria-label={`Sallie 3D avatar - ${isThinking ? 'thinking' : isSpeaking ? 'speaking' : isListening ? 'listening' : degradationState.toLowerCase()}`}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0.8, 3.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <AvatarScene
            limbicState={limbicState}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            isListening={isListening}
            degradationState={degradationState}
            interactive={interactive}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

export function SallieAvatar3DWrapper(props: SallieAvatar3DProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <LoadingFallback />;
  return <SallieAvatar3D {...props} />;
}

export default SallieAvatar3D;
