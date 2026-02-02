import React, { useRef, Component, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { CelestialBodyData } from '../types';
import * as THREE from 'three';

interface SunProps {
  data: CelestialBodyData;
  onClick: (data: CelestialBodyData) => void;
}

class TextureErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Failed to load sun texture, falling back to color material.', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const TexturedSunMaterial: React.FC<{ textureUrl: string }> = ({ textureUrl }) => {
  const texture = useTexture(textureUrl);
  return <meshBasicMaterial map={texture} color="white" />;
};

const Sun: React.FC<SunProps> = ({ data, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed;
    }
  });

  return (
    <group>
      {/* Light Source - Increased intensity and range */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={3} 
        distance={200} // Range enough to cover the whole system
        decay={0} // No decay ensures distant planets are as lit as close ones (stylized look)
        color="#ffffff" 
      />
      
      {/* Visual Mesh */}
      <mesh 
        ref={meshRef} 
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        {data.textureUrl ? (
          <TextureErrorBoundary fallback={<meshBasicMaterial color={data.color} />}>
            <TexturedSunMaterial textureUrl={data.textureUrl} />
          </TextureErrorBoundary>
        ) : (
          <meshBasicMaterial color={data.color} />
        )}
      </mesh>

      {/* Glow Effect */}
      <mesh>
        <sphereGeometry args={[data.radius * 1.25, 32, 32]} />
        <meshBasicMaterial color="#FF5500" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[data.radius * 1.6, 32, 32]} />
        <meshBasicMaterial color="#FF8800" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

export default Sun;
