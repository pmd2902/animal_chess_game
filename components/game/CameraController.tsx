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
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const cameraView = useSettingsStore((s) => s.cameraView);
  const cameraZoom = useSettingsStore((s) => s.cameraZoom);
  const cameraSensitivity = useSettingsStore((s) => s.cameraSensitivity);
  const cameraResetTrigger = useSettingsStore((s) => s.cameraResetTrigger);
  const status = useGameStore((s) => s.status);
  const activeAnimation = useGameStore((s) => s.activeAnimation);

  const isTransitioningRef = useRef(true);
  const desiredPositionRef = useRef(new THREE.Vector3(0, 10.5, 9.8));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0, 0.25));

  // Responsive distance multiplier for mobile portrait screens so the 7x9 board always fits comfortably
  const isPortraitMobile = size.width < 680 || size.width / Math.max(1, size.height) < 0.85;
  const mobileScale = isPortraitMobile ? 1.32 : 1.0;

  useEffect(() => {
    isTransitioningRef.current = true;
    const zoomFactor = cameraZoom * mobileScale;

    if (cameraView === "topdown") {
      // VIEW 2: Top-down strategic view
      desiredPositionRef.current.set(0, 15.2 * zoomFactor, 1.2 * zoomFactor);
      desiredTargetRef.current.set(0, 0, 0);
    } else {
      // VIEW 1: Isometric / ~45 degree angled gameplay view
      desiredPositionRef.current.set(0, 10.2 * zoomFactor, 9.6 * zoomFactor);
      desiredTargetRef.current.set(0, 0, 0.35);
    }
  }, [cameraView, cameraZoom, cameraResetTrigger, mobileScale]);

  useFrame(({ clock }, delta) => {
    if (isMenuPreview) {
      // Very slow, peaceful scenic orbit in the 3D Main Menu background
      const t = clock.getElapsedTime() * 0.055;
      const radius = 14.5 * mobileScale;
      camera.position.set(
        Math.sin(t) * radius,
        9.2 + Math.sin(t * 1.2) * 0.5,
        Math.cos(t) * radius
      );
      camera.lookAt(0, 0.4, 0);
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
      camera.position.lerp(targetPos, Math.min(1, delta * 1.6));
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
      camera.position.lerp(desiredPositionRef.current, Math.min(1, delta * 4.5));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredTargetRef.current, Math.min(1, delta * 5.0));
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(desiredPositionRef.current) < 0.06) {
        isTransitioningRef.current = false;
      }
    }

    if (shakeOffsetX !== 0 || shakeOffsetY !== 0) {
      camera.position.x += shakeOffsetX;
      camera.position.y += shakeOffsetY;
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
      maxDistance={22}
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
