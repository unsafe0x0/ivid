import { memo } from "react";
import { formatTime } from "../utils/time";

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
}

export const TimeDisplay = memo(function TimeDisplay({
  currentTime,
  duration,
}: TimeDisplayProps) {
  return (
    <div className="time-display">
      {formatTime(currentTime)} <span className="time-separator">/</span>{" "}
      {formatTime(duration)}
    </div>
  );
});
