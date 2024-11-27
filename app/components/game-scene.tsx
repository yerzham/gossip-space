import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls } from "./camera-controls.tsx";
import { Player } from "./player.tsx";
import * as THREE from "three";
import { ui } from "~/lib/client/tunnel.ts";
import { world } from "~/game/world.ts";
import { useFollowPointer } from "~/lib/client/useFollowPointer.ts";
import useWebSocket from "react-use-websocket";

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

const GameScene = () => {
  const cameraDistance = world.yDim / 2 / Math.tan((20 / 2) * (Math.PI / 180));
  const cameraFov = 2 * Math.atan(world.yDim / 2 / cameraDistance) *
    (180 / Math.PI);

  useWebSocket("/api/ws", {
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
    },
  });

  return (
    <>
      <Canvas
        style={{ width: "100vw", height: "100vh", background: "black" }}
        camera={{ position: [0, 0, cameraDistance], fov: cameraFov }}
      >
        <Player />
        <InfinitePlane />
        <WorldWalls />
        <CameraControls maxDistance={cameraDistance} />
      </Canvas>
      <div className="fixed top-0 right-0 bottom-0 left-0 pointer-events-none text-white">
        <ui.Out />
      </div>
    </>
  );
};

export { GameScene };
