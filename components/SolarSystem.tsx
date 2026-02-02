import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import { BodyType, CelestialInfo } from '../types';
import { PLANET_DATA } from '../constants';
import StarField from './StarField';
import Sun from './Sun';
import Planet from './Planet';
import OrbitPath from './OrbitPath';
import SystemZone from './SystemZone';
import AsteroidBelt from './AsteroidBelt';

interface SolarSystemProps {
  selectedBody: CelestialInfo | null;
  menuSelection: CelestialInfo | null;
  onMenuSelectionHandled: () => void;
  onBodySelect: (body: CelestialInfo) => void;
  onClearSelect: () => void;
}

// Internal component to handle camera animations
const CameraController: React.FC<{
  selectedBody: CelestialInfo | null;
  targetPosition: THREE.Vector3 | null;
  moonPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
}> = ({ selectedBody, targetPosition, moonPositionsRef }) => {
  const { camera, controls } = useThree();
  const controlsRef = useRef<any>(controls);

  useEffect(() => {
    gsap.killTweensOf(camera.position);
    if (controlsRef.current) {
      gsap.killTweensOf(controlsRef.current.target);
    }
    if (selectedBody && targetPosition) {
        // Focus on Planet
        const offset = selectedBody.radius * 4; // Distance to keep from body
        
        // Calculate a nice viewing angle
        // We simply add offset to x and z to look from an angle
        const camX = targetPosition.x + offset;
        const camY = targetPosition.y + offset * 0.5;
        const camZ = targetPosition.z + offset;

        // Animate Camera Position
        gsap.to(camera.position, {
            x: camX,
            y: camY,
            z: camZ,
            duration: 2,
            ease: 'power3.inOut'
        });

        // Animate Controls Target (Where camera looks)
        if (controlsRef.current) {
            gsap.to(controlsRef.current.target, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration: 2,
                ease: 'power3.inOut',
                onUpdate: () => controlsRef.current.update()
            });
        }
    } else if (!selectedBody) {
        // Reset to Overview
        gsap.to(camera.position, {
            x: 0,
            y: 300,
            z: 450,
            duration: 2.5,
            ease: 'power3.inOut'
        });

        if (controlsRef.current) {
            gsap.to(controlsRef.current.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 2.5,
                ease: 'power3.inOut',
                onUpdate: () => controlsRef.current.update()
            });
        }
    }
  }, [selectedBody, targetPosition, camera]);

  return <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} maxDistance={700} minDistance={2} />;
};

const TimeSync: React.FC<{
  onTick: (t: number) => void;
  orbitAngles: React.MutableRefObject<Record<string, number>>;
  onPositionsUpdate: (positions: Record<string, THREE.Vector3>) => void;
  onMoonPositionsUpdate: (positions: Record<string, THREE.Vector3>) => void;
  planetPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  frozenPositions: Record<string, THREE.Vector3> | null;
  selectedBody: CelestialInfo | null;
  paused: boolean;
}> = ({ onTick, orbitAngles, onPositionsUpdate, onMoonPositionsUpdate, paused, planetPositionsRef, frozenPositions, selectedBody }) => {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    onTick(t);
    const nextPositions: Record<string, THREE.Vector3> = {};
    const nextMoonPositions: Record<string, THREE.Vector3> = {};
    PLANET_DATA.slice(1).forEach((planet) => {
      let planetPos = planetPositionsRef.current[planet.id];
      if (!paused) {
        const baseAngle = orbitAngles.current[planet.id] ?? 0;
        const currentAngle = baseAngle + t * planet.speed * 0.1;
        planetPos = new THREE.Vector3(
          Math.cos(currentAngle) * planet.distance,
          0,
          Math.sin(currentAngle) * planet.distance
        );
        nextPositions[planet.id] = planetPos;
      } else if (frozenPositions && frozenPositions[planet.id]) {
        planetPos = frozenPositions[planet.id];
      }
      if (planet.moons) {
        planet.moons.forEach((moon) => {
          const baseMoonAngle = orbitAngles.current[moon.id] ?? 0;
          const moonAngle = baseMoonAngle + t * moon.speed * 0.1;
          if (planetPos && !(paused && selectedBody?.type === BodyType.MOON)) {
            nextMoonPositions[moon.id] = new THREE.Vector3(
              planetPos.x + Math.cos(moonAngle) * moon.distance,
              0,
              planetPos.z + Math.sin(moonAngle) * moon.distance
            );
          }
        });
      }
    });
    if (!paused) {
      onPositionsUpdate(nextPositions);
    }
    if (!(paused && selectedBody?.type === BodyType.MOON)) {
      onMoonPositionsUpdate(nextMoonPositions);
    }
  });
  return null;
};

const SolarSystem: React.FC<SolarSystemProps> = ({ selectedBody, menuSelection, onMenuSelectionHandled, onBodySelect, onClearSelect }) => {
  const [targetPos, setTargetPos] = React.useState<THREE.Vector3 | null>(null);
  const [showOverlays, setShowOverlays] = React.useState(true);
  const hideOverlaysTimeout = useRef<number | null>(null);
  const lastSelectionFromClick = useRef(false);
  const timeRef = useRef(0);
  const orbitAngles = useRef<Record<string, number>>({});
  const planetPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const moonPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const moonMeshRefs = useRef<Record<string, THREE.Object3D | null>>({});
  const [frozenPositions, setFrozenPositions] = React.useState<Record<string, THREE.Vector3> | null>(null);
  const wasSelectedRef = useRef(false);

  if (Object.keys(orbitAngles.current).length === 0) {
    PLANET_DATA.slice(1).forEach((planet) => {
      orbitAngles.current[planet.id] = Math.random() * Math.PI * 2;
      if (planet.moons) {
        planet.moons.forEach((moon) => {
          orbitAngles.current[moon.id] = Math.random() * Math.PI * 2;
        });
      }
    });
  }

  React.useEffect(() => {
    if (selectedBody) {
      if (!wasSelectedRef.current) {
        const frozen: Record<string, THREE.Vector3> = {};
        Object.entries(planetPositionsRef.current).forEach(([id, pos]) => {
          frozen[id] = pos.clone();
        });
        setFrozenPositions(frozen);
        planetPositionsRef.current = frozen;
      }
      if (hideOverlaysTimeout.current) {
        window.clearTimeout(hideOverlaysTimeout.current);
      }
      hideOverlaysTimeout.current = window.setTimeout(() => {
        setShowOverlays(false);
      }, 2000);
      wasSelectedRef.current = true;
    } else {
      if (hideOverlaysTimeout.current) {
        window.clearTimeout(hideOverlaysTimeout.current);
        hideOverlaysTimeout.current = null;
      }
      setFrozenPositions(null);
      setShowOverlays(true);
      wasSelectedRef.current = false;
    }
  }, [selectedBody]);

  React.useEffect(() => {
    if (!selectedBody) {
      setTargetPos(null);
      lastSelectionFromClick.current = false;
      return;
    }

    if (lastSelectionFromClick.current) {
      lastSelectionFromClick.current = false;
      return;
    }

    if (selectedBody.distance === 0) {
      setTargetPos(new THREE.Vector3(0, 0, 0));
      return;
    }

    const cachedPos = selectedBody.type === BodyType.MOON
      ? moonPositionsRef.current[selectedBody.id]
      : frozenPositions
        ? frozenPositions[selectedBody.id]
        : planetPositionsRef.current[selectedBody.id];
    if (cachedPos) {
      setTargetPos(cachedPos.clone());
      return;
    }

    if (selectedBody.type === BodyType.MOON) {
      const baseAngle = orbitAngles.current[selectedBody.id] ?? 0;
      const currentAngle = baseAngle + timeRef.current * selectedBody.speed * 0.1;
      const parentPos = planetPositionsRef.current[selectedBody.parentId];
      const x = (parentPos ? parentPos.x : 0) + Math.cos(currentAngle) * selectedBody.distance;
      const z = (parentPos ? parentPos.z : 0) + Math.sin(currentAngle) * selectedBody.distance;
      setTargetPos(new THREE.Vector3(x, 0, z));
      return;
    }

    const baseAngle = orbitAngles.current[selectedBody.id] ?? 0;
    const currentAngle = baseAngle + timeRef.current * selectedBody.speed * 0.1;
    const x = Math.cos(currentAngle) * selectedBody.distance;
    const z = Math.sin(currentAngle) * selectedBody.distance;
    setTargetPos(new THREE.Vector3(x, 0, z));
  }, [selectedBody]);

  React.useEffect(() => {
    if (!menuSelection || !selectedBody || menuSelection.id !== selectedBody.id) return;
    if (selectedBody.distance === 0) {
      setTargetPos(new THREE.Vector3(0, 0, 0));
      lastSelectionFromClick.current = true;
      onMenuSelectionHandled();
      return;
    }

    if (selectedBody.type === BodyType.MOON) {
      const moonMesh = moonMeshRefs.current[selectedBody.id];
      if (moonMesh) {
        const worldPos = new THREE.Vector3();
        moonMesh.getWorldPosition(worldPos);
        setTargetPos(worldPos);
        lastSelectionFromClick.current = true;
        onMenuSelectionHandled();
        return;
      }
      const baseAngle = orbitAngles.current[selectedBody.id] ?? 0;
      const currentAngle = baseAngle + timeRef.current * selectedBody.speed * 0.1;
      const parentPos = planetPositionsRef.current[selectedBody.parentId];
      const x = (parentPos ? parentPos.x : 0) + Math.cos(currentAngle) * selectedBody.distance;
      const z = (parentPos ? parentPos.z : 0) + Math.sin(currentAngle) * selectedBody.distance;
      setTargetPos(new THREE.Vector3(x, 0, z));
      lastSelectionFromClick.current = true;
      onMenuSelectionHandled();
      return;
    }

    const cachedPos = frozenPositions
      ? frozenPositions[selectedBody.id]
      : planetPositionsRef.current[selectedBody.id];
    if (cachedPos) {
      setTargetPos(cachedPos.clone());
      lastSelectionFromClick.current = true;
      onMenuSelectionHandled();
      return;
    }
  }, [menuSelection, selectedBody, frozenPositions, onMenuSelectionHandled]);

  const handlePlanetClick = (data: CelestialInfo, position?: THREE.Vector3) => {
    // If clicking sun, position is 0,0,0
    const pos = position || new THREE.Vector3(0, 0, 0);
    lastSelectionFromClick.current = true;
    setTargetPos(pos);
    onBodySelect(data);
  };

  const handleBackgroundClick = () => {
    // Optional: Clicking background could deselect
  };

  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback={null}>
        <TimeSync 
          onTick={(t) => { timeRef.current = t; }} 
          orbitAngles={orbitAngles}
          onPositionsUpdate={(positions) => { planetPositionsRef.current = positions; }}
          onMoonPositionsUpdate={(positions) => { moonPositionsRef.current = positions; }}
          planetPositionsRef={planetPositionsRef}
          frozenPositions={frozenPositions}
          selectedBody={selectedBody}
          paused={selectedBody !== null}
        />
        {/* Deep Midnight Blue Background & Fog for Atmosphere */}
        <color attach="background" args={['#050714']} />
        <fogExp2 attach="fog" args={['#050714', 0.0006]} />

        <PerspectiveCamera makeDefault position={[0, 300, 450]} fov={45} />
        <CameraController 
          selectedBody={selectedBody} 
          targetPosition={targetPos} 
          moonPositionsRef={moonPositionsRef}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.7} /> 
        
        {/* Background Atmosphere (Stars only) */}
        <StarField />

        {/* Sun */}
        <Sun 
            data={PLANET_DATA[0]} 
            onClick={(d) => handlePlanetClick(d, new THREE.Vector3(0,0,0))} 
        />

        {/* Zones */}
        {showOverlays && (
          <>
            {/* Hot Zone (Red) - Mercury (10) & Venus (15) */}
            <SystemZone 
                innerRadius={12} 
                outerRadius={60} 
                color="#ef4444" 
                opacity={0.08}
            />

            {/* Habitable Zone (Green) - Earth (22) & Mars (30) */}
            <SystemZone 
                innerRadius={61} 
                outerRadius={120} 
                color="#4ade80" 
                opacity={0.08}
            />

            {/* Cold/Outer Zone (Blue) - Jupiter (45) to Neptune (90) */}
            <SystemZone 
                innerRadius={121} 
                outerRadius={380} 
                color="#3b82f6" 
                opacity={0.08}
            />
          </>
        )}

        {/* Planets */}
        {PLANET_DATA.slice(1).map((planet) => (
            <group key={planet.id}>
            {showOverlays && <OrbitPath radius={planet.distance} />}
            <Planet 
                data={planet} 
                initialAngle={orbitAngles.current[planet.id]}
                frozenPosition={frozenPositions ? frozenPositions[planet.id] : undefined}
                isPaused={selectedBody !== null} // Pause orbit when investigating a planet
                selectedBodyId={selectedBody ? selectedBody.id : undefined}
                onRegisterMoonMesh={(id, obj) => { moonMeshRefs.current[id] = obj; }}
                onClick={handlePlanetClick} 
                />
            </group>
        ))}

        {/* Asteroid Belt */}
        <AsteroidBelt innerRadius={115} outerRadius={150} count={6000} height={3} color="#c9b79a" size={0.8} opacity={0.85} speed={0.01} />

        {/* Kuiper Belt */}
        <AsteroidBelt innerRadius={420} outerRadius={520} count={9000} height={6} color="#8aa0b3" size={1.0} opacity={0.5} speed={0.004} />
      </Suspense>
    </Canvas>
  );
};

export default SolarSystem;
