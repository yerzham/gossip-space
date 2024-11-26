import React, { useRef } from "react";
import { Canvas, events, useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "./camera-controls.tsx";
import { Player } from "./player.tsx";
import * as THREE from "three";
import { ui } from "~/lib/client/tunnel.ts";
import { useWindowSize } from "~/lib/client/useWindowSize.tsx";
import { world } from "~/game/world.ts";
import { usePlayer } from "~/lib/client/usePlayer.ts";

const InfinitePlane = ({ mouse }: { mouse: THREE.Vector2 }) => {
  const planeRef = useRef<THREE.Mesh>(null!);
  usePlayer({
    mouse,
    playerRef: planeRef,
  });

  useFrame(() => {
    if (planeRef.current) {
      planeRef.current.position.z = -3;
    }
  });

  return (
    <mesh ref={planeRef} rotation={[0, 0, 0]} position={[0, 0, -3]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

const WorldWalls = () => {
  const cameraDistance =
    (world.yDim / 2) / Math.tan((20 / 2) * (Math.PI / 180)) + 6;
  const walls = [
    {
      position: new THREE.Vector3(
        0,
        world.yDim / 2 + 2,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(Math.PI / 180 * 90, 0, 0),
      scale: [world.xDim + 4, cameraDistance, 1] as const,
    },
    {
      position: new THREE.Vector3(
        0,
        -world.yDim / 2 - 2,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(-Math.PI / 180 * 90, 0, 0),
      scale: [world.xDim + 4, cameraDistance, 1] as const,
    },
    {
      position: new THREE.Vector3(
        world.xDim / 2 + 2,
        0,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(0, -Math.PI / 180 * 90, 0),
      scale: [cameraDistance, world.yDim + 4, 1] as const,
    },
    {
      position: new THREE.Vector3(
        -world.xDim / 2 - 2,
        0,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(0, Math.PI / 180 * 90, 0),
      scale: [cameraDistance, world.yDim + 4, 1] as const,
    },
  ];

  return (
    <>
      {walls.map((wall, index) => (
        <mesh
          key={index}
          position={wall.position}
          rotation={wall.rotation}
          scale={wall.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </>
  );
};

const GameScene = () => {
  const mouse = useRef(new THREE.Vector2());

  // const { camera } = useThree()

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const rect = currentTarget.getBoundingClientRect();

    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  };

  const cameraDistance = (world.yDim / 2) /
    Math.tan((20 / 2) * (Math.PI / 180));
  const cameraFov = 2 * Math.atan((world.yDim / 2) / cameraDistance) *
    (180 / Math.PI);

  return (
    <>
      <Canvas
        onMouseMove={handleMouseMove}
        style={{ width: "100vw", height: "100vh", background: "black" }}
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
      >
        <Player mouse={mouse.current} />
        <InfinitePlane mouse={mouse.current} />
        <WorldWalls />
        <CameraControls maxDistance={cameraDistance} />
        <ambientLight intensity={0.1} />
      </Canvas>
      <div className="fixed top-0 right-0 bottom-0 left-0 pointer-events-none text-white">
        <ui.Out />
      </div>
    </>
  );
};

export { GameScene };
