import type { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __emprenor_io: SocketIOServer | undefined;
}

export function setSocketServer(io: SocketIOServer) {
  global.__emprenor_io = io;
}

export function getSocketServer(): SocketIOServer | null {
  return global.__emprenor_io ?? null;
}

export function emitChannelMessage(channelId: string, payload: unknown) {
  const io = getSocketServer();
  if (!io) return;
  io.to(`channel:${channelId}`).emit("message:new", payload);
}
