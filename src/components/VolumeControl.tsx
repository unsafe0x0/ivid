import React, { memo } from "react";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  isDragging: boolean;
  volumeRef: React.RefObject<HTMLDivElement | null>;
  onToggleMute: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export const VolumeControl = memo(function VolumeControl({
  volume,
  isMuted,
  isDragging,
  volumeRef,
  onToggleMute,
  onDragStart,
}: VolumeControlProps) {
  return (
    <div className="volume-container">
      <button
        className="control-btn"
        onClick={onToggleMute}
        title={isMuted || volume === 0 ? "Unmute (M)" : "Mute (M)"}
      >
        {isMuted || volume === 0 ? (
          <MdVolumeOff size={22} />
        ) : (
          <MdVolumeUp size={22} />
        )}
      </button>
      <div
        className={`custom-volume-slider ${isDragging ? "active" : ""}`}
        ref={volumeRef}
        onMouseDown={onDragStart}
      >
        <div
          className="volume-fill"
          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
        ></div>
        <div
          className={`volume-handle ${isDragging ? "active" : ""}`}
          style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
        ></div>
      </div>
    </div>
  );
});
