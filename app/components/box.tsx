import * as THREE from "three";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { MeshProps, useFrame } from "@react-three/fiber";

type BoxProps = MeshProps & { color?: string };

export const Box = forwardRef<THREE.Mesh, BoxProps>(function Box(
  { color = "hotpink", ...props },
  ref
) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useImperativeHandle(ref, () => meshRef.current);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.9;
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh {...props} ref={meshRef} scale={[0.75, 0.75, 0.75]}>
      <icosahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
});
