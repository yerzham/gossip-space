import { useGLTF } from "@react-three/drei";
import {
  forwardRef,
  MutableRefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { MeshProps, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion-3d";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events";

const AnimatedStarHalo = ({
  onAnimationComplete,
}: {
  onAnimationComplete?: () => void;
}) => {
  const halo1Ref = useRef<THREE.Mesh>(null!);
  const maxHaloScale = 3;

  const initialRotation = useMemo(
    () =>
      new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ),
    []
  );

  useFrame(() => {
    if (halo1Ref.current) {
      halo1Ref.current.rotation.z =
        (halo1Ref.current.rotation.z + 0.01) % (Math.PI * 2);
      halo1Ref.current.rotation.y =
        (halo1Ref.current.rotation.y + 0.01) % (Math.PI * 2);
      halo1Ref.current.rotation.x =
        (halo1Ref.current.rotation.x + 0.01) % (Math.PI * 2);
    }
  });

  return (
    <>
      <motion.mesh
        ref={halo1Ref as unknown as MutableRefObject<MeshProps>}
        transition={{ type: "spring", duration: 0.5 }}
        variants={{
          initial: { scale: 0 },
          animate: { scale: maxHaloScale },
        }}
        initial="initial"
        animate="animate"
        rotation={initialRotation}
        onAnimationComplete={onAnimationComplete}
      >
        <cylinderGeometry args={[1, 1, 0.2, 32, 1, true]} />
        <motion.meshStandardMaterial
          color="yellow"
          emissive="yellow"
          emissiveIntensity={0.2}
          transparent
          side={THREE.DoubleSide}
          variants={{
            initial: { opacity: 0.3 },
            animate: { opacity: 0 },
          }}
        />
      </motion.mesh>
    </>
  );
};

const Star = forwardRef<THREE.Group, EventHandlers>(
  ({ onClick, ...props }, ref) => {
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
          emissiveIntensity: 0.2, // Intensity of the glow
          transparent: true, // Enable transparency
          opacity: 0.8,
        });
      }
    });

    useFrame(({ clock }) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01;
        groupRef.current.rotation.x += 0.008;
        const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
        groupRef.current.scale.set(scale, scale, scale);
        if (spotLightRef.current) {
          spotLightRef.current.position.x = groupRef.current.position.x;
          spotLightRef.current.position.y = groupRef.current.position.y;
          spotLightRef.current.position.z = 1;
          spotLightRef.current.target = groupRef.current;
        }
      }
    });

    const [animatingHalo, setAnimatingHalo] = useState(false);

    const handleClick = useCallback(() => {
      setAnimatingHalo(true);
    }, []);

    return (
      <>
        <group
          ref={groupRef}
          onClick={(event) => {
            handleClick();
            onClick?.(event);
          }}
          {...props}
        >
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
          {animatingHalo && (
            <AnimatedStarHalo
              onAnimationComplete={() => setAnimatingHalo(false)}
            />
          )}
        </group>

        <spotLight
          ref={spotLightRef}
          intensity={1} // Brightness of the emitted light
          distance={2} // Range of light
          decay={4} // Light falloff
          angle={Math.PI / 4} // Light cone angle
          color="yellow"
        />
      </>
    );
  }
);
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
