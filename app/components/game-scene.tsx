import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls } from "./camera-controls.tsx";
import { Player } from "./player.tsx";
import * as THREE from "three";
import { ui } from "~/lib/client/tunnel.ts";
import { world } from "~/game/world.ts";
import { useFollowPointer } from "~/lib/client/useFollowPointer.ts";
import { useGameSocket } from "~/lib/client/game-socket.tsx";
import { Box } from "./box.tsx";

const InfinitePlane = () => {
  const planeRef = useRef<THREE.Mesh>(null!);
  useFollowPointer({
    targetRef: planeRef,
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
  const cameraDistance = world.yDim / 2 / Math.tan((20 / 2) * (Math.PI / 180)) +
    6;
  const walls = [
    {
      position: new THREE.Vector3(
        0,
        world.yDim / 2 + 2,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler((Math.PI / 180) * 90, 0, 0),
      scale: [world.xDim + 4, cameraDistance, 1] as const,
    },
    {
      position: new THREE.Vector3(
        0,
        -world.yDim / 2 - 2,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler((-Math.PI / 180) * 90, 0, 0),
      scale: [world.xDim + 4, cameraDistance, 1] as const,
    },
    {
      position: new THREE.Vector3(
        world.xDim / 2 + 2,
        0,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(0, (-Math.PI / 180) * 90, 0),
      scale: [cameraDistance, world.yDim + 4, 1] as const,
    },
    {
      position: new THREE.Vector3(
        -world.xDim / 2 - 2,
        0,
        cameraDistance / 2 - 3,
      ),
      rotation: new THREE.Euler(0, (Math.PI / 180) * 90, 0),
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
          <meshStandardMaterial
            color="white"
            emissive="grey"
            emissiveIntensity={0.02}
          />
        </mesh>
      ))}
    </>
  );
};

const Agents = () => {
  const { gameData } = useGameSocket();
  return (
    <>
      {gameData?.agnets.map((agent) => (
        <Box
          key={agent.id}
          position={[agent.position.x, agent.position.y, -1.5]}
        />
      ))}
    </>
  );
};

const GameScene = () => {
  const cameraDistance = world.yDim / 2 / Math.tan((20 / 2) * (Math.PI / 180));
  const cameraFov = 2 * Math.atan(world.yDim / 2 / cameraDistance) *
    (180 / Math.PI);

  const { gameData } = useGameSocket();

  if (!gameData) {
    return null;
  }

  return (
    <>
    <div className="h-screen w-screen relative bg-black">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
      >
        <Player />
        <Agents />
        <InfinitePlane />
        <WorldWalls />
        <CameraControls maxDistance={cameraDistance} />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none text-white">
        <ui.Out />
      </div>
    </div>
    </>
  );
};

export { GameScene };
