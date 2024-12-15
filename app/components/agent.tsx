import { MeshProps, useFrame } from "@react-three/fiber";
import { Box } from "./box";
import { useGameSocket } from "~/lib/client/game-socket";
import { ui } from "~/lib/client/tunnel";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { throttle } from "~/lib/client/utils";
import { ChatMessageChunk } from "~/game/data";

type AgentProps = MeshProps & { agentId: string };

type ChatMessages = {
  id: string;
  from: "player" | "agent";
  message: string;
}[];

const ChatWithAgent = ({ agentId }: { agentId: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessages>([]);
  const socket = useGameSocket({
    onChatMessageChunk: useCallback(
      ({ streamId, from, message, ended }: ChatMessageChunk) => {
        console.log(from, message);
        setMessages((prevMessages) => {
          const prevMessage = prevMessages.find(
            (message) => message.id === streamId
          );
          if (!prevMessage) {
            return [...prevMessages, { id: streamId, from: "agent", message }];
          }

          return prevMessages.map((prevMessage) =>
            prevMessage.id === streamId
              ? {
                  ...prevMessage,
                  message: prevMessage.message + message,
                }
              : prevMessage
          );
        });
      },
      []
    ),
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const input = inputRef.current;
      if (input) {
        input.focus();
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (message) {
        socket.send({
          type: "chatMessage",
          data: {
            from: "player",
            to: agentId,
            message,
          },
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: crypto.randomUUID(), from: "player", message },
        ]);
        setMessage("");
      }
    },
    [agentId, socket]
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === "ArrowDown") {
        container.scrollTop += 20; // adjust scroll step as needed
      } else if (e.key === "ArrowUp") {
        container.scrollTop -= 20;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-black/50 backdrop-blur border border-yellow-500 p-2 rounded-md">
      <div ref={containerRef} className="flex flex-col h-32 overflow-y-scroll">
        {messages.map((message) => (
          <div key={message.id} className="text-white whitespace-pre-wrap">
            <span
              className={
                message.from === "player" ? "text-yellow-500" : "text-pink-500"
              }
            >
              {message.from === "player" ? "You: " : "Agent: "}
            </span>
            {message.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex mt-2">
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type a message..."
          className="w-40 bg-zinc-800"
        />
        <button type="submit" className="ml-2">
          Send
        </button>
      </form>
    </div>
  );
};

type AgentUIProps = {
  isChattingWithPlayer: boolean;
  initialPosition: { top: number; left: number };
  agentId: string;
};
export const AgnetUI = memo(
  forwardRef<HTMLDivElement, AgentUIProps>(
    ({ isChattingWithPlayer, agentId, initialPosition }, ref) => {
      return (
        <ui.In>
          <div
            ref={ref}
            className="absolute text-white z-10"
            style={initialPosition}
          >
            {isChattingWithPlayer && <ChatWithAgent agentId={agentId} />}
          </div>
        </ui.In>
      );
    }
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.isChattingWithPlayer === nextProps.isChattingWithPlayer &&
      prevProps.agentId === nextProps.agentId
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
        conversation.parties.includes(props.agentId)
    ) ?? false;

  const agentUIRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (agentUIRef.current) {
      agentUIRef.current.setAttribute(
        "style",
        `top: ${agentPosition.y}px; left: ${agentPosition.x}px;`
      );
      console.log();
    }
  }, [agentPosition.x, agentPosition.y, isChattingWithPlayer]);

  return (
    <>
      <AgnetUI
        ref={agentUIRef}
        isChattingWithPlayer={isChattingWithPlayer}
        initialPosition={{ top: agentPosition.y, left: agentPosition.x }}
        agentId={props.agentId}
      />
      <Box
        ref={agentRef}
        {...props}
        scale={[0.75, 0.75, 0.75]}
        color={isChattingWithPlayer ? "hotpink" : "green"}
      />
    </>
  );
}
