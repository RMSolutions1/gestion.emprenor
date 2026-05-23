/**
 * Servidor Next.js + Socket.io (comunicación en tiempo real)
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

if (process.env.NODE_ENV === "production") {
  const req = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  const miss = req.filter((k) => !process.env[k]?.trim());
  if (miss.length) {
    console.error("Faltan variables de produccion:", miss.join(", "));
    process.exit(1);
  }
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3001", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

const io = new Server(httpServer, {
  path: "/api/socket.io",
  addTrailingSlash: false,
  cors: { origin: dev ? true : process.env.NEXTAUTH_URL, credentials: true },
});

global.__emprenor_io = io;

io.on("connection", (socket) => {
  socket.on("channel:join", (channelId) => {
    if (channelId) socket.join(`channel:${channelId}`);
  });
  socket.on("channel:leave", (channelId) => {
    if (channelId) socket.leave(`channel:${channelId}`);
  });
  socket.on("typing", ({ channelId, userName }) => {
    if (channelId) {
      socket.to(`channel:${channelId}`).emit("typing", { userName, userId: socket.id });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`> Emprenor Nexus listo en http://${hostname}:${port}`);
  console.log(`> Socket.io en path /api/socket.io`);
});
