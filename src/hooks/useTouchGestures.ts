import { useRef, useCallback, useMemo } from "react";

interface TouchHandlers {
  onSeek: (delta: number) => void;
  onVolumeChange: (delta: number) => void;
  onDoubleTapLeft: () => void;
  onDoubleTapRight: () => void;
  onSingleTap: () => void;
}

export function useTouchGestures(
  containerRef: React.RefObject<HTMLDivElement | null>,
  handlers: TouchHandlers,
) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const lastTap = useRef<{ x: number; time: number }>({ x: 0, time: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !containerRef.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        handlers.onSeek(dx > 0 ? 5 : -5);
        touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
        handlers.onVolumeChange(dy < 0 ? 0.05 : -0.05);
        touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      }
    },
    [containerRef, handlers],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !containerRef.current) return;
      const elapsed = Date.now() - touchStart.current.time;
      const changedTouch = e.changedTouches[0];

      if (elapsed < 300) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap.current.time;
        const distFromLastTap = Math.abs(
          changedTouch.clientX - lastTap.current.x,
        );

        if (timeSinceLastTap < 300 && distFromLastTap < 50) {
          const rect = containerRef.current.getBoundingClientRect();
          const relativeX = changedTouch.clientX - rect.left;
          if (relativeX < rect.width / 3) handlers.onDoubleTapLeft();
          else if (relativeX > (rect.width * 2) / 3)
            handlers.onDoubleTapRight();
          lastTap.current = { x: 0, time: 0 };
        } else {
          lastTap.current = { x: changedTouch.clientX, time: now };
          setTimeout(() => {
            if (Date.now() - lastTap.current.time >= 280)
              handlers.onSingleTap();
          }, 300);
        }
      }
      touchStart.current = null;
    },
    [containerRef, handlers],
  );

  return useMemo(
    () => ({ handleTouchStart, handleTouchMove, handleTouchEnd }),
    [handleTouchStart, handleTouchMove, handleTouchEnd],
  );
}
