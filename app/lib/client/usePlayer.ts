import * as THREE from "three";
import { world } from "~/game/world";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

const usePlayer = ({
  playerRef,
}: {
  playerRef: React.MutableRefObject<THREE.Group | THREE.Mesh>;
}) => {
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;
  const [position, setPlayerPosition] = useState({ x: 0, y: 0 });

  useFrame(({ camera, pointer }) => {
    if (playerRef.current) {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(planeZ, intersectPoint);
      intersectPoint.x = Math.min(
        Math.max(intersectPoint.x, -world.xDim / 2),
        world.xDim / 2,
      );
      intersectPoint.y = Math.min(
        Math.max(intersectPoint.y, -world.yDim / 2),
        world.yDim / 2,
      );
      playerRef.current.position.lerp(intersectPoint, 0.2);
      setPlayerPosition({
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
      });
    }
  });

  return { position };
};

export { usePlayer };
