import { useCallback, useRef, useState } from "react";
import { Star } from "./star.tsx";
import { ui } from "~/lib/client/tunnel.ts";
import * as THREE from "three";
import { useMouse } from "~/lib/client/useMouse.ts";
import { useFollowPointer } from "~/lib/client/useFollowPointer.ts";
import { throttle } from "~/lib/client/utils.ts";
import { useFrame } from "@react-three/fiber";

const Player = () => {
  const playerRef = useRef<THREE.Group>(null!);
  useFollowPointer({
    targetRef: playerRef,
  });
  const { position: mousePosition } = useMouse();

  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });

  const updatePlayerPosition = useCallback(
    throttle(() => {
      setPlayerPosition({
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
      });
    }, 100),
    [],
  );

  useFrame(() => {
    updatePlayerPosition();
  });

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
