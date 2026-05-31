import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { MdPlayArrow, MdClose, MdDragIndicator } from "react-icons/md";
import type { PlaylistItem } from "../types";

interface QueuePanelProps {
  playlist: PlaylistItem[];
  currentIndex: number;
  hidden: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

export const QueuePanel = memo(function QueuePanel({
  playlist,
  currentIndex,
  hidden,
  onSelect,
  onRemove,
}: QueuePanelProps) {
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentPos = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePanelMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsPanelDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.current.x,
      initialY: currentPos.current.y,
    };
  }, []);

  useEffect(() => {
    if (!isPanelDragging) return;
    const handleMove = (e: MouseEvent) => {
      currentPos.current = {
        x: dragRef.current.initialX + e.clientX - dragRef.current.startX,
        y: dragRef.current.initialY + e.clientY - dragRef.current.startY,
      };
      if (wrapperRef.current)
        wrapperRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
    };
    const handleUp = () => setIsPanelDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isPanelDragging]);

  if (playlist.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className={`queue-wrapper ${hidden ? "hidden" : ""}`}
      style={{
        transform: `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`,
      }}
    >
      <div className="queue-panel">
        <div
          className="queue-header"
          onMouseDown={handlePanelMouseDown}
          style={{ cursor: isPanelDragging ? "grabbing" : "grab" }}
        >
          <MdDragIndicator size={16} style={{ opacity: 0.5 }} />
          <span>Now Playing & Up Next</span>
        </div>
        <div className="queue-list">
          {playlist.map((file, i) => (
            <div
              key={file.id}
              className={`queue-item ${i === currentIndex ? "active" : ""}`}
            >
              <button className="queue-play-btn" onClick={() => onSelect(i)}>
                <MdPlayArrow size={18} />
              </button>
              <div className="queue-title" title={file.name}>
                {file.name}
              </div>
              <button className="queue-remove-btn" onClick={() => onRemove(i)}>
                <MdClose size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
