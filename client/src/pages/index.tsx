import { useEffect, useState } from 'react';
import VideoGrid, { PeerStreams } from '../components/VideoGrid';
import { subscribeToStream } from '../lib/webrtc/janusClient';
import { useSignaling } from '../lib/webrtc/signaling';

export default function Home() {
  const [localLaptop, setLocalLaptop] = useState<MediaStream>();
  const [localLaptopPC, setLocalLaptopPC] = useState<RTCPeerConnection>();
  const [localMobile, setLocalMobile] = useState<MediaStream>();
  const [localMobilePC, setLocalMobilePC] = useState<RTCPeerConnection>();
  const [remotes, setRemotes] = useState<Record<string, PeerStreams>>({});

  // 1️⃣ Capture Laptop stream + PC
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalLaptop(stream);
        const pc = new RTCPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setLocalLaptopPC(pc);
      })
      .catch(console.error);
  }, []);

  // 2️⃣ Capture Mobile stream + PC (Janus)
  useEffect(() => {
    subscribeToStream((stream, pc) => {
      // ←— add your debug here
      console.log('Audio tracks:', stream.getAudioTracks());
      stream
        .getAudioTracks()
        .forEach((track) =>
          track.getSettings ? console.log('Audio settings:', track.getSettings()) : console.log(track)
        );

      setLocalMobile(stream);
      setLocalMobilePC(pc);
    });
  }, []);

  // 3️⃣ Signaling for any remote peers
  useSignaling(localLaptop, (peerId, stream, pc) => {
    setRemotes((prev) => ({
      ...prev,
      [peerId]: {
        laptop: { stream, pc },
        mobile: prev[peerId]?.mobile,
      },
    }));
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <VideoGrid
          localLaptop={localLaptop}
          localLaptopPC={localLaptopPC}
          localMobile={localMobile}
          localMobilePC={localMobilePC} // pass it here
          remotes={remotes}
        />
      </div>
    </div>
  );
}
