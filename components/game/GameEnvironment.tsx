"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function BambooCluster({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(t * 1.2 + position[0]) * 0.025;
    }
  });

  const stalks = useMemo(
    () => [
      { x: 0, z: 0, h: 3.3, tiltX: 0.03, tiltZ: 0.02 },
      { x: 0.25, z: 0.16, h: 2.8, tiltX: -0.04, tiltZ: 0.05 },
      { x: -0.22, z: 0.14, h: 3.0, tiltX: 0.03, tiltZ: -0.05 },
      { x: 0.14, z: -0.2, h: 2.5, tiltX: -0.03, tiltZ: -0.03 },
      { x: -0.16, z: -0.18, h: 2.7, tiltX: 0.04, tiltZ: 0.04 },
    ],
    []
  );

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Small Mossy Base Mound sitting flush on the lawn */}
      <mesh position={[0, 0.08, 0]} scale={[1.25, 0.4, 1.25]} receiveShadow>
        <sphereGeometry args={[0.52, 12, 12]} />
        <meshStandardMaterial color="#40916C" roughness={0.75} />
      </mesh>
      {stalks.map((s, idx) => (
        <group
          key={idx}
          position={[s.x, s.h / 2, s.z]}
          rotation={[s.tiltX, 0, s.tiltZ]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.055, 0.075, s.h, 8]} />
            <meshStandardMaterial color="#52B788" roughness={0.5} />
          </mesh>
          {[0.25, 0.75, 1.25].map((nodeY, nIdx) => (
            <mesh key={nIdx} position={[0, nodeY - s.h / 2 + 0.45, 0]}>
              <torusGeometry args={[0.066, 0.014, 6, 12]} />
              <meshStandardMaterial color="#2D6A4F" />
            </mesh>
          ))}
          <mesh position={[0, s.h / 2, 0]} castShadow>
            <dodecahedronGeometry args={[0.46, 1]} />
            <meshStandardMaterial color="#74C69D" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function VietnameseWoodenBridge({
  side,
}: {
  side: "west" | "east";
}) {
  const dir = side === "west" ? -1 : 1;
  // Connects Island edge (|x| = 9.0) across the Lake to Outer Shore (|x| = 18.2)
  const centerX = dir * 13.6;

  // 7 arched bridge plank segments from x = -4.4 to +4.4 relative to centerX
  const segments = useMemo(() => {
    const count = 7;
    const span = 8.8;
    const step = span / count;
    return Array.from({ length: count }).map((_, i) => {
      const norm = (i + 0.5) / count - 0.5; // -0.43 to +0.43
      const localX = norm * span;
      // Gentle parabolic arch peaking at y = +0.18 in the center and y = -0.12 at the ends
      const archY = 0.18 - norm * norm * 1.25;
      // Tilt tangent to the parabola
      const tiltZ = 2.5 * norm * 0.22;
      return { localX, archY, tiltZ, width: step + 0.06 };
    });
  }, []);

  return (
    <group position={[centerX, 0, 0]}>
      {/* Stone Landing Steps at Island End & Shore End */}
      <RoundedBox
        args={[1.1, 0.24, 2.1]}
        position={[-dir * 4.5, -0.2, 0]}
        radius={0.05}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#DDA15E" roughness={0.6} />
      </RoundedBox>
      <RoundedBox
        args={[1.4, 0.9, 2.2]}
        position={[dir * 4.5, -0.55, 0]}
        radius={0.06}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#DDA15E" roughness={0.6} />
      </RoundedBox>

      {/* Arched Wooden Deck Planks */}
      {segments.map((seg, idx) => (
        <group
          key={idx}
          position={[seg.localX, seg.archY, 0]}
          rotation={[0, 0, seg.tiltZ]}
        >
          <RoundedBox
            args={[seg.width, 0.12, 1.75]}
            radius={0.03}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#9C6644" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}

      {/* Vertical Wooden Pilings going down into the lake water + Railing Posts & Handrails */}
      {[-3.6, -1.8, 0, 1.8, 3.6].map((postX, idx) => {
        const norm = postX / 8.8;
        const deckY = 0.18 - norm * norm * 1.25;
        return (
          <group key={idx} position={[postX, 0, 0]}>
            {/* Underwater Support Piling */}
            <mesh position={[0, (deckY - 1.0) / 2, -0.7]} castShadow>
              <cylinderGeometry args={[0.08, 0.09, deckY + 1.0, 8]} />
              <meshStandardMaterial color="#582F0E" roughness={0.75} />
            </mesh>
            <mesh position={[0, (deckY - 1.0) / 2, 0.7]} castShadow>
              <cylinderGeometry args={[0.08, 0.09, deckY + 1.0, 8]} />
              <meshStandardMaterial color="#582F0E" roughness={0.75} />
            </mesh>

            {/* Upper Railing Posts */}
            <mesh position={[0, deckY + 0.28, -0.76]} castShadow>
              <cylinderGeometry args={[0.055, 0.065, 0.52, 8]} />
              <meshStandardMaterial color="#7F4F24" roughness={0.6} />
            </mesh>
            <mesh position={[0, deckY + 0.28, 0.76]} castShadow>
              <cylinderGeometry args={[0.055, 0.065, 0.52, 8]} />
              <meshStandardMaterial color="#7F4F24" roughness={0.6} />
            </mesh>
            {/* Golden Post Caps */}
            <mesh position={[0, deckY + 0.56, -0.76]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#FFD166" roughness={0.3} />
            </mesh>
            <mesh position={[0, deckY + 0.56, 0.76]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#FFD166" roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Left & Right Continuous Wooden Handrails */}
      <RoundedBox
        args={[8.6, 0.07, 0.08]}
        position={[0, 0.36, -0.76]}
        radius={0.02}
        castShadow
      >
        <meshStandardMaterial color="#BC4749" roughness={0.5} />
      </RoundedBox>
      <RoundedBox
        args={[8.6, 0.07, 0.08]}
        position={[0, 0.36, 0.76]}
        radius={0.02}
        castShadow
      >
        <meshStandardMaterial color="#BC4749" roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

function TropicalTree({
  position,
  scale = 1,
  foliageColor = "#40916C",
}: {
  position: [number, number, number];
  scale?: number;
  foliageColor?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.1, 8]} />
        <meshStandardMaterial color="#6F4E37" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.32, 1.1, 0.22]} castShadow>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#52B788" roughness={0.65} />
      </mesh>
      <mesh position={[-0.3, 1.15, -0.18]} castShadow>
        <dodecahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial color="#74C69D" roughness={0.65} />
      </mesh>
    </group>
  );
}

function RockCluster({
  position,
  scale = 1,
  rotationY = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.18, 0]} scale={[1.2, 0.8, 1.0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#7F5539" roughness={0.85} />
      </mesh>
      <mesh position={[0.32, 0.12, 0.15]} scale={[1.0, 0.65, 0.85]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color="#9C6644" roughness={0.85} />
      </mesh>
      <mesh position={[-0.28, 0.12, 0.2]} scale={[0.85, 0.6, 0.85]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#52B788" roughness={0.75} />
      </mesh>
    </group>
  );
}

type SpectatorSpecies = "buffalo" | "bunny" | "monkey" | "duck";

function CheeringSpectatorAnimal({
  species,
  position,
  rotationY,
  phaseOffset = 0,
  flagColor = "#E63946",
}: {
  species: SpectatorSpecies;
  position: [number, number, number];
  rotationY: number;
  phaseOffset?: number;
  flagColor?: string;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const colors = useMemo(() => {
    switch (species) {
      case "buffalo":
        return { primary: "#5C6B73", belly: "#9DB4C0", nose: "#253237" };
      case "bunny":
        return { primary: "#FFFDF7", belly: "#FFE5EC", nose: "#FF758F" };
      case "monkey":
        return { primary: "#B5651D", belly: "#F4A261", nose: "#3D2B1F" };
      case "duck":
      default:
        return { primary: "#FFD166", belly: "#FFF3B0", nose: "#F77F00" };
    }
  }, [species]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 4.2 + phaseOffset;
    if (rootRef.current) {
      // Excited cheering hop & body sway
      const hop = Math.abs(Math.sin(t)) * 0.18;
      rootRef.current.position.y = position[1] + hop;
      rootRef.current.rotation.z = Math.cos(t * 0.5) * 0.08;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.65 + Math.sin(t * 1.5) * 0.45;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.65 - Math.cos(t * 1.5) * 0.45;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t) * 0.12;
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, rotationY, 0]} scale={0.92}>
      {/* Small Wooden Stand / Cushion */}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.08, 16]} />
        <meshStandardMaterial color="#DDA15E" roughness={0.5} />
      </mesh>

      {/* Chubby Body */}
      <mesh position={[0, 0.28, 0]} scale={[1.0, 1.05, 0.95]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={colors.primary} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.26, 0.15]} scale={[0.7, 0.75, 0.4]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={colors.belly} roughness={0.5} />
      </mesh>

      {/* Waving Left Arm */}
      <group ref={leftArmRef} position={[-0.2, 0.34, 0.04]}>
        <mesh position={[-0.08, 0.08, 0]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.045, 0.12, 6, 8]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
      </group>

      {/* Waving Right Arm holding a little Vietnamese Festival Flag (Cờ Hội) */}
      <group ref={rightArmRef} position={[0.2, 0.34, 0.04]}>
        <mesh position={[0.08, 0.08, 0]} rotation={[0, 0, -0.5]} castShadow>
          <capsuleGeometry args={[0.045, 0.12, 6, 8]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        {/* Tiny Cheering Flag */}
        <group position={[0.14, 0.22, 0]} rotation={[0, 0, -0.25]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.42, 6]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0.11, 0.12, 0]}>
            <boxGeometry args={[0.22, 0.15, 0.02]} />
            <meshStandardMaterial color={flagColor} emissive={flagColor} emissiveIntensity={0.2} />
          </mesh>
        </group>
      </group>

      {/* Cute Head */}
      <group ref={headRef} position={[0, 0.56, 0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.21, 18, 18]} />
          <meshStandardMaterial color={colors.primary} roughness={0.42} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.08, 0.03, 0.18]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#1D1E2C" />
        </mesh>
        <mesh position={[0.08, 0.03, 0.18]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#1D1E2C" />
        </mesh>
        {/* Rosy Cheeks */}
        <mesh position={[-0.12, -0.02, 0.16]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#FF758F" />
        </mesh>
        <mesh position={[0.12, -0.02, 0.16]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#FF758F" />
        </mesh>
        {/* Snout / Beak */}
        <mesh position={[0, -0.02, 0.2]} scale={[1.2, 0.8, 0.9]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={colors.nose} roughness={0.4} />
        </mesh>

        {/* Species-specific Ears / Horns / Nón Lá */}
        {species === "buffalo" && (
          <group>
            {/* Curved Buffalo Horns (Sừng Trâu) */}
            <mesh position={[-0.19, 0.14, 0]} rotation={[0, 0, 0.85]} castShadow>
              <coneGeometry args={[0.045, 0.22, 8]} />
              <meshStandardMaterial color="#E0E1DD" />
            </mesh>
            <mesh position={[0.19, 0.14, 0]} rotation={[0, 0, -0.85]} castShadow>
              <coneGeometry args={[0.045, 0.22, 8]} />
              <meshStandardMaterial color="#E0E1DD" />
            </mesh>
            {/* Tiny Nón Lá */}
            <mesh position={[0, 0.23, -0.02]} castShadow>
              <coneGeometry args={[0.22, 0.12, 16]} />
              <meshStandardMaterial color="#E9D8A6" />
            </mesh>
          </group>
        )}

        {species === "bunny" && (
          <group>
            {/* Long Bunny Ears */}
            <mesh position={[-0.09, 0.27, 0]} rotation={[0, 0, 0.12]} scale={[0.7, 1.5, 0.4]} castShadow>
              <capsuleGeometry args={[0.055, 0.14, 6, 8]} />
              <meshStandardMaterial color={colors.primary} />
            </mesh>
            <mesh position={[0.09, 0.27, 0]} rotation={[0, 0, -0.12]} scale={[0.7, 1.5, 0.4]} castShadow>
              <capsuleGeometry args={[0.055, 0.14, 6, 8]} />
              <meshStandardMaterial color={colors.primary} />
            </mesh>
          </group>
        )}

        {species === "monkey" && (
          <group>
            <mesh position={[-0.2, 0.02, 0]} castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color={colors.primary} />
            </mesh>
            <mesh position={[0.2, 0.02, 0]} castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color={colors.primary} />
            </mesh>
          </group>
        )}

        {species === "duck" && (
          /* Cute Top Tuft + Headband */
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
        )}
      </group>
    </group>
  );
}

function VietnamesePavilion({
  position,
  rotationY = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Dedicated Mini Island Mound so the Pavilion stands proudly over the water */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[1.65, 2.05, 0.36, 16]} />
        <meshStandardMaterial color="#95D5B2" roughness={0.7} />
      </mesh>
      {/* Stone Pedestal Base */}
      <mesh position={[0, 0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.2, 1.35, 0.24, 6]} />
        <meshStandardMaterial color="#DDA15E" roughness={0.6} />
      </mesh>
      {/* 6 Wooden Pillars */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.88, 0.82, Math.sin(angle) * 0.88]}
            castShadow
          >
            <cylinderGeometry args={[0.065, 0.075, 1.15, 8]} />
            <meshStandardMaterial color="#6F4E37" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Lower Curved Roof (Mái Đình) */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <coneGeometry args={[1.6, 0.56, 6]} />
        <meshStandardMaterial color="#BC4749" roughness={0.5} />
      </mesh>
      {/* Upper Roof Tier */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[1.08, 0.5, 6]} />
        <meshStandardMaterial color="#A7333F" roughness={0.5} />
      </mesh>
      {/* Golden Finial */}
      <mesh position={[0, 2.26, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#FFD166" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

function FloatingCloud({
  initialPos,
  speed = 0.09,
  scale = 1,
}: {
  initialPos: [number, number, number];
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.x =
        initialPos[0] + Math.sin(t * speed + initialPos[2]) * 2.0;
      ref.current.position.y =
        initialPos[1] + Math.cos(t * speed * 1.4 + initialPos[0]) * 0.18;
    }
  });

  return (
    <group ref={ref} position={initialPos} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, -0.15, 0.1]}>
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
      <mesh position={[-0.85, -0.2, -0.1]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FlyingFlock() {
  const flockRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (flockRef.current) {
      const t = clock.getElapsedTime() * 0.14;
      flockRef.current.position.x = Math.cos(t) * 20;
      flockRef.current.position.z = Math.sin(t) * 18 - 6;
      flockRef.current.position.y = 8.2 + Math.sin(t * 2) * 0.5;
      flockRef.current.rotation.y = -t;
    }
  });

  return (
    <group ref={flockRef}>
      {[
        [0, 0, 0],
        [-0.7, 0.2, -0.6],
        [0.7, 0.15, -0.6],
        [-1.3, 0.35, -1.2],
        [1.3, 0.3, -1.2],
      ].map((offset, idx) => (
        <group key={idx} position={offset as [number, number, number]}>
          <mesh rotation={[0, 0, 0.25]} position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.26, 0.03, 0.1]} />
            <meshBasicMaterial color="#FFFDF7" />
          </mesh>
          <mesh rotation={[0, 0, -0.25]} position={[0.12, 0, 0]}>
            <boxGeometry args={[0.26, 0.03, 0.1]} />
            <meshBasicMaterial color="#FFFDF7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function GameEnvironment() {
  // Outer ring of mountains placed at radius 26..32 so they never collide with lake/pavilions/bridges
  const mountainRange = useMemo(
    () => [
      // North / Back Mountain Range
      { pos: [-22, -1.1, -20], r: 7.2, h: 12.5, color: "#7F5539", capColor: "#52B788", rot: 0.2 },
      { pos: [-11.5, -1.1, -24], r: 8.0, h: 15.0, color: "#6F4E37", capColor: "#40916C", rot: 0.8 },
      { pos: [0, -1.1, -25.5], r: 7.5, h: 13.8, color: "#8B5E3C", capColor: "#52B788", rot: 1.4 },
      { pos: [11.5, -1.1, -24], r: 8.2, h: 15.5, color: "#6F4E37", capColor: "#40916C", rot: 0.5 },
      { pos: [22, -1.1, -20], r: 7.2, h: 12.8, color: "#7F5539", capColor: "#52B788", rot: 1.1 },

      // West & East Distant Mountains (Radius >= 26)
      { pos: [-26.5, -1.1, -9.5], r: 6.8, h: 11.2, color: "#8B5E3C", capColor: "#52B788", rot: 0.4 },
      { pos: [-27.5, -1.1, 2.0], r: 6.5, h: 9.8, color: "#9C6644", capColor: "#74C69D", rot: 1.2 },
      { pos: [-24.5, -1.1, 13.0], r: 6.8, h: 10.0, color: "#7F5539", capColor: "#52B788", rot: 2.1 },
      { pos: [26.5, -1.1, -9.5], r: 6.8, h: 11.0, color: "#8B5E3C", capColor: "#52B788", rot: 0.9 },
      { pos: [27.5, -1.1, 2.0], r: 6.5, h: 9.6, color: "#9C6644", capColor: "#74C69D", rot: 0.7 },
      { pos: [24.5, -1.1, 13.0], r: 6.8, h: 10.2, color: "#7F5539", capColor: "#52B788", rot: 1.6 },
    ],
    []
  );

  // Rolling green foothills strictly away from z=0 bridge landings!
  const foothills = useMemo(
    () => [
      { pos: [-17.5, -1.0, -15.5], sx: 5.2, sy: 2.2, sz: 4.0, color: "#52B788" },
      { pos: [-6.5, -1.0, -19.5], sx: 6.0, sy: 2.1, sz: 4.0, color: "#74C69D" },
      { pos: [6.5, -1.0, -19.5], sx: 6.0, sy: 2.3, sz: 4.0, color: "#52B788" },
      { pos: [17.5, -1.0, -15.5], sx: 5.2, sy: 2.2, sz: 4.0, color: "#74C69D" },
      { pos: [-22.5, -1.0, -9.5], sx: 4.2, sy: 1.9, sz: 4.2, color: "#74C69D" },
      { pos: [22.5, -1.0, -9.5], sx: 4.2, sy: 1.9, sz: 4.2, color: "#52B788" },
      { pos: [-21.5, -1.0, 9.0], sx: 4.5, sy: 1.9, sz: 4.2, color: "#52B788" },
      { pos: [21.5, -1.0, 9.0], sx: 4.5, sy: 1.9, sz: 4.2, color: "#74C69D" },
    ],
    []
  );

  return (
    <group>
      {/* =====================================================================
          1. CONTINUOUS VALLEY FLOOR & TRANQUIL EMERALD LAKE
         ===================================================================== */}
      {/* Vast Outer Valley Meadow Floor extending to the horizon (top at y = -1.05) */}
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <cylinderGeometry args={[58, 58, 0.6, 48]} />
        <meshStandardMaterial color="#74C69D" roughness={0.85} />
      </mesh>

      {/* Tranquil Valley Lake surrounding the central island (radius = 18.2, top at y = -0.92) */}
      <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18.2, 48]} />
        <meshStandardMaterial
          color="#2EC4B6"
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* =====================================================================
          2. STEPPED VIETNAMESE TERRACED ISLAND FOR THE GAME BOARD
         ===================================================================== */}
      {/* Tier 1 (Top): Lush Green Board Lawn (top at y = -0.18, bottom at -0.46) */}
      <mesh position={[0, -0.32, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.2, 9.6, 0.28, 40]} />
        <meshStandardMaterial color="#95D5B2" roughness={0.65} />
      </mesh>

      {/* Tier 2 (Middle): Golden-Green Rice Terrace Step (top at y = -0.47, bottom at -0.75) */}
      <mesh position={[0, -0.61, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[10.5, 11.0, 0.28, 40]} />
        <meshStandardMaterial color="#74C69D" roughness={0.7} />
      </mesh>

      {/* Tier 3 (Lower Bank): Warm Brown Stone & Earth Embankment into the Lake (top at y = -0.76, bottom at -1.12) */}
      <mesh position={[0, -0.94, 0]} receiveShadow>
        <cylinderGeometry args={[11.8, 12.6, 0.36, 40]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.82} />
      </mesh>

      {/* =====================================================================
          3. TWO ARCHED VIETNAMESE WOODEN BRIDGES SPANNING OVER THE LAKE
             (Elevated arch y = -0.12 to +0.18 so they never clip into island/hills!)
         ===================================================================== */}
      <VietnameseWoodenBridge side="west" />
      <VietnameseWoodenBridge side="east" />

      {/* =====================================================================
          4. BAMBOO GROVES (RẶNG TRE), PAVILIONS (THỦY ĐÌNH), TREES & BOULDERS
         ===================================================================== */}
      {/* 4 Bamboo Groves on the Central Island Corners */}
      <BambooCluster position={[-6.8, -0.18, -4.4]} scale={0.95} />
      <BambooCluster position={[6.8, -0.18, -4.4]} scale={0.95} />
      <BambooCluster position={[-6.8, -0.18, 4.4]} scale={0.9} />
      <BambooCluster position={[6.8, -0.18, 4.4]} scale={0.9} />

      {/* 4 Welcoming Bamboo Groves flanking the West & East Bridge Landings */}
      <BambooCluster position={[-19.2, -1.05, -2.6]} scale={1.1} />
      <BambooCluster position={[-19.2, -1.05, 2.6]} scale={1.05} />
      <BambooCluster position={[19.2, -1.05, -2.6]} scale={1.1} />
      <BambooCluster position={[19.2, -1.05, 2.6]} scale={1.05} />

      {/* Traditional Vietnamese Pavilions (Thủy Đình) on their own lake islets */}
      <VietnamesePavilion position={[-13.5, -0.82, -6.8]} rotationY={0.45} scale={1.0} />
      <VietnamesePavilion position={[13.5, -0.82, -6.8]} rotationY={-0.45} scale={1.0} />

      {/* Decorative Boulders on Tier 1 Lawn */}
      <RockCluster position={[-7.5, -0.18, 0]} scale={0.82} rotationY={0.4} />
      <RockCluster position={[7.5, -0.18, 0]} scale={0.82} rotationY={1.8} />

      {/* 4 Cute Cheering Spectator Animals around the Board Lawn */}
      <CheeringSpectatorAnimal
        species="buffalo"
        position={[-6.1, -0.18, -1.8]}
        rotationY={Math.PI / 2}
        phaseOffset={0}
        flagColor="#1D63B8"
      />
      <CheeringSpectatorAnimal
        species="bunny"
        position={[-6.1, -0.18, 1.9]}
        rotationY={Math.PI / 2}
        phaseOffset={1.6}
        flagColor="#E63946"
      />
      <CheeringSpectatorAnimal
        species="monkey"
        position={[6.1, -0.18, -1.9]}
        rotationY={-Math.PI / 2}
        phaseOffset={0.8}
        flagColor="#1D63B8"
      />
      <CheeringSpectatorAnimal
        species="duck"
        position={[6.1, -0.18, 1.8]}
        rotationY={-Math.PI / 2}
        phaseOffset={2.4}
        flagColor="#E63946"
      />

      {/* Lush Tropical Trees along the outer lake shore */}
      <TropicalTree position={[-14.5, -1.05, -12.5]} scale={1.2} foliageColor="#40916C" />
      <TropicalTree position={[-9.5, -1.05, -16.2]} scale={1.1} foliageColor="#52B788" />
      <TropicalTree position={[9.5, -1.05, -16.2]} scale={1.15} foliageColor="#40916C" />
      <TropicalTree position={[14.5, -1.05, -12.5]} scale={1.15} foliageColor="#52B788" />

      {/* =====================================================================
          5. CONNECTED ROLLING FOOTHILLS & BROWN MOUNTAIN AMPHITHEATER
         ===================================================================== */}
      {foothills.map((fh, idx) => (
        <mesh
          key={`fh-${idx}`}
          position={fh.pos as [number, number, number]}
          scale={[fh.sx, fh.sy, fh.sz]}
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={fh.color} roughness={0.8} />
        </mesh>
      ))}

      {mountainRange.map((m, idx) => (
        <group
          key={`mt-${idx}`}
          position={m.pos as [number, number, number]}
          rotation={[0, m.rot, 0]}
        >
          <mesh position={[0, m.h / 2, 0]} receiveShadow castShadow>
            <coneGeometry args={[m.r, m.h, 7]} />
            <meshStandardMaterial color={m.color} roughness={0.85} />
          </mesh>

          <mesh
            position={[m.r * 0.5, m.h * 0.3, m.r * 0.2]}
            rotation={[0, 0.6, 0]}
            receiveShadow
          >
            <coneGeometry args={[m.r * 0.65, m.h * 0.6, 6]} />
            <meshStandardMaterial color="#9C6644" roughness={0.85} />
          </mesh>

          <mesh position={[0, m.h * 0.14, m.r * 0.35]} scale={[1.3, 0.55, 0.9]}>
            <dodecahedronGeometry args={[m.r * 0.55, 1]} />
            <meshStandardMaterial color={m.capColor} roughness={0.78} />
          </mesh>
        </group>
      ))}

      {/* =====================================================================
          6. SOFT FLOATING CLOUDS & WHITE EGRETS
         ===================================================================== */}
      <FloatingCloud initialPos={[-10, 7.2, -13]} speed={0.09} scale={1.1} />
      <FloatingCloud initialPos={[10, 7.6, -14]} speed={0.08} scale={1.25} />
      <FloatingCloud initialPos={[-15, 6.2, 2]} speed={0.1} scale={0.9} />
      <FloatingCloud initialPos={[15, 6.5, 3]} speed={0.09} scale={0.95} />

      <FlyingFlock />
    </group>
  );
}
