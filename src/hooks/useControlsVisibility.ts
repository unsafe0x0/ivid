import { useState, useEffect, useCallback, useRef } from "react";

export function useControlsVisibility(
  isPlaying: boolean,
  isDraggingTimeline: boolean,
  isDraggingVolume: boolean,
  showSpeedMenu: boolean,
  showSettings: boolean,
  showQualityMenu: boolean,
  showQueue: boolean,
  showThemePicker: boolean,
) {
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowControls(true);
    if (
      isPlaying &&
      !isDraggingTimeline &&
      !isDraggingVolume &&
      !showSpeedMenu &&
      !showSettings &&
      !showQualityMenu &&
      !showQueue &&
      !showThemePicker
    ) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [
    isPlaying,
    isDraggingTimeline,
    isDraggingVolume,
    showSpeedMenu,
    showSettings,
    showQualityMenu,
    showQueue,
    showThemePicker,
  ]);

  const handleMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetHideTimer]);

  return { showControls, handleMouseMove };
}
