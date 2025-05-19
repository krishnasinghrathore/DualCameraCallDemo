import React, { useRef, useEffect, useState } from 'react';
import useStats from '../lib/webrtc/useStats';
import StatsOverlay from './StatsOverlay';

interface VideoTileProps {
  stream?: MediaStream;
  pc?: RTCPeerConnection;
  track?: MediaStreamTrack;
  label: string;
  className?: string;
  isLocal?: boolean;
}

export default function VideoTile({ stream, pc, track, label, className = '', isLocal = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // 1) On stream arrival, attach it and set initial muted state
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    // VIDEO: autoplay preview muted
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    // AUDIO: attach & start paused
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = true;
    }

    // If this is local, disable mic track by default
    if (isLocal) {
      const mic = stream.getAudioTracks()[0];
      if (mic) mic.enabled = false;
    }

    setAudioEnabled(false);
  }, [stream, isLocal]);

  // 2) Toggle audio: enable/disable track (local) or play/pause (remote)
  const toggleAudio = () => {
    if (!stream || !audioRef.current) return;

    const next = !audioEnabled;

    if (isLocal) {
      // Mic on/off
      const mic = stream.getAudioTracks()[0];
      if (mic) mic.enabled = next;
    }
    console.log('toggleAudio');
    // Only call play() if it’s currently paused,
    // and pause() only if it’s currently playing.
    const el = audioRef.current!;
    if (isLocal) {
      // Mic on/off (no change here)
      const mic = stream.getAudioTracks()[0];
      if (mic) mic.enabled = next;
    } else {
      // Remote speaker mute/unmute
      if (next) {
        // unmute speaker
        el.muted = false;
        // ensure playback (user gesture)
        el.play().catch(() => {
          /* ignore aborts */
        });
      } else {
        // mute speaker
        el.muted = true;
      }
    }
    setAudioEnabled(next);
  };

  // 3) Toggle video track on/off
  const toggleVideo = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !videoEnabled));
    setVideoEnabled(!videoEnabled);
  };

  const { rtt, bitrate, packetLoss } = useStats(pc, track);

  return (
    <div className={`relative border rounded p-2 ${className}`}>
      <video ref={videoRef} autoPlay playsInline className="w-full h-full rounded" />
      {/* single hidden audio for both local and remote */}
      <audio ref={audioRef} playsInline controls />

      <StatsOverlay rtt={rtt} bitrate={bitrate} packetLoss={packetLoss} label={label} />

      <div className="absolute bottom-2 left-2 flex gap-2 bg-black bg-opacity-60 p-1 rounded z-20">
        <button onClick={toggleAudio} className="text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs">
          {isLocal ? (audioEnabled ? 'Mute Mic' : 'Unmute Mic') : audioEnabled ? 'Mute Speaker' : 'Unmute Speaker'}
        </button>
        <button onClick={toggleVideo} className="text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs">
          {videoEnabled ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
