import { wssHandler } from "./app/wss.ts";

Deno.serve((req) => {
  const res = wssHandler(req);
  if (res) {
    return res;
  }
  return new Response("OK");
});
