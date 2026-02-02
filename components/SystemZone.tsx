import React from 'react';
import * as THREE from 'three';

interface SystemZoneProps {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity?: number;
  label?: string;
}

const SystemZone: React.FC<SystemZoneProps> = ({ 
  innerRadius, 
  outerRadius, 
  color, 
  opacity = 0.1 
}) => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      {/* The main filled zone area */}
      <mesh>
        <ringGeometry args={[innerRadius, outerRadius, 128]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          side={THREE.DoubleSide} 
          depthWrite={false} // Prevents z-fighting with orbit lines
        />
      </mesh>

      {/* Inner Border */}
      <mesh>
        <ringGeometry args={[innerRadius, innerRadius + 0.1, 128]} />
        <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={opacity * 2} 
            side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Outer Border */}
      <mesh>
        <ringGeometry args={[outerRadius - 0.1, outerRadius, 128]} />
        <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={opacity * 2} 
            side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
};

export default SystemZone;