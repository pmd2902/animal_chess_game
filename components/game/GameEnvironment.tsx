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
      { x: 0, z: 0, h: 3.2, tiltX: 0.04, tiltZ: 0.02 },
      { x: 0.24, z: 0.16, h: 2.7, tiltX: -0.05, tiltZ: 0.06 },
      { x: -0.2, z: 0.14, h: 2.9, tiltX: 0.03, tiltZ: -0.06 },
      { x: 0.12, z: -0.2, h: 2.3, tiltX: -0.04, tiltZ: -0.04 },
    ],
    []
  );

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Small Mossy Mound under Bamboo */}
      <mesh position={[0, 0.08, 0]} scale={[1.2, 0.45, 1.2]} receiveShadow>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#52B788" roughness={0.75} />
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
            <mesh key={nIdx} position={[0, nodeY - s.h / 2 + 0.5, 0]}>
              <torusGeometry args={[0.068, 0.014, 6, 12]} />
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
      {/* Tree Trunk */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.1, 8]} />
        <meshStandardMaterial color="#6F4E37" roughness={0.8} />
      </mesh>
      {/* Layered Rounded Foliage */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <dodecahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial color={foliageColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.35, 1.1, 0.25]} castShadow>
        <dodecahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial color="#52B788" roughness={0.65} />
      </mesh>
      <mesh position={[-0.32, 1.15, -0.2]} castShadow>
        <dodecahedronGeometry args={[0.55, 1]} />
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
      <mesh position={[0, 0.22, 0]} scale={[1.3, 0.85, 1.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#7F5539" roughness={0.85} />
      </mesh>
      <mesh position={[0.38, 0.14, 0.18]} scale={[1.1, 0.7, 0.9]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#9C6644" roughness={0.85} />
      </mesh>
      <mesh position={[-0.32, 0.15, 0.24]} scale={[0.9, 0.65, 0.9]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color="#52B788" roughness={0.75} />
      </mesh>
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
      {/* Stone Base */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.15, 1.3, 0.24, 6]} />
        <meshStandardMaterial color="#B08968" roughness={0.7} />
      </mesh>
      {/* 6 Wooden Columns */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.85, 0.75, Math.sin(angle) * 0.85]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.07, 1.1, 8]} />
            <meshStandardMaterial color="#6F4E37" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Lower Curved Roof (Mái Đình) */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[1.55, 0.55, 6]} />
        <meshStandardMaterial color="#BC4749" roughness={0.5} />
      </mesh>
      {/* Upper Roof Tier */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <coneGeometry args={[1.05, 0.5, 6]} />
        <meshStandardMaterial color="#A7333F" roughness={0.5} />
      </mesh>
      {/* Golden Finial */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#FFD166" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

function FloatingCloud({
  initialPos,
  speed = 0.1,
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
        initialPos[0] + Math.sin(t * speed + initialPos[2]) * 2.2;
      ref.current.position.y =
        initialPos[1] + Math.cos(t * speed * 1.4 + initialPos[0]) * 0.2;
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
      const t = clock.getElapsedTime() * 0.15;
      flockRef.current.position.x = Math.cos(t) * 18;
      flockRef.current.position.z = Math.sin(t) * 16 - 6;
      flockRef.current.position.y = 7.8 + Math.sin(t * 2) * 0.6;
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
  // Continuous 360-degree ring of connected brown mountains & green foothills planted on the valley floor
  const mountainRange = useMemo(
    () => [
      // North / Back Mountain Range (Behind Blue side)
      { pos: [-16, -1.1, -15], r: 6.5, h: 11.5, color: "#7F5539", capColor: "#52B788", rot: 0.2 },
      { pos: [-9.5, -1.1, -17.5], r: 7.2, h: 14.2, color: "#6F4E37", capColor: "#40916C", rot: 0.8 },
      { pos: [-2.0, -1.1, -18.5], r: 6.8, h: 12.8, color: "#8B5E3C", capColor: "#52B788", rot: 1.4 },
      { pos: [5.5, -1.1, -18.0], r: 7.4, h: 14.8, color: "#6F4E37", capColor: "#40916C", rot: 0.5 },
      { pos: [13.0, -1.1, -15.5], r: 6.8, h: 12.2, color: "#7F5539", capColor: "#52B788", rot: 1.1 },
      { pos: [18.5, -1.1, -10.5], r: 6.2, h: 10.5, color: "#8B5E3C", capColor: "#74C69D", rot: 1.9 },

      // West & East Side Foothills (Framing the board without blocking camera)
      { pos: [-19.5, -1.1, -8.0], r: 6.0, h: 10.2, color: "#8B5E3C", capColor: "#52B788", rot: 0.4 },
      { pos: [-20.0, -1.1, -0.5], r: 5.8, h: 8.8, color: "#9C6644", capColor: "#74C69D", rot: 1.2 },
      { pos: [-18.5, -1.1, 7.0], r: 6.0, h: 9.2, color: "#7F5539", capColor: "#52B788", rot: 2.1 },
      { pos: [20.0, -1.1, -2.0], r: 5.8, h: 9.0, color: "#9C6644", capColor: "#74C69D", rot: 0.7 },
      { pos: [19.0, -1.1, 6.0], r: 6.2, h: 9.6, color: "#7F5539", capColor: "#52B788", rot: 1.6 },

      // South / Front Distant Hills
      { pos: [-13.5, -1.1, 14.5], r: 5.8, h: 8.2, color: "#8B5E3C", capColor: "#74C69D", rot: 0.9 },
      { pos: [14.0, -1.1, 14.0], r: 6.0, h: 8.5, color: "#8B5E3C", capColor: "#74C69D", rot: 1.3 },
    ],
    []
  );

  // Connecting green & brown rolling hills between the central lake and the tall mountains
  const foothills = useMemo(
    () => [
      { pos: [-12.5, -1.0, -11.5], sx: 5.5, sy: 2.4, sz: 4.5, color: "#52B788" },
      { pos: [-4.5, -1.0, -13.5], sx: 6.2, sy: 2.2, sz: 4.2, color: "#74C69D" },
      { pos: [4.5, -1.0, -13.5], sx: 6.0, sy: 2.5, sz: 4.4, color: "#52B788" },
      { pos: [12.5, -1.0, -11.0], sx: 5.2, sy: 2.3, sz: 4.5, color: "#74C69D" },
      { pos: [-14.5, -1.0, -3.0], sx: 4.5, sy: 2.0, sz: 5.5, color: "#74C69D" },
      { pos: [14.8, -1.0, -2.5], sx: 4.6, sy: 2.1, sz: 5.2, color: "#52B788" },
      { pos: [-13.5, -1.0, 6.5], sx: 4.8, sy: 1.9, sz: 4.8, color: "#52B788" },
      { pos: [13.8, -1.0, 6.5], sx: 4.8, sy: 2.0, sz: 4.8, color: "#74C69D" },
    ],
    []
  );

  return (
    <group>
      {/* =====================================================================
          1. CONTINUOUS VALLEY FLOOR & TRANQUIL EMERALD LAKE (NO SKY GAPS!)
         ===================================================================== */}
      {/* Vast Outer Valley Meadow Floor extending to the horizon (top at y = -1.05) */}
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <cylinderGeometry args={[52, 52, 0.6, 48]} />
        <meshStandardMaterial color="#74C69D" roughness={0.85} />
      </mesh>

      {/* Tranquil Valley Lake surrounding the central island (top at y = -0.92) */}
      <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14.2, 48]} />
        <meshStandardMaterial
          color="#2EC4B6"
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* =====================================================================
          2. STEPPED VIETNAMESE TERRACED ISLAND FOR THE GAME BOARD
             (Distinct heights & radii so zero surfaces ever Z-fight)
         ===================================================================== */}
      {/* Tier 1 (Top): Lush Green Board Lawn (top at y = -0.08, bottom at -0.38) */}
      <mesh position={[0, -0.23, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[7.2, 7.6, 0.3, 36]} />
        <meshStandardMaterial color="#95D5B2" roughness={0.65} />
      </mesh>

      {/* Tier 2 (Middle): Golden-Green Rice Terrace Step (top at y = -0.39, bottom at -0.69) */}
      <mesh position={[0, -0.54, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[8.3, 8.8, 0.3, 36]} />
        <meshStandardMaterial color="#74C69D" roughness={0.7} />
      </mesh>

      {/* Tier 3 (Lower Bank): Warm Brown Stone & Earth Embankment into the Lake (top at y = -0.70, bottom at -1.10) */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[9.4, 10.2, 0.4, 36]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.82} />
      </mesh>

      {/* =====================================================================
          3. WOODEN BRIDGES CONNECTING THE BOARD ISLAND TO THE VALLEY SHORES
         ===================================================================== */}
      {/* West Wooden Bridge */}
      <group position={[-10.5, -0.55, 0]}>
        <RoundedBox args={[5.2, 0.16, 1.5]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#8B5E3C" roughness={0.65} />
        </RoundedBox>
        {[-1.8, -0.6, 0.6, 1.8].map((xPos, i) => (
          <group key={i} position={[xPos, 0.25, 0]}>
            <mesh position={[0, 0, -0.68]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
              <meshStandardMaterial color="#582F0E" />
            </mesh>
            <mesh position={[0, 0, 0.68]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
              <meshStandardMaterial color="#582F0E" />
            </mesh>
          </group>
        ))}
      </group>

      {/* East Wooden Bridge */}
      <group position={[10.5, -0.55, 0]}>
        <RoundedBox args={[5.2, 0.16, 1.5]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#8B5E3C" roughness={0.65} />
        </RoundedBox>
        {[-1.8, -0.6, 0.6, 1.8].map((xPos, i) => (
          <group key={i} position={[xPos, 0.25, 0]}>
            <mesh position={[0, 0, -0.68]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
              <meshStandardMaterial color="#582F0E" />
            </mesh>
            <mesh position={[0, 0, 0.68]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
              <meshStandardMaterial color="#582F0E" />
            </mesh>
          </group>
        ))}
      </group>

      {/* =====================================================================
          4. VIETNAMESE PAVILIONS, BAMBOO GROVES, TREES & ROCKS ON THE TERRACE
         ===================================================================== */}
      {/* Traditional Vietnamese Pavilions (Thủy Đình) on the West & East Shores */}
      <VietnamesePavilion position={[-13.8, -1.05, -5.8]} rotationY={0.4} scale={1.1} />
      <VietnamesePavilion position={[13.8, -1.05, -5.8]} rotationY={-0.4} scale={1.1} />

      {/* Bamboo Clusters on the Board Island Corners */}
      <BambooCluster position={[-5.5, -0.1, -4.8]} scale={0.9} />
      <BambooCluster position={[5.5, -0.1, -4.8]} scale={0.85} />
      <BambooCluster position={[-5.6, -0.1, 4.7]} scale={0.8} />
      <BambooCluster position={[5.6, -0.1, 4.7]} scale={0.85} />

      {/* Decorative Boulders & Shrubs around the Board Terrace */}
      <RockCluster position={[-6.2, -0.1, -1.8]} scale={0.85} rotationY={0.4} />
      <RockCluster position={[6.2, -0.1, 1.9]} scale={0.85} rotationY={1.8} />
      <RockCluster position={[-4.8, -0.4, -6.8]} scale={1.0} rotationY={1.1} />
      <RockCluster position={[4.9, -0.4, -6.7]} scale={0.95} rotationY={2.4} />

      {/* Lush Tropical Trees framing the Valley Shoreline */}
      <TropicalTree position={[-11.2, -1.05, -8.5]} scale={1.25} foliageColor="#40916C" />
      <TropicalTree position={[-8.2, -1.05, -10.8]} scale={1.1} foliageColor="#52B788" />
      <TropicalTree position={[8.5, -1.05, -10.5]} scale={1.2} foliageColor="#40916C" />
      <TropicalTree position={[11.5, -1.05, -8.2]} scale={1.15} foliageColor="#52B788" />
      <TropicalTree position={[-13.2, -1.05, 3.8]} scale={1.1} foliageColor="#52B788" />
      <TropicalTree position={[13.2, -1.05, 3.8]} scale={1.15} foliageColor="#40916C" />

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
          {/* Main Earthy Brown Mountain Body planted firmly in the valley floor */}
          <mesh position={[0, m.h / 2, 0]} receiveShadow castShadow>
            <coneGeometry args={[m.r, m.h, 7]} />
            <meshStandardMaterial color={m.color} roughness={0.85} />
          </mesh>

          {/* Secondary Brown Ridge / Shoulder */}
          <mesh
            position={[m.r * 0.5, m.h * 0.3, m.r * 0.2]}
            rotation={[0, 0.6, 0]}
            receiveShadow
          >
            <coneGeometry args={[m.r * 0.65, m.h * 0.6, 6]} />
            <meshStandardMaterial color="#9C6644" roughness={0.85} />
          </mesh>

          {/* Lush Green Forest Foothill Skirt at Base of Mountain */}
          <mesh position={[0, m.h * 0.14, m.r * 0.35]} scale={[1.3, 0.55, 0.9]}>
            <dodecahedronGeometry args={[m.r * 0.55, 1]} />
            <meshStandardMaterial color={m.capColor} roughness={0.78} />
          </mesh>
        </group>
      ))}

      {/* =====================================================================
          6. SOFT FLOATING CLOUDS & WHITE EGRETS
         ===================================================================== */}
      <FloatingCloud initialPos={[-9, 6.8, -11]} speed={0.09} scale={1.1} />
      <FloatingCloud initialPos={[8, 7.5, -12]} speed={0.08} scale={1.25} />
      <FloatingCloud initialPos={[-13, 5.8, 2]} speed={0.1} scale={0.9} />
      <FloatingCloud initialPos={[13, 6.2, 3]} speed={0.09} scale={0.95} />

      <FlyingFlock />
    </group>
  );
}
