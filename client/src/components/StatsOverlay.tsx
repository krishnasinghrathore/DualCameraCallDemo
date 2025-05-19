// components/StatsOverlay.tsx
import React from 'react';

interface Props {
  rtt: number;
  bitrate: number;
  packetLoss: number;
  label: string;
}

export default function StatsOverlay({ rtt, bitrate, packetLoss, label }: Props) {
  return (
    <div className=" bottom-0 left-0 flex justify-between w-full bg-black bg-opacity-50 p-1 text-xs text-white">
      <span>
        RTT: {Math.round(rtt)}ms | Bitrate: {Math.round(bitrate)}kbps | Loss: {Math.round(packetLoss)}%
      </span>
      <span>{label}</span>
    </div>
  );
}
