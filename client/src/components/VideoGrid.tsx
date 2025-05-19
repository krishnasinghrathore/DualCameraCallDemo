// src/components/VideoGrid.tsx
import React from 'react';
import VideoTile from './VideoTile';

export interface PeerStreams {
  laptop?: { stream: MediaStream; pc: RTCPeerConnection };
  mobile?: MediaStream;
}

interface VideoGridProps {
  localLaptop?: MediaStream;
  localLaptopPC?: RTCPeerConnection;
  localMobile?: MediaStream;
  localMobilePC?: RTCPeerConnection;
  remotes: Record<string, PeerStreams>;
}

export default function VideoGrid({ localLaptop, localLaptopPC, localMobile, localMobilePC, remotes }: VideoGridProps) {
  const laptopTrack = localLaptop?.getVideoTracks()[0];
  const mobileTrack = localMobile?.getVideoTracks()[0];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Local feeds */}
      <VideoTile
        stream={localLaptop}
        pc={localLaptopPC}
        track={laptopTrack}
        label="Your Laptop"
        className="p-2 mx-auto"
        isLocal={true}
      />
      <VideoTile
        stream={localMobile}
        pc={localMobilePC}
        track={mobileTrack}
        label="User A Mobile"
        className="p-2 mx-auto"
      />

      {/* Remote peers */}
      {Object.entries(remotes).map(([peerId, streams]) => (
        <React.Fragment key={peerId}>
          <VideoTile
            stream={streams.laptop?.stream}
            pc={streams.laptop?.pc}
            label={`${peerId} Laptop`}
            className="p-2 mx-auto"
          />
          <VideoTile stream={streams.mobile} label={`${peerId} Mobile`} className="p-2 mx-auto" />
        </React.Fragment>
      ))}
    </div>
  );
}
