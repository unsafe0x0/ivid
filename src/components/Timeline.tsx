import { memo, useState, useRef, useCallback } from "react";
import { formatTime } from "../utils/time";

interface TimelineProps {
  duration: number;
  currentTime: number;
  buffered: number;
  isDragging: boolean;
  progressRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (e: React.MouseEvent) => void;
  previewUrl: string | null;
  filterString?: string;
  loopStart: number | null;
  loopEnd: number | null;
  accentColor: string;
}

export const Timeline = memo(function Timeline({
  duration,
  currentTime,
  buffered,
  isDragging,
  progressRef,
  onDragStart,
  previewUrl,
  filterString,
  loopStart,
  loopEnd,
  accentColor,
}: TimelineProps) {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number>(0);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const lastSeekTime = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      const time = percent * duration;

      setHoverX(e.clientX - rect.left);
      setHoverTime(time);

      if (
        previewVideoRef.current &&
        previewUrl &&
        Math.abs(time - lastSeekTime.current) > 0.5
      ) {
        previewVideoRef.current.currentTime = time;
        lastSeekTime.current = time;
      }
    },
    [progressRef, duration, previewUrl],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      className="timeline-wrapper"
      ref={progressRef}
      onMouseDown={onDragStart}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {loopStart !== null && loopEnd !== null && duration > 0 && (
        <div
          className="loop-region"
          style={{
            left: `${(loopStart / duration) * 100}%`,
            width: `${((loopEnd - loopStart) / duration) * 100}%`,
            background: `${accentColor}20`,
            borderColor: accentColor,
          }}
        />
      )}
      {loopStart !== null && duration > 0 && (
        <div
          className="loop-marker loop-marker-start"
          style={{
            left: `${(loopStart / duration) * 100}%`,
            background: accentColor,
          }}
        />
      )}
      {loopEnd !== null && duration > 0 && (
        <div
          className="loop-marker loop-marker-end"
          style={{
            left: `${(loopEnd / duration) * 100}%`,
            background: accentColor,
          }}
        />
      )}

      <div
        className={`timeline-preview-bubble ${hoverX !== null ? "visible" : ""}`}
        style={{ left: hoverX ?? 0 }}
      >
        {previewUrl && (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            className="preview-video-element"
            muted
            playsInline
            preload="auto"
            style={{ filter: filterString }}
          />
        )}
        <span className="preview-time-text">{formatTime(hoverTime)}</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-buffered"
          style={{ width: `${bufferedPercent}%` }}
        ></div>
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%`, background: accentColor }}
        ></div>
        <div
          className={`progress-handle ${isDragging ? "active" : ""}`}
          style={{ left: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
});
