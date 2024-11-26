import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Star } from "./star.tsx";
import { ui } from "~/lib/client/tunnel.ts";
import * as THREE from "three";
import { useMousePosition } from "~/lib/client/useMousePosition.ts";

const Player = ({ mouse }: { mouse: THREE.Vector2 }) => {
  const playerRef = useRef<THREE.Group>(null!);
  const planeZ = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const raycaster = useRef(new THREE.Raycaster()).current;
  const intersectPoint = useRef(new THREE.Vector3()).current;
  const mousePosition = useMousePosition();
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });

  useFrame(({ camera }) => {
    if (playerRef.current) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, intersectPoint);
      playerRef.current.position.lerp(intersectPoint, 0.2);
      setPlayerPosition({ x: intersectPoint.x, y: intersectPoint.y });
    }
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
