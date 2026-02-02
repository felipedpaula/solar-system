import React from 'react';
import * as THREE from 'three';

interface OrbitPathProps {
  radius: number;
}

const OrbitPath: React.FC<OrbitPathProps> = ({ radius }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
      <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
    </mesh>
  );
};

export default OrbitPath;