import * as THREE from "three";
import { world } from "~/game/world";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const useFollowPointer = ({
  targetRef,
}: {
  targetRef: React.MutableRefObject<THREE.Group | THREE.Mesh>;
}) => {
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;

  useFrame(({ camera, pointer }) => {
    if (targetRef.current) {
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
      targetRef.current.position.lerp(intersectPoint, 0.2);
    }
  });
};

export { useFollowPointer };
