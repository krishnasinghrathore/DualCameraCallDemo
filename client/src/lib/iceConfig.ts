// src/lib/iceConfig.ts
export const ICE_SERVERS: RTCIceServer[] = [
  // 1) Public STUN
  { urls: 'stun:stun.l.google.com:19302' },

  // 2) Your local TURN (Docker)
  {
    urls: 'turn:localhost:3478?transport=udp',
    username: 'tanbeeh',
    credential: 'secretpass',
  },
];
