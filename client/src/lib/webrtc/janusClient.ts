/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/webrtc/janusClient.ts
import Janus from 'janus-gateway';
import { ICE_SERVERS } from '../iceConfig';

export type RemoteStreamCallback = (stream: MediaStream, pc: RTCPeerConnection) => void;

export function subscribeToStream(onRemoteStream: RemoteStreamCallback): void {
  console.log('[Janus] initializing…');
  // 1) Initialize Janus once
  (Janus as any).init({ debug: 'all' });

  // 2) Create the unified stream container
  const remoteStream = new MediaStream();
  let streamingHandle: any;

  // 3) Create your Janus session
  const janus = new (Janus as any)({
    server: 'ws://localhost:8188/',
    iceServers: ICE_SERVERS,

    success: () => {
      console.log('[Janus] session created');
      // 4) Attach **on the instance**
      janus.attach({
        plugin: 'janus.plugin.streaming',

        success: (handle: any) => {
          streamingHandle = handle;
          console.log('[Janus] attached, id=', handle.getId());
          handle.send({ message: { request: 'watch', id: 1 } });
        },

        error: (err: any) => {
          console.error('[Janus] attach error', err);
        },

        onmessage: (msg: any, jsep: any) => {
          console.log('[Janus] onmessage', msg);
          if (jsep && streamingHandle) {
            streamingHandle.createAnswer({
              jsep,
              tracks: [
                { type: 'audio', recv: true, send: false },
                { type: 'video', recv: true, send: false },
              ],

              success: (jsepAnswer: any) => {
                console.log('[Janus] created answer, starting');
                streamingHandle.send({ message: { request: 'start' }, jsep: jsepAnswer });
              },
              error: (createErr: any) => {
                console.error('[Janus] createAnswer error', createErr);
              },
            });
          }
        },

        onremotetrack: (track: MediaStreamTrack, mid: string, added: boolean) => {
          console.log('[Janus] onremotetrack:', mid, track.kind, added);
          if (added) {
            if (!remoteStream.getTracks().includes(track)) {
              remoteStream.addTrack(track);
            }
          } else if (track.readyState === 'ended') {
            remoteStream.removeTrack(track);
          }
          const pc = streamingHandle.webrtcStuff.pc as RTCPeerConnection;
          onRemoteStream(remoteStream, pc);
        },

        iceState: (state: string) => {
          console.log('[Janus] ICE state:', state);
        },
      });
    },

    error: console.error,
    destroyed: () => console.log('[Janus] destroyed'),
  });
}
