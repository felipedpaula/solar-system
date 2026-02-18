import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const MilkyWay: React.FC = () => {
  const texture = useTexture('/textures/milky_way_8k.jpg');

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <sphereGeometry args={[1200, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        color="white"
        depthWrite={false}
      />
    </mesh>
  );
};

export default MilkyWay;
