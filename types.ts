export enum BodyType {
  STAR = 'Estrela',
  PLANET = 'Planeta',
  DWARF = 'Planeta Anão',
  MOON = 'Lua'
}

export interface QuickFact {
  label: string;
  value: string | string[];
}

export interface CelestialBodyData {
  id: string;
  name: string;
  type: BodyType;
  description: string;
  funFact?: string;
  quickFacts?: QuickFact[];
  curiosities?: string[];
  radius: number;
  distance: number;
  speed: number;
  rotationSpeed: number;
  color: string;
  hasRings?: boolean;
  ringColor?: string;
  ringTextureUrl?: string;
  ringInnerRadiusMultiplier?: number;
  ringOuterRadiusMultiplier?: number;
  textureUrl?: string;
  axialTilt?: number;
  orbitalInclination?: number;
  moons?: MoonData[];
}

export interface MoonData {
  id: string;
  name: string;
  type: BodyType;
  description: string;
  funFact?: string;
  quickFacts?: QuickFact[];
  curiosities?: string[];
  parentId: string;
  radius: number;
  distance: number;
  speed: number;
  rotationSpeed: number;
  color: string;
  textureUrl?: string;
}

export type CelestialInfo = CelestialBodyData | MoonData;

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

// Augment JSX.IntrinsicElements to fix missing R3F types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      points: any;
      sphereGeometry: any;
      ringGeometry: any;
      bufferGeometry: any;
      bufferAttribute: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      pointsMaterial: any;
      color: any;
      fogExp2: any;
    }
  }
}
