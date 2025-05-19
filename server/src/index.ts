import { v4 as uuidv4 } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';

interface SignalMessage {
  type: string;
  [key: string]: any;
}

const PORT = 4000;
const wss = new WebSocketServer({ port: PORT });
console.log(`🛰️  Signalling server listening on ws://localhost:${PORT}`);

const clients = new Map<string, WebSocket>();
const rooms = new Map<string, Set<string>>();

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  let roomName: string; // no longer string|null

  ws.send(JSON.stringify({ type: 'WELCOME', id: clientId }));

  ws.on('message', (data) => {
    let msg: SignalMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case 'JOIN': {
        roomName = msg.room; // now always a string
        if (!rooms.has(roomName)) rooms.set(roomName, new Set());
        const room = rooms.get(roomName)!;

        ws.send(
          JSON.stringify({
            type: 'EXISTING_PEERS',
            peers: Array.from(room),
          })
        );

        for (const peerId of room) {
          const peerWs = clients.get(peerId);
          peerWs?.send(
            JSON.stringify({
              type: 'NEW_PEER',
              id: clientId,
            })
          );
        }

        room.add(clientId);
        console.log(`📥 ${clientId} joined room "${roomName}"`);
        break;
      }

      // … OFFER, ANSWER, ICE_CANDIDATE, LEAVE handlers unchanged …
    }
  });

  // … ws.on('close') unchanged …
});
