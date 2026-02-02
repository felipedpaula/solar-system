import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarField: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);

  // --- STARS CONFIG ---
  const starCount = 8000;
  const innerRadius = 520;
  const outerRadius = 1400;
  
  const { starPositions, starColors } = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const cols = new Float32Array(starCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      // Use spherical distribution for stars
      const r = innerRadius + Math.random() * (outerRadius - innerRadius); // Keep stars far from the system
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Brighter, more distinct colors
      const starType = Math.random();
      if (starType > 0.9) {
        color.setHex(0xaaaaaa); // Bright white/grey
      } else if (starType > 0.7) {
        color.setHex(0x9db4ff); // Blueish
      } else if (starType > 0.5) {
        color.setHex(0xffdab5); // Orangeish
      } else {
        color.setHex(0x444444); // Dim background star
      }

      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return { starPositions: pos, starColors: cols };
  }, []);

  useFrame((state) => {
    // Rotate stars slowly
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group>
        {/* SHARP STARS */}
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                attach="attributes-position"
                count={starCount}
                array={starPositions}
                itemSize={3}
                />
                <bufferAttribute
                attach="attributes-color"
                count={starCount}
                array={starColors}
                itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={1.2} // Slightly larger to be more visible
                vertexColors={true}
                sizeAttenuation={true}
                transparent={true}
                opacity={0.9}
                depthWrite={false}
            />
        </points>
    </group>
  );
};

export default StarField;
