import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Star } from "./star.tsx";
import { ui } from "~/lib/client/tunnel.ts";
import * as THREE from "three";
import { useMouse } from "~/lib/client/useMouse.ts";
import { usePlayer } from "~/lib/client/usePlayer.ts";

const Player = () => {
  const playerRef = useRef<THREE.Group>(null!);
  const { position: playerPosition } = usePlayer({
    playerRef,
  });
  const { position: mousePosition } = useMouse();

  return (
    <>
      <ui.In>
        <div
          style={{
            top: mousePosition.y - 40,
            left: mousePosition.x + 20,
          }}
          className="fixed text-white"
        >
          <span className="whitespace-nowrap font-mono text-xs">
            {playerPosition.x.toFixed(2)}, {playerPosition.y.toFixed(2)}
          </span>
        </div>
      </ui.In>
      <Star ref={playerRef} />
    </>
  );
};

export { Player };
