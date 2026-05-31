import { memo, useMemo } from "react";
import type { SubtitleCue } from "../types";

interface SubtitleOverlayProps {
  cues: SubtitleCue[];
  currentTime: number;
  hidden: boolean;
}

export const SubtitleOverlay = memo(function SubtitleOverlay({
  cues,
  currentTime,
  hidden,
}: SubtitleOverlayProps) {
  const activeCue = useMemo(
    () => cues.find((c) => currentTime >= c.start && currentTime <= c.end),
    [cues, currentTime],
  );

  if (hidden || !activeCue) return null;

  return (
    <div className="subtitle-overlay">
      <span className="subtitle-text">{activeCue.text}</span>
    </div>
  );
});
