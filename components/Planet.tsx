import React, { useMemo, useRef, Component, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { CelestialBodyData, CelestialInfo, MoonData } from '../types';
import * as THREE from 'three';

interface PlanetProps {
  data: CelestialBodyData;
  isPaused: boolean;
  onClick: (data: CelestialInfo, position: THREE.Vector3) => void;
  initialAngle: number;
  frozenPosition?: THREE.Vector3;
  selectedBodyId?: string;
  onRegisterMoonMesh?: (id: string, obj: THREE.Object3D | null) => void;
}

// Error Boundary to catch texture loading errors without crashing the app
class TextureErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Failed to load texture, falling back to color material.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Sub-component for Planets WITH textures
const TexturedPlanetMesh: React.FC<{ data: CelestialBodyData }> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    // Safe force unwrap because this component is only conditionally rendered if textureUrl exists
    const texture = useTexture(data.textureUrl!); 
    
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += data.rotationSpeed;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.7}
                metalness={0.1}
                color="white" // Ensure base color is white so it doesn't tint the texture
            />
        </mesh>
    );
};

// Sub-component for Planets WITHOUT textures (Solid Color)
const ColoredPlanetMesh: React.FC<{ data: CelestialBodyData }> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += data.rotationSpeed;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            <meshStandardMaterial
                color={data.color}
                roughness={0.5}
                metalness={0.1}
                emissive={data.color}
                emissiveIntensity={0.15}
            />
        </mesh>
    );
};

const TexturedRingMesh: React.FC<{ data: CelestialBodyData }> = ({ data }) => {
    const ringTexture = useTexture(data.ringTextureUrl!);
    const angularRepeats = 12;
    const ringGeometry = useMemo(() => {
        const innerRadius = data.radius * 1.4;
        const outerRadius = data.radius * 2.3;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
        const uv = geometry.attributes.uv;
        const position = geometry.attributes.position;
        for (let i = 0; i < uv.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const radius = Math.sqrt(x * x + y * y);
            const angle = Math.atan2(y, x);
            const u = (radius - innerRadius) / (outerRadius - innerRadius);
            const v = (angle + Math.PI) / (Math.PI * 2);
            uv.setXY(i, u, v);
        }
        uv.needsUpdate = true;
        return geometry;
    }, [data.radius, angularRepeats]);

    ringTexture.wrapS = THREE.ClampToEdgeWrapping;
    ringTexture.wrapT = THREE.RepeatWrapping;
    ringTexture.repeat.set(1, angularRepeats);
    ringTexture.offset.set(0, 0);
    ringTexture.center.set(0, 0);
    ringTexture.generateMipmaps = false;
    ringTexture.minFilter = THREE.LinearFilter;
    ringTexture.magFilter = THREE.LinearFilter;
    ringTexture.needsUpdate = true;

    return (
        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeometry}>
            <meshStandardMaterial
                map={ringTexture}
                transparent={true}
                opacity={0.9}
                side={THREE.DoubleSide}
                color="white"
            />
        </mesh>
    );
};

const ColoredRingMesh: React.FC<{ data: CelestialBodyData }> = ({ data }) => {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.4, data.radius * 2.3, 64]} />
            <meshStandardMaterial
                color={data.ringColor}
                side={THREE.DoubleSide}
                transparent={true}
                opacity={0.8}
                emissive={data.ringColor}
                emissiveIntensity={0.2}
            />
        </mesh>
    );
};

const TexturedMoonMesh: React.FC<{ data: MoonData }> = ({ data }) => {
    const texture = useTexture(data.textureUrl!);
    return (
        <mesh>
            <sphereGeometry args={[data.radius, 32, 32]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.8}
                metalness={0.05}
                color="white"
            />
        </mesh>
    );
};

const ColoredMoonMesh: React.FC<{ data: MoonData }> = ({ data }) => {
    return (
        <mesh>
            <sphereGeometry args={[data.radius, 32, 32]} />
            <meshStandardMaterial
                color={data.color}
                roughness={0.8}
                metalness={0.05}
            />
        </mesh>
    );
};

const Moon: React.FC<{
    data: MoonData;
    onClick: (data: CelestialInfo, position: THREE.Vector3) => void;
    isPaused: boolean;
    onRegisterMoonMesh?: (id: string, obj: THREE.Object3D | null) => void;
}> = ({ data, onClick, isPaused, onRegisterMoonMesh }) => {
    const groupRef = useRef<THREE.Group>(null);
    const angleRef = useRef(Math.random() * Math.PI * 2);
    const orbitRef = useRef<THREE.Group>(null);

    React.useEffect(() => {
        if (!onRegisterMoonMesh) return;
        onRegisterMoonMesh(data.id, groupRef.current);
        return () => {
            onRegisterMoonMesh(data.id, null);
        };
    }, [data.id, onRegisterMoonMesh]);

    useFrame((state) => {
        if (!orbitRef.current || isPaused) return;
        const t = state.clock.getElapsedTime();
        const currentAngle = angleRef.current + t * data.speed * 0.1;
        orbitRef.current.rotation.y = currentAngle;
    });

    return (
        <group ref={orbitRef}>
            <group 
                ref={groupRef} 
                position={[data.distance, 0, 0]} 
                rotation={[0, Math.PI, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (groupRef.current) {
                        const worldPos = new THREE.Vector3();
                        groupRef.current.getWorldPosition(worldPos);
                        onClick(data, worldPos);
                    }
                }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                {data.textureUrl ? (
                    <TextureErrorBoundary fallback={<ColoredMoonMesh data={data} />}>
                        <TexturedMoonMesh data={data} />
                    </TextureErrorBoundary>
                ) : (
                    <ColoredMoonMesh data={data} />
                )}
            </group>
        </group>
    );
};

const PlanetVisuals: React.FC<{
    data: CelestialBodyData;
    isPaused: boolean;
    onClick: (data: CelestialInfo, position: THREE.Vector3) => void;
    selectedBodyId?: string;
    onRegisterMoonMesh?: (id: string, obj: THREE.Object3D | null) => void;
}> = ({ data, isPaused, onClick, selectedBodyId, onRegisterMoonMesh }) => {
  const tilt = THREE.MathUtils.degToRad(data.axialTilt ?? 0);
  return (
    <group>
        <group rotation={[0, 0, tilt]}>
        {/* Conditionally render Textured or Colored Mesh with Error Boundary */}
        {data.textureUrl ? (
            <TextureErrorBoundary fallback={<ColoredPlanetMesh data={data} />}>
                <TexturedPlanetMesh data={data} />
            </TextureErrorBoundary>
        ) : (
            <ColoredPlanetMesh data={data} />
        )}

        {/* Rings (Saturn) - Independent of planet texture */}
        {data.hasRings && (
            data.ringTextureUrl ? (
                <TextureErrorBoundary fallback={<ColoredRingMesh data={data} />}>
                    <TexturedRingMesh data={data} />
                </TextureErrorBoundary>
            ) : (
                <ColoredRingMesh data={data} />
            )
        )}
        {data.moons && data.moons.length > 0 && (
            <group>
                {data.moons.map((moon) => (
                    <Moon 
                        key={moon.id} 
                        data={moon} 
                        onClick={onClick} 
                        isPaused={selectedBodyId === moon.id}
                        onRegisterMoonMesh={onRegisterMoonMesh}
                    />
                ))}
            </group>
        )}
        </group>
    </group>
  );
};

const Planet: React.FC<PlanetProps> = ({ data, isPaused, onClick, initialAngle, frozenPosition, selectedBodyId, onRegisterMoonMesh }) => {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(initialAngle);

  React.useEffect(() => {
    if (isPaused && frozenPosition && groupRef.current) {
      groupRef.current.position.copy(frozenPosition);
    }
  }, [isPaused, frozenPosition]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && !isPaused) {
        const currentAngle = angleRef.current + t * data.speed * 0.1;
        const x = Math.cos(currentAngle) * data.distance;
        const z = Math.sin(currentAngle) * data.distance;
        groupRef.current.position.set(x, 0, z);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (groupRef.current) {
        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        onClick(data, worldPos);
    }
  };

  return (
    <group ref={groupRef}>
        <group 
            onClick={handleClick}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            <PlanetVisuals 
                data={data} 
                isPaused={isPaused} 
                onClick={onClick} 
                selectedBodyId={selectedBodyId}
                onRegisterMoonMesh={onRegisterMoonMesh}
            />
        </group>
    </group>
  );
};

export default Planet;
