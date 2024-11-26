import { useEffect, useState } from "react";
import { useMouse } from "~/lib/client/useMouse";

const Cursor: React.FC = () => {
  const { position } = useMouse();

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
