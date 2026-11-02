"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  BOARD_COLS,
  BOARD_ROWS,
  getCellType,
  isSamePosition,
} from "@/game/rules";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  boardToWorldPosition,
  CELL_SIZE,
} from "@/game/animations";
import { CellType, Position, ValidMove } from "@/game/gameTypes";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";

const WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave1 = sin(pos.x * 3.5 + uTime * 2.0) * 0.005;
    float wave2 = cos(pos.y * 3.0 - uTime * 1.6) * 0.005;
    pos.z += wave1 + wave2;
    vElevation = wave1 + wave2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  // Procedural bright water caustics
  float causticPattern(vec2 uv, float time) {
    vec2 p = uv * vec2(4.5, 6.5);
    float c1 = sin(p.x * 3.2 + time * 1.4 + cos(p.y * 2.8 - time * 1.1));
    float c2 = cos(p.y * 3.4 - time * 1.2 + sin(p.x * 3.0 + time * 1.3));
    return smoothstep(0.38, 0.96, (c1 * c2) * 0.5 + 0.5);
  }

  void main() {
    // Distance from riverbank edges (0 at border, 0.5 at center)
    float edgeDistX = min(vUv.x, 1.0 - vUv.x);
    float edgeDistY = min(vUv.y, 1.0 - vUv.y);
    float edgeDist = min(edgeDistX * 2.0, edgeDistY * 3.0);

    // Crystal-clear stylized tropical cyan/azure water palette
    vec3 deepColor = vec3(0.02, 0.58, 0.82);
    vec3 midColor = vec3(0.10, 0.72, 0.92);
    vec3 shallowColor = vec3(0.38, 0.88, 0.98);

    float depthFactor = smoothstep(0.0, 0.42, edgeDist);
    vec3 waterColor = mix(shallowColor, mix(midColor, deepColor, depthFactor), depthFactor);

    // Animated sunlit water caustics (vân nắng lấp lánh trên mặt nước)
    float caustics1 = causticPattern(vUv + vec2(0.0, uTime * 0.045), uTime);
    float caustics2 = causticPattern(vUv * 1.35 - vec2(uTime * 0.025, uTime * 0.055), uTime * 0.85);
    float caustics = (caustics1 + caustics2) * 0.5;
    waterColor += vec3(0.65, 0.96, 1.0) * caustics * 0.34;

    // Gentle white-aqua shoreline ripple along the banks
    float shoreFoam = 1.0 - smoothstep(0.0, 0.045, edgeDist);
    float innerRipple = 1.0 - smoothstep(0.045, 0.075, abs(edgeDist - 0.065 + sin(uTime * 2.5 + vUv.y * 16.0) * 0.01));
    waterColor = mix(waterColor, vec3(0.92, 0.99, 1.0), max(shoreFoam * 0.8, innerRipple * 0.35));

    // Clean 2x3 playable cell grid lines so every river cell is clearly readable
    float gridX = 1.0 - smoothstep(0.0, 0.012, abs(vUv.x - 0.5));
    float gridY1 = 1.0 - smoothstep(0.0, 0.009, abs(vUv.y - 0.3333));
    float gridY2 = 1.0 - smoothstep(0.0, 0.009, abs(vUv.y - 0.6667));
    float gridLine = max(gridX, max(gridY1, gridY2));
    waterColor = mix(waterColor, vec3(0.85, 0.98, 1.0), gridLine * 0.38);

    gl_FragColor = vec4(waterColor, 0.82);
  }
`;

function SwimmingKoiFish({
  centerX,
  centerZ,
  phaseOffset = 0,
  color = "#FF7F51",
}: {
  centerX: number;
  centerZ: number;
  phaseOffset?: number;
  color?: string;
}) {
  const fishRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.75 + phaseOffset;
    if (fishRef.current) {
      // Figure-8 swimming path inside the 2x3 river basin at y = 0.11 (below water at y = 0.168)
      const x = centerX + Math.sin(t) * 0.72;
      const z = centerZ + Math.sin(t * 2) * 1.05;
      const dx = Math.cos(t) * 0.72;
      const dz = Math.cos(t * 2) * 2.1;
      fishRef.current.position.set(x, 0.11, z);
      fishRef.current.rotation.y = Math.atan2(dx, dz);
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 9 + phaseOffset) * 0.35;
    }
  });

  return (
    <group ref={fishRef}>
      {/* Koi Body */}
      <mesh scale={[0.7, 0.45, 1.4]}>
        <sphereGeometry args={[0.075, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* White/Gold Spot */}
      <mesh position={[0, 0.02, 0.02]} scale={[0.5, 0.4, 0.7]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFF8F0" roughness={0.3} />
      </mesh>
      {/* Wagging Tail Fin */}
      <mesh ref={tailRef} position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.09, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function RiverBasin({
  centerX,
  centerZ,
  phaseOffset = 0,
}: {
  centerX: number;
  centerZ: number;
  phaseOffset?: number;
}) {
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const basinWidth = CELL_SIZE * 2 - 0.08;
  const basinLength = CELL_SIZE * 3 - 0.08;

  const uniforms = useMemo(
    () => ({
      uTime: { value: phaseOffset },
    }),
    [phaseOffset]
  );

  useFrame(({ clock }) => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value =
        clock.getElapsedTime() + phaseOffset;
    }
  });

  return (
    <group>
      {/* 1. Deep Turquoise Riverbed Floor at y = 0.07 (above golden board at y = 0.05, well below water at y = 0.168) */}
      <mesh
        position={[centerX, 0.07, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[basinWidth, basinLength]} />
        <meshStandardMaterial color="#0077B6" roughness={0.6} />
      </mesh>

      {/* 2. Swimming Golden & Coral Koi Fish at y = 0.11 */}
      <SwimmingKoiFish
        centerX={centerX}
        centerZ={centerZ}
        phaseOffset={phaseOffset}
        color="#FF6B35"
      />
      <SwimmingKoiFish
        centerX={centerX}
        centerZ={centerZ}
        phaseOffset={phaseOffset + 3.14}
        color="#FFD166"
      />

      {/* 3. Animated Crystal-Blue Water Surface at y = 0.168 (waves ±0.01 -> 0.158..0.178, never touches anything else!) */}
      <mesh
        position={[centerX, 0.168, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[basinWidth, basinLength, 24, 36]} />
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={WATER_VERTEX_SHADER}
          fragmentShader={WATER_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function VietnameseTempleDen({
  position,
  isRed,
}: {
  position: [number, number, number];
  isRed: boolean;
}) {
  const glowRef = useRef<THREE.Mesh>(null);
  const roofColor = isRed ? "#C1121F" : "#1D3557";
  const goldColor = "#FFD166";

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.08;
      glowRef.current.scale.set(s, s, 1);
    }
  });

  const archZOffset = isRed ? 0.36 : -0.36;

  return (
    <group position={position}>
      {/* Sacred Lotus Sanctum Floor Pad */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.05, 24]} />
        <meshStandardMaterial color={goldColor} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh
        ref={glowRef}
        position={[0, 0.065, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.32, 0.45, 24]} />
        <meshBasicMaterial
          color={isRed ? "#FF4D6D" : "#4CC9F0"}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Miniature Cổng Tam Quan / Đình Làng Arch behind the square */}
      <group position={[0, 0, archZOffset]}>
        <mesh position={[-0.36, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.64, 12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.5} />
        </mesh>
        <mesh position={[0.36, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.64, 12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.5} />
        </mesh>

        <RoundedBox
          args={[0.92, 0.09, 0.14]}
          position={[0, 0.58, 0]}
          radius={0.02}
          castShadow
        >
          <meshStandardMaterial color={goldColor} metalness={0.35} roughness={0.3} />
        </RoundedBox>

        <mesh position={[0, 0.76, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.68, 0.28, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.93, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={goldColor} metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function LotusFlower({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 1.8 + position[0]) * 0.01;
      ref.current.rotation.y = Math.sin(t * 0.6 + position[2]) * 0.12;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* 3D Thick Lily Pad (Lá sen) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.022, 18]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.55} />
      </mesh>
      {/* Multi-Petal Pink Lotus (Hoa sen) */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        return (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.065, 0.035, Math.sin(angle) * 0.065]}
            rotation={[0.35, -angle, 0]}
            scale={[0.6, 1.1, 0.4]}
          >
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#FF758F" roughness={0.35} />
          </mesh>
        );
      })}
      {/* Golden Lotus Pistil (Đài sen vàng) */}
      <mesh position={[0, 0.055, 0]}>
        <sphereGeometry args={[0.042, 10, 10]} />
        <meshStandardMaterial color="#FFD166" roughness={0.4} />
      </mesh>
    </group>
  );
}

function ValidMoveIndicator({
  move,
  onClick,
}: {
  move: ValidMove;
  onClick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const isCapture = Boolean(move.targetPieceId);
  const isJump = move.moveType === "jump" || move.moveType === "jump_capture";

  const [wx, , wz] = boardToWorldPosition(move.to, 0.24);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 5) * 0.12;
      ringRef.current.scale.set(pulse, pulse, 1);
      ringRef.current.rotation.z = t * 1.2;
    }
    if (orbRef.current) {
      orbRef.current.position.y = 0.34 + Math.sin(t * 4.5) * 0.08;
    }
  });

  const color = isCapture ? "#EF233C" : isJump ? "#FFB703" : "#06D6A0";

  return (
    <group
      position={[wx, 0.23, wz]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isCapture ? 0.44 : 0.22, isCapture ? 0.55 : 0.34, 28]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {!isCapture && (
        <mesh ref={orbRef} position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

export function GameBoard() {
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const validMoves = useGameStore((s) => s.validMoves);
  const lastMove = useGameStore((s) => s.lastMove);
  const invalidMoveFeedback = useGameStore((s) => s.invalidMoveFeedback);
  const handleCellOrPieceClick = useGameStore((s) => s.handleCellOrPieceClick);
  const showMoveHints = useSettingsStore((s) => s.showMoveHints);

  const cells = useMemo(() => {
    const list: Array<{
      row: number;
      col: number;
      cellType: CellType;
      worldPos: [number, number, number];
    }> = [];

    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        list.push({
          row: r,
          col: c,
          cellType: getCellType(r, c),
          worldPos: boardToWorldPosition({ row: r, col: c }, 0.14),
        });
      }
    }
    return list;
  }, []);

  // World centers for the two 2x3 river basins:
  // Left river: cols 1 & 2 -> avg col = 1.5 -> x = (1.5 - 3) * CELL_SIZE = -1.5 * 1.25 = -1.875
  // Right river: cols 4 & 5 -> avg col = 4.5 -> x = (4.5 - 3) * CELL_SIZE = +1.5 * 1.25 = +1.875
  // Rows 3, 4, 5 -> avg row = 4 -> z = 0
  const leftRiverX = -1.5 * CELL_SIZE;
  const rightRiverX = 1.5 * CELL_SIZE;

  return (
    <group>
      {/* MAIN WOODEN & STONE CARVED BOARD BASE (Top at y = 0.00 - no Z-fighting!) */}
      <RoundedBox
        args={[BOARD_WIDTH + 1.1, 0.36, BOARD_HEIGHT + 1.1]}
        position={[0, -0.18, 0]}
        radius={0.16}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#7F4F24" roughness={0.55} />
      </RoundedBox>

      {/* GOLDEN ĐÔNG SƠN / LOTUS INNER BORDER TRIM (Top at y = 0.05 - no Z-fighting!) */}
      <RoundedBox
        args={[BOARD_WIDTH + 0.5, 0.28, BOARD_HEIGHT + 0.5]}
        position={[0, -0.09, 0]}
        radius={0.12}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial color="#DDA15E" roughness={0.42} />
      </RoundedBox>

      {/* TWO CONTINUOUS 3D ANIMATED VIETNAMESE RIVER BASINS */}
      <RiverBasin centerX={leftRiverX} centerZ={0} phaseOffset={0} />
      <RiverBasin centerX={rightRiverX} centerZ={0} phaseOffset={2.4} />

      {/* 4 VIETNAMESE CORNER LANTERN POSTS */}
      {[
        [-(BOARD_WIDTH / 2 + 0.38), 0.26, -(BOARD_HEIGHT / 2 + 0.38)],
        [BOARD_WIDTH / 2 + 0.38, 0.26, -(BOARD_HEIGHT / 2 + 0.38)],
        [-(BOARD_WIDTH / 2 + 0.38), 0.26, BOARD_HEIGHT / 2 + 0.38],
        [BOARD_WIDTH / 2 + 0.38, 0.26, BOARD_HEIGHT / 2 + 0.38],
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.18, 0.42, 12]} />
            <meshStandardMaterial color="#582F0E" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial
              color="#FFD166"
              emissive="#FFB703"
              emissiveIntensity={0.45}
            />
          </mesh>
        </group>
      ))}

      {/* 7x9 PLAYABLE CELLS */}
      {cells.map(({ row, col, cellType, worldPos }) => {
        const pos: Position = { row, col };
        const isCheckerLight = (row + col) % 2 === 0;
        const isSelectedCell =
          selectedPiece && isSamePosition(selectedPiece.position, pos);
        const isLastMoveCell =
          lastMove &&
          (isSamePosition(lastMove.from, pos) || isSamePosition(lastMove.to, pos));

        // For river cells, the visual water is rendered continuously by `RiverBasin` above;
        // here we only place an invisible click hitbox + optional lastMove/selected ring at y = 0.19
        if (cellType === "river") {
          return (
            <group
              key={`${row}-${col}`}
              position={[worldPos[0], 0.18, worldPos[2]]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                handleCellOrPieceClick(pos);
              }}
            >
              <mesh visible={false}>
                <boxGeometry args={[CELL_SIZE, 0.1, CELL_SIZE]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
              {(isSelectedCell || isLastMoveCell) && (
                <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.38, 0.48, 24]} />
                  <meshBasicMaterial
                    color={isSelectedCell ? "#FFE66D" : "#90E0EF"}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
            </group>
          );
        }

        // Determine land tile color
        let tileColor = isCheckerLight ? "#FEFAE0" : "#E9EDC9";
        if (cellType === "trap_red" || cellType === "trap_blue") {
          tileColor = "#F4A261";
        } else if (cellType === "den_red") {
          tileColor = "#FFD166";
        } else if (cellType === "den_blue") {
          tileColor = "#90E0EF";
        }

        if (isSelectedCell) {
          tileColor = "#FFE66D";
        } else if (isLastMoveCell) {
          tileColor = "#CDEAC0";
        }

        return (
          <group
            key={`${row}-${col}`}
            position={worldPos}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              handleCellOrPieceClick(pos);
            }}
          >
            {/* Land Tile (Centered at y = 0.14, height = 0.14 -> top at y = 0.21) */}
            <RoundedBox
              args={[CELL_SIZE - 0.08, 0.14, CELL_SIZE - 0.08]}
              radius={0.06}
              smoothness={3}
              receiveShadow
            >
              <meshStandardMaterial color={tileColor} roughness={0.48} />
            </RoundedBox>

            {/* TRAP DECORATION: Glowing Bamboo & Stone Trap Ring */}
            {(cellType === "trap_red" || cellType === "trap_blue") && (
              <group position={[0, 0.08, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.32, 0.44, 6]} />
                  <meshStandardMaterial
                    color={cellType === "trap_red" ? "#E63946" : "#1D63B8"}
                    emissive={cellType === "trap_red" ? "#E63946" : "#4CC9F0"}
                    emissiveIntensity={0.4}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {[
                  [-0.36, 0.04, -0.36],
                  [0.36, 0.04, -0.36],
                  [-0.36, 0.04, 0.36],
                  [0.36, 0.04, 0.36],
                ].map((stakePos, idx) => (
                  <mesh key={idx} position={stakePos as [number, number, number]}>
                    <coneGeometry args={[0.045, 0.14, 6]} />
                    <meshStandardMaterial color="#6C584C" />
                  </mesh>
                ))}
              </group>
            )}

            {/* DEN DECORATION: Temple Sanctum */}
            {cellType === "den_blue" && (
              <VietnameseTempleDen position={[0, 0.07, 0]} isRed={false} />
            )}
            {cellType === "den_red" && (
              <VietnameseTempleDen position={[0, 0.07, 0]} isRed={true} />
            )}
          </group>
        );
      })}

      {/* 3D MULTI-PETAL LOTUS FLOWERS FLOATING ABOVE THE WATER (y = 0.20) */}
      <LotusFlower position={[leftRiverX - 0.72, 0.2, -1.35]} />
      <LotusFlower position={[leftRiverX + 0.72, 0.2, 1.35]} />
      <LotusFlower position={[rightRiverX + 0.72, 0.2, -1.35]} />
      <LotusFlower position={[rightRiverX - 0.72, 0.2, 1.35]} />

      {/* VALID MOVE MARKERS */}
      {showMoveHints &&
        validMoves.map((move) => (
          <ValidMoveIndicator
            key={`${move.to.row}-${move.to.col}`}
            move={move}
            onClick={() => handleCellOrPieceClick(move.to)}
          />
        ))}

      {/* INVALID MOVE 3D WARNING PULSE ON TARGET CELL */}
      {invalidMoveFeedback &&
        Date.now() - invalidMoveFeedback.timestamp < 1800 && (
          <group
            position={boardToWorldPosition(invalidMoveFeedback.targetPosition, 0.25)}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.52, 24]} />
              <meshBasicMaterial
                color="#EF233C"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
    </group>
  );
}
