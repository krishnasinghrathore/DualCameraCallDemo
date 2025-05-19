/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/types/janus-gateway.d.ts
declare module 'janus-gateway' {
  /** Full config you pass into `new Janus({...})` */
  export interface JanusConfig {
    server: string;
    iceServers?: any[];
    success?: () => void;
    error?: (err: any) => void;
    destroyed?: () => void;
  }

  /** The handle you get back from `attach()` on the streaming plugin */
  export interface StreamingPluginHandle {
    send(message: object, jsep?: object): void;
    createAnswer(opts: {
      jsep: any;
      media: { audioSend: boolean; videoSend: boolean };
      success(jsep: any): void;
      error(err: any): void;
    }): void;
  }

  /** The object returned by `new Janus({...})` */
  export interface JanusInstance {
    attach(opts: {
      plugin: string;
      success(handle: StreamingPluginHandle): void;
      error(err: any): void;
      onmessage(msg: any, jsep?: any): void;
      onremotetrack(track: MediaStreamTrack, mid: string, on: boolean): void;
      iceState?(state: string): void;
    }): void;
  }

  /** The “static” Janus object you import: it has `init()` and is constructible */
  export interface JanusStatic {
    init(opts: { debug: boolean }): void;
    new (config: JanusConfig): JanusInstance;
  }

  /** Tell TS that the default export is our JanusStatic */
  const Janus: JanusStatic;
  export default Janus;
}
