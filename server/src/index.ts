import { createServer } from "http";
import app from "./app";
import { config } from "./config";
import { initSocket } from "./lib/socket";

const httpServer = createServer(app);

if (config.enableSockets) {
  initSocket(httpServer);
} else {
  console.log("Sockets disabled (NODE_ENV=production) — serving REST only");
}

httpServer.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

// Vercel's zero-config Express detection looks for app.{ts,js}/index.{ts,js}/server.{ts,js}
// (at root or under src/) and needs a default export OR a .listen() call — this file already
// has the latter, but exporting the app too makes detection unambiguous either way.
export default app;
