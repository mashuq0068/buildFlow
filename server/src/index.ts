import { createServer } from "http";
import app from "./app";
import { config } from "./config";
import { initSocket } from "./lib/socket";

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
