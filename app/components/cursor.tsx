import { useEffect, useState } from "react";

const Cursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div
        className="fixed w-4 h-4 border-white border bg-transparent rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transform"
        style={{ top: position.y, left: position.x }}
      />
    </>
  );
};

export { Cursor };
