import { world } from "~/game/world";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as IOrbitControls } from "three/examples/jsm/Addons.js";

const CameraControls = ({ maxDistance }: { maxDistance: number }) => {
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;
  const maxSpeed = 0.01;

  const { gl, camera } = useThree((state) => ({
    gl: state.gl,
    camera: state.camera,
  }));

  const zoom = useCallback(
    function zoom(event: WheelEvent) {
      const direction = new THREE.Vector3(0, 0, Math.sign(event.deltaY));
      camera.position.lerp(camera.position.clone().add(direction), 1);
      camera.position.z = Math.min(
        Math.max(camera.position.z, 20),
        maxDistance,
      );
    },
    [camera, maxDistance],
  );

  useEffect(() => {
    gl.domElement.addEventListener("wheel", zoom);
    return () => {
      gl.domElement.removeEventListener("wheel", zoom);
    };
  });

  useFrame(({ camera, pointer }) => {
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    intersectPoint.setX(
      Math.min(Math.max(intersectPoint.x, -world.xDim / 2), world.xDim / 2),
    );
    intersectPoint.setY(
      Math.min(Math.max(intersectPoint.y, -world.yDim / 2), world.yDim / 2),
    );
    intersectPoint.setZ(camera.position.z);
    const dist = camera.position.distanceTo(intersectPoint);
    if (dist > 2) {
      intersectPoint
        .sub(camera.position)
        .setLength(dist - 1)
        .add(camera.position);

      camera.position.lerp(intersectPoint, maxSpeed);
    }
  });

  return null;
};

export { CameraControls };
