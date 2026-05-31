import { useState, useCallback, useEffect, useRef } from "react";
import type { PlaylistItem } from "../types";

export function usePlaylist(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const currentLoadedId = useRef<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokePreviousBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Load video when playlist/index changes
  useEffect(() => {
    const itemToLoad = playlist[currentIndex];
    if (itemToLoad && itemToLoad.id !== currentLoadedId.current) {
      if (videoRef.current) {
        revokePreviousBlob();
        let url = "";
        if (typeof itemToLoad.source === "string") {
          url = itemToLoad.source;
        } else {
          url = URL.createObjectURL(itemToLoad.source);
          blobUrlRef.current = url;
        }
        videoRef.current.src = url;
        videoRef.current.muted = false;
        setCurrentUrl(url);
        videoRef.current.play().catch(() => {});
        currentLoadedId.current = itemToLoad.id;
      }
    } else if (playlist.length === 0) {
      revokePreviousBlob();
      if (videoRef.current) {
        videoRef.current.src = "";
        setCurrentUrl(null);
      }
      currentLoadedId.current = null;
    }
  }, [playlist, currentIndex, videoRef, revokePreviousBlob]);

  // Cleanup on unmount
  useEffect(() => () => revokePreviousBlob(), [revokePreviousBlob]);

  const hasNext = currentIndex < playlist.length - 1;
  const hasPrevious = currentIndex > 0;

  const addItems = useCallback((items: PlaylistItem[]) => {
    setPlaylist((prev) => {
      const next = [...prev, ...items];
      if (prev.length === 0) setCurrentIndex(0);
      return next;
    });
  }, []);

  const selectItem = useCallback((index: number) => setCurrentIndex(index), []);

  const removeItem = useCallback((index: number) => {
    setPlaylist((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      setCurrentIndex((curr) => {
        if (next.length === 0) return -1;
        if (index <= curr) return Math.max(0, curr - 1);
        return curr;
      });
      return next;
    });
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, playlist.length]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const advanceToNext = playNext;

  return {
    playlist,
    currentIndex,
    currentUrl,

    hasNext,
    hasPrevious,
    addItems,
    selectItem,
    removeItem,
    playNext,
    playPrevious,
    advanceToNext,
  };
}
