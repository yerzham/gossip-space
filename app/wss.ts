export const wssHandler = (req: Request) => {
  console.log(req.url);

  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ message: "Hello from the server!" }));
    });

    socket.addEventListener("message", (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }
    });

    return response;
  }

  return null;
};
