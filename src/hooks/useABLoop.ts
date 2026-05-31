import { useCallback, useRef, useState } from "react";

export function useABLoop(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  currentTime: number,
) {
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const isActive = loopStart !== null && loopEnd !== null;

  const lastEnforce = useRef(0);
  if (isActive && videoRef.current) {
    if (currentTime >= loopEnd && currentTime - lastEnforce.current > 0.1) {
      videoRef.current.currentTime = loopStart;
      lastEnforce.current = currentTime;
    }
  }

  const markStart = useCallback(() => {
    if (videoRef.current) setLoopStart(videoRef.current.currentTime);
  }, [videoRef]);

  const markEnd = useCallback(() => {
    if (videoRef.current) setLoopEnd(videoRef.current.currentTime);
  }, [videoRef]);

  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
  }, []);

  return { loopStart, loopEnd, isActive, markStart, markEnd, clearLoop };
}
