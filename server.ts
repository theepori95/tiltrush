import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import QRCode from "qrcode";
import type { ClientToServerMsg, ServerToClientMsg } from "./src/net/protocol";
import type { PlayerId } from "./src/types/game";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

interface RoomSession {
  roomCode: string;
  hostSocket: WebSocket | null;
  players: Map<PlayerId, WebSocket>;
  createdAt: number;
}

const rooms = new Map<string, RoomSession>();

// Cleanup stale rooms older than 6 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > 6 * 3600 * 1000) {
      rooms.delete(code);
    }
  }
}, 60 * 1000);

wss.on("connection", (ws: WebSocket) => {
  let boundRoom: string | null = null;
  let boundPlayer: PlayerId | null = null;
  let isHost = false;

  ws.on("message", async (data: Buffer | string) => {
    try {
      const msg: ClientToServerMsg = JSON.parse(data.toString());

      if (msg.t === "create") {
        boundRoom = msg.room.toUpperCase();
        isHost = true;
        let room = rooms.get(boundRoom);
        if (!room) {
          room = {
            roomCode: boundRoom,
            hostSocket: ws,
            players: new Map(),
            createdAt: Date.now(),
          };
          rooms.set(boundRoom, room);
        } else {
          room.hostSocket = ws;
        }

        const res: ServerToClientMsg = { t: "created", room: boundRoom };
        ws.send(JSON.stringify(res));
        return;
      }

      if (msg.t === "join") {
        boundRoom = msg.room.toUpperCase();
        boundPlayer = msg.player || 1;
        isHost = false;

        let room = rooms.get(boundRoom);
        if (!room) {
          // Auto-provision room if joining directly
          room = {
            roomCode: boundRoom,
            hostSocket: null,
            players: new Map(),
            createdAt: Date.now(),
          };
          rooms.set(boundRoom, room);
        }

        room.players.set(boundPlayer, ws);

        const joinAck: ServerToClientMsg = { t: "joined", room: boundRoom, player: boundPlayer };
        ws.send(JSON.stringify(joinAck));

        // Notify host
        if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
          const notify: ServerToClientMsg = {
            t: "player_connected",
            room: boundRoom,
            player: boundPlayer,
          };
          room.hostSocket.send(JSON.stringify(notify));
        }
        return;
      }

      if (!boundRoom) return;
      const room = rooms.get(boundRoom);
      if (!room) return;

      if (msg.t === "tilt") {
        if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
          const forward: ServerToClientMsg = {
            t: "tilt",
            player: msg.player,
            x: msg.x,
            y: msg.y,
            seq: msg.seq,
          };
          room.hostSocket.send(JSON.stringify(forward));
        }
        return;
      }

      if (msg.t === "action") {
        if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
          const forward: ServerToClientMsg = {
            t: "action",
            player: msg.player,
            actionType: msg.actionType,
          };
          room.hostSocket.send(JSON.stringify(forward));
        }
        return;
      }

      if (msg.t === "calibrate") {
        if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
          const forward: ServerToClientMsg = {
            t: "calibrate",
            player: msg.player,
            roll: msg.roll,
            pitch: msg.pitch,
          };
          room.hostSocket.send(JSON.stringify(forward));
        }
        return;
      }

      if (msg.t === "ping") {
        // Echo back pong with RTT calculation support
        const pong: ServerToClientMsg = {
          t: "pong",
          id: msg.id,
          rtt: 0,
        };
        ws.send(JSON.stringify(pong));
        return;
      }
    } catch (err) {
      console.error("WS error parsing message:", err);
    }
  });

  ws.on("close", () => {
    if (boundRoom) {
      const room = rooms.get(boundRoom);
      if (room) {
        if (isHost) {
          room.hostSocket = null;
        } else if (boundPlayer) {
          room.players.delete(boundPlayer);
          if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
            const leaveMsg: ServerToClientMsg = {
              t: "player_disconnected",
              room: boundRoom,
              player: boundPlayer,
            };
            room.hostSocket.send(JSON.stringify(leaveMsg));
          }
        }
      }
    }
  });
});

// QR Code API helper
app.get("/api/qr", async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("Missing url param");
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      color: {
        dark: "#C4B5FD",
        light: "#0B0A10",
      },
    });
    res.json({ qr: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", activeRooms: rooms.size, timestamp: Date.now() });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`TiltRush full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
