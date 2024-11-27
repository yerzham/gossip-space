import * as THREE from "three";
import { useRef, useState } from "react";
import { ThreeElements, useFrame } from "@react-three/fiber";

export function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.9;
    meshRef.current.rotation.y += delta;
  });
  return (
    <mesh {...props} ref={meshRef} scale={[0.75, 0.75, 0.75]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"hotpink"} transparent opacity={0.8} />
    </mesh>
  );
}
