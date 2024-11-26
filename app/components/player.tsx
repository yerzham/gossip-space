import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Star } from "./star.tsx";
import * as THREE from "three";

const Player = ({ mouse }: { mouse: THREE.Vector2 }) => {
  const boxRef = useRef<THREE.Group>(null!);
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;

  useFrame(({ camera }) => {
    if (boxRef.current) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, intersectPoint);
      boxRef.current.position.lerp(intersectPoint, 0.2);
    }
  });

  return <Star ref={boxRef} />;
};

export { Player };
