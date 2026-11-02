export interface AnimalModelProps {
  /** Whether the animal belongs to the Red team (true) or Blue team (false). Defaults to true. */
  isRed?: boolean;
  /** Phase offset in radians so multiple animals on screen breathe/bob out of sync. */
  animPhaseOffset?: number;
  /** Optional extra uniform scale multiplier on top of the species' natural scale. */
  scale?: number;
}

