import { useGLTF } from "@react-three/drei";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Star = forwardRef<THREE.Group>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

  useImperativeHandle(ref, () => groupRef.current);

  const { scene } = useGLTF("/great_icosahedron.glb");

  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = new THREE.MeshStandardMaterial({
        color: "white", // Base color of the star
        metalness: 0.5, // Make it shiny like metal

        roughness: 0.5, // Smooth surface

        emissive: new THREE.Color("yellow"), // Glow effect
        emissiveIntensity: 0.07, // Intensity of the glow
      });
    }
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
      if (spotLightRef.current) {
        spotLightRef.current.position.x = groupRef.current.position.x;
        spotLightRef.current.position.y = groupRef.current.position.y;
        spotLightRef.current.position.z = 3;
        spotLightRef.current.target = groupRef.current;
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Star Model */}
        <primitive object={scene} />
        {/* Light attached to the star */}
        <pointLight
          intensity={2} // Brightness of the emitted light
          distance={10} // Range of light
          decay={2} // Light falloff
          color="yellow"
          position={[0, 0, 0]} // Light stays at the center of the star
        />
        {/* Light illuminating the star */}
      </group>

      <spotLight
        ref={spotLightRef}
        intensity={2} // Brightness of the emitted light
        distance={5} // Range of light
        decay={2} // Light falloff
        angle={Math.PI / 4} // Light cone angle
        color="yellow"
      />
    </>
  );
});
Star.displayName = "Star";

const createIcosahedronGeometry = () => {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  return geometry;
};

const IcosahedronStar = forwardRef<THREE.Mesh>((_, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useImperativeHandle(ref, () => meshRef.current);

  // Animate the star (e.g., rotation or pulsation)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  // Generate the spiky geometry
  const spikyGeometry = createIcosahedronGeometry();

  return (
    <>
      {/* Nebula Star Mesh */}
      <mesh ref={meshRef} geometry={spikyGeometry}>
        <meshStandardMaterial
          color="gold"
          emissive="orange"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>
    </>
  );
});
IcosahedronStar.displayName = "IcosahedronStar";

export { IcosahedronStar, Star };
