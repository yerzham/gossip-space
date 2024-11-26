import { world } from "~/game/world";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCallback } from "react";

const CameraControls = ({ maxDistance }: { maxDistance: number }) => {
  const zoom = useCallback(function zoom(this: {camera: THREE.Camera}, event: WheelEvent) {
    const delta = event.deltaY;
    const direction = new THREE.Vector3(0, 0, -1);
    this.camera.position.lerp(
      this.camera.position.clone().add(direction.multiplyScalar(delta)),
      0.1
    );
    this.camera.position.z = Math.min(Math.max(this.camera.position.z, 20), maxDistance);
  }, []);

  useFrame(({ gl, camera }) => {
    gl.domElement.addEventListener("wheel", zoom.bind({ camera }), {
      once: true,
    });
  });

  useFrame(({ camera, pointer }) => {
    const direction = {
      x: pointer.x < -0.8 ? -1 : pointer.x > 0.8 ? 1 : 0,
      y: pointer.y < -0.8 ? -1 : pointer.y > 0.8 ? 1 : 0,
    };

    camera.position.x = Math.min(
      Math.max(camera.position.x + direction.x * 0.1, -world.xDim / 2),
      world.xDim / 2
    );

    camera.position.y = Math.min(
      Math.max(camera.position.y + direction.y * 0.1, -world.yDim / 2),
      world.yDim / 2
    );
  });

  return <></>;
};

export { CameraControls };
