import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  innerRadius: number;
  outerRadius: number;
  count?: number;
  height?: number;
  color?: string;
  size?: number;
  opacity?: number;
  speed?: number;
}

const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  innerRadius,
  outerRadius,
  count = 6000,
  height = 3,
  color = '#c9b79a',
  size = 0.8,
  opacity = 0.85,
  speed = 0.01
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * height;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      siz[i] = 0.6 + Math.random() * 0.8;
    }
    return { positions: pos, sizes: siz };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation={true}
        transparent={true}
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
};

export default AsteroidBelt;
