"use client";

import React from "react";
import { AnimalType } from "@/game/gameTypes";
import { AnimalModelProps } from "./types";
import { ElephantModel } from "./ElephantModel";
import { LionModel } from "./LionModel";
import { TigerModel } from "./TigerModel";
import { LeopardModel } from "./LeopardModel";
import { WolfModel } from "./WolfModel";
import { DogModel } from "./DogModel";
import { CatModel } from "./CatModel";
import { MouseModel } from "./MouseModel";

export type { AnimalModelProps } from "./types";
export {
  ElephantModel,
  LionModel,
  TigerModel,
  LeopardModel,
  WolfModel,
  DogModel,
  CatModel,
  MouseModel,
};

export const ANIMAL_MODEL_COMPONENTS: Record<
  AnimalType,
  React.ComponentType<AnimalModelProps>
> = {
  elephant: ElephantModel,
  lion: LionModel,
  tiger: TigerModel,
  leopard: LeopardModel,
  wolf: WolfModel,
  dog: DogModel,
  cat: CatModel,
  mouse: MouseModel,
};

export interface AnimalModelDispatcherProps extends AnimalModelProps {
  type: AnimalType;
}

/**
 * Convenience component that renders the standalone 3D animal component matching `type`.
 */
export function AnimalModel({ type, ...props }: AnimalModelDispatcherProps) {
  const Component = ANIMAL_MODEL_COMPONENTS[type];
  return <Component {...props} />;
}

