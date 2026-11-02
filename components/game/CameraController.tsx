"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGameStore } from "@/stores/gameStore";

interface CameraControllerProps {
  isMenuPreview?: boolean;
}

export function CameraController({ isMenuPreview = false }: CameraControllerProps) {
  const size = useThree((s) => s.size);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const cameraView = useSettingsStore((s) => s.cameraView);
  const cameraZoom = useSettingsStore((s) => s.cameraZoom);
  const cameraSensitivity = useSettingsStore((s) => s.cameraSensitivity);
  const cameraResetTrigger = useSettingsStore((s) => s.cameraResetTrigger);
  const status = useGameStore((s) => s.status);
  const activeAnimation = useGameStore((s) => s.activeAnimation);

  const isTransitioningRef = useRef(true);
  const desiredPositionRef = useRef(new THREE.Vector3(0, 11.8, 10.6));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0, 0.55));

  // Responsive distance multiplier for mobile portrait screens:
  // Because Three.js PerspectiveCamera `fov` is vertical, horizontal half-FOV is `atan(tan(fov/2) * aspect)`.
  // Scaling by `1.04 / aspect` with a steeper elevation angle guarantees the entire 7x9 board width
  // (including corner lanterns and rank badges at the front row) fits inside any portrait phone screen.
  const aspect = size.width / Math.max(1, size.height);
  const isPortraitMobile = size.width < 680 || aspect < 0.85;
  const mobileScale = isPortraitMobile
    ? Math.min(2.65, Math.max(1.65, 1.04 / Math.max(0.38, aspect)))
    : 1.0;

  useEffect(() => {
    isTransitioningRef.current = true;
    const zoomFactor = cameraZoom * mobileScale;

    if (cameraView === "topdown") {
      // VIEW 2: Top-down strategic view
      desiredPositionRef.current.set(0, 16.6 * zoomFactor, 1.2 * zoomFactor);
      desiredTargetRef.current.set(0, 0, isPortraitMobile ? 0.2 : 0.15);
    } else if (isPortraitMobile) {
      // VIEW 1 (Mobile Portrait): Steeper overhead isometric angle so the front of the board
      // does not foreshorten out of the narrow horizontal viewport
      desiredPositionRef.current.set(0, 14.2 * zoomFactor, 7.4 * zoomFactor);
      desiredTargetRef.current.set(0, 0, 0.35);
    } else {
      // VIEW 1 (Desktop): Default zoomed out 1 step + forward target so bottom board corners are fully visible
      desiredPositionRef.current.set(0, 11.8 * zoomFactor, 10.6 * zoomFactor);
      desiredTargetRef.current.set(0, 0, 0.55);
    }
  }, [cameraView, cameraZoom, cameraResetTrigger, mobileScale, isPortraitMobile]);

  useFrame((state, delta) => {
    const cam = state.camera;
    const clock = state.clock;
    if (isMenuPreview) {
      // Very slow, peaceful scenic orbit in the 3D Main Menu background
      const t = clock.getElapsedTime() * 0.055;
      const radius = 14.5 * mobileScale;
      cam.position.set(
        Math.sin(t) * radius,
        9.2 + Math.sin(t * 1.2) * 0.5,
        Math.cos(t) * radius
      );
      cam.lookAt(0, 0.4, 0);
      return;
    }

    // Victory screen slow cinematic zoom-out & gentle orbit
    if (status === "victory") {
      const t = clock.getElapsedTime() * 0.08;
      const victoryRadius = 14.8 * mobileScale;
      const targetPos = new THREE.Vector3(
        Math.sin(t) * 3.5,
        12.5 * mobileScale,
        Math.cos(t * 0.5) * victoryRadius
      );
      cam.position.lerp(targetPos, Math.min(1, delta * 1.6));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0.2, 0), delta * 2.5);
        controlsRef.current.update();
      }
      return;
    }

    // Subtle camera shake on important capture impacts
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (
      activeAnimation &&
      (activeAnimation.moveType === "capture" || activeAnimation.moveType === "jump_capture")
    ) {
      const elapsed = performance.now() - activeAnimation.startTime;
      const progress = elapsed / activeAnimation.duration;
      if (progress > 0.5 && progress < 0.92) {
        const intensity = 0.06;
        shakeOffsetX = (Math.random() - 0.5) * intensity;
        shakeOffsetY = (Math.random() - 0.5) * intensity;
      }
    }

    // Smooth camera interpolation toward desired preset view
    if (isTransitioningRef.current) {
      cam.position.lerp(desiredPositionRef.current, Math.min(1, delta * 4.5));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredTargetRef.current, Math.min(1, delta * 5.0));
        controlsRef.current.update();
      }
      if (cam.position.distanceTo(desiredPositionRef.current) < 0.06) {
        isTransitioningRef.current = false;
      }
    }

    if (shakeOffsetX !== 0 || shakeOffsetY !== 0) {
      cam.position.set(
        cam.position.x + shakeOffsetX,
        cam.position.y + shakeOffsetY,
        cam.position.z
      );
    }
  });

  if (isMenuPreview) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.055}
      rotateSpeed={cameraSensitivity}
      zoomSpeed={0.5}
      enablePan={false}
      minDistance={7.5}
      maxDistance={48}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2.3}
      minAzimuthAngle={-Math.PI / 3.2}
      maxAzimuthAngle={Math.PI / 3.2}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}
