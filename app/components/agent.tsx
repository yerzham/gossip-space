import { MeshProps, useFrame, useThree } from "@react-three/fiber";
import { Box } from "./box";
import { useGameSocket } from "~/lib/client/game-socket";
import { ui } from "~/lib/client/tunnel";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { throttle } from "~/lib/client/utils";

type AgentProps = MeshProps & { name: string };

export const AgnetUI = memo(
  ({
    isChattingWithPlayer,
    position,
    name,
  }: {
    isChattingWithPlayer: boolean;
    position: { top: number; left: number };
    name: string;
  }) => {
    return (
      <ui.In>
        {isChattingWithPlayer && (
          <div style={position} className="absolute text-white z-10">
            <div className="bg-black/50 backdrop-blur border border-yellow-500 p-2 rounded-md">
              <p>Hey there!</p>
            </div>
          </div>
        )}
      </ui.In>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isChattingWithPlayer === nextProps.isChattingWithPlayer &&
      prevProps.position.top === nextProps.position.top &&
      prevProps.position.left === nextProps.position.left &&
      prevProps.name === nextProps.name
    );
  }
);

export function Agent(props: AgentProps) {
  const { gameData } = useGameSocket();
  const [agentPosition, setAgentPosition] = useState({ x: 0, y: 0 });

  const agentRef = useRef<THREE.Mesh>(null!);

  const updateAgentPosition = useCallback(
    throttle((camera: THREE.Camera, gl: THREE.WebGLRenderer) => {
      if (agentRef.current) {
        const position = agentRef.current.position.clone();
        position.project(camera);

        const x = ((position.x + 1) * gl.domElement.clientWidth) / 2;
        const y = (-(position.y - 1) * gl.domElement.clientHeight) / 2;

        setAgentPosition({ x, y });
      }
    }, 33),
    []
  );

  useFrame(({ camera, gl }) => {
    updateAgentPosition(camera, gl);
  });

  const isChattingWithPlayer =
    gameData?.activeConversations.some(
      (conversation) =>
        conversation.parties.includes("player") &&
        conversation.parties.includes(props.name)
    ) ?? false;

  const uiPosition = useMemo(() => {
    return {
      top: agentPosition.y + 15,
      left: agentPosition.x + 15,
    };
  }, [agentPosition.x, agentPosition.y]);

  return (
    <>
      <Box
        ref={agentRef}
        {...props}
        scale={[0.75, 0.75, 0.75]}
        color={isChattingWithPlayer ? "hotpink" : "green"}
      />
      <AgnetUI
        isChattingWithPlayer={isChattingWithPlayer}
        position={uiPosition}
        name={props.name}
      />
    </>
  );
}
