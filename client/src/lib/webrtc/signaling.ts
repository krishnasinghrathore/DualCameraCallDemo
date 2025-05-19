// src/lib/webrtc/signaling.ts
import { useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { ICE_SERVERS } from '../iceConfig';

// 1) Define your minimal “internal” shape:
interface InternalSimplePeer {
  _pc: RTCPeerConnection;
}

type OnRemoteStream = (peerId: string, stream: MediaStream, pc: RTCPeerConnection) => void;

export function useSignaling(localStream: MediaStream | undefined, remoteStream: OnRemoteStream) {
  const socketRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Record<string, SimplePeer.Instance>>({});

  // Keep the latest onRemote in a ref so our effect doesn't have to depend on it
  const onRemoteRef = useRef(remoteStream);
  useEffect(() => {
    onRemoteRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (!localStream) return;
    const socket = new WebSocket('ws://localhost:4000');
    socketRef.current = socket;

    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case 'WELCOME':
          socket.send(JSON.stringify({ type: 'JOIN', room: 'demo' }));
          break;
        case 'EXISTING_PEERS':
          msg.peers.forEach((peerId: string) => initPeer(peerId, true));
          break;
        case 'NEW_PEER':
          initPeer(msg.id, false);
          break;
        case 'OFFER':
        case 'ANSWER':
        case 'ICE_CANDIDATE':
          peersRef.current[msg.from]?.signal(msg);
          break;
        case 'LEAVE':
          peersRef.current[msg.id]?.destroy();
          delete peersRef.current[msg.id];
          break;
      }
    };

    function initPeer(peerId: string, initiator: boolean) {
      // 1) guard: if we already created this peer, skip
      if (peersRef.current[peerId]) return;

      // 2) create the SimplePeer instance
      const peer = new SimplePeer({
        initiator,
        trickle: true,
        stream: localStream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on('signal', (signal) => {
        socket.send(JSON.stringify({ ...signal, to: peerId, from: 'me' }));
      });

      // … inside your peer.on('stream') handler …
      peer.on('stream', (stream) => {
        // 2) First cast to unknown, then to your InternalSimplePeer:
        const internalPeer = peer as unknown as InternalSimplePeer;
        const pc = internalPeer._pc;

        // 3) Now call your callback with the real RTCPeerConnection:
        onRemoteRef.current(peerId, stream, pc);
      });

      peersRef.current[peerId] = peer;
    }

    return () => {
      socket.close();
      Object.values(peersRef.current).forEach((p) => p.destroy());
      peersRef.current = {};
    };
  }, [localStream]); // <–– only re-run when localStream changes
}
