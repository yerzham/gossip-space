import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Player } from "./player.tsx";
import * as THREE from "three";

const InfinitePlane = ({ mouse }: { mouse: THREE.Vector2 }) => {
  const planeRef = useRef<THREE.Mesh>(null!);
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;

  useFrame(({ camera }) => {
    if (planeRef.current) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, intersectPoint);
      intersectPoint.z = -3;
      planeRef.current.position.lerp(intersectPoint, 0.2);
    }
  });

  return (
    <mesh ref={planeRef} rotation={[0, 0, 0]} position={[0, 0, -3]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

const GameScene = () => {
  const mouse = useRef(new THREE.Vector2());

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const rect = currentTarget.getBoundingClientRect();

    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  };

  return (
    <Canvas
      onMouseMove={handleMouseMove}
      style={{ width: "100vw", height: "100vh", background: "black" }}
      camera={{ position: [0, 0, 30], fov: 55 }}
    >
      <Player mouse={mouse.current} />
      <InfinitePlane mouse={mouse.current} />
      <OrbitControls
        enableRotate={false}
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        onChange={(event) => {
          if (!event) return;
          const camera = event.target.object;
          // Restrict camera's x and y movement bounds
          camera.position.x = Math.min(Math.max(camera.position.x, -10), 10);
          camera.position.y = Math.min(Math.max(camera.position.y, -5), 5);
        }}
      />
    </Canvas>
  );
};

export { GameScene };
