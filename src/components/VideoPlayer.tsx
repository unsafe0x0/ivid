import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Timeline } from "./Timeline";
import { ControlBar } from "./ControlBar";

import { QueuePanel } from "./QueuePanel";
import { FilterPanel } from "./FilterPanel";
import { ShortcutsModal } from "./ShortcutsModal";
import { SubtitleOverlay } from "./SubtitleOverlay";
import type { Quality } from "./QualityDropdown";
import type { SubtitleCue } from "../types";
import { parseSubtitleFile } from "../utils/subtitles";
import { useFilters } from "../hooks/useFilters";
import { useAudioProcessing } from "../hooks/useAudioProcessing";
import { usePlaylist } from "../hooks/usePlaylist";
import { useDragDrop } from "../hooks/useDragDrop";
import { useControlsVisibility } from "../hooks/useControlsVisibility";
import { useABLoop } from "../hooks/useABLoop";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTouchGestures } from "../hooks/useTouchGestures";

const ACCENT_PRESETS = [
  "#ffffff",
  "#ff6b6b",
  "#ffa94d",
  "#51cf66",
  "#339af0",
  "#cc5de8",
  "#ffd43b",
];

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLCanvasElement>(null);
  const ambientFrameId = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  // Persisted preferences
  const [storedVolume, setStoredVolume] = useLocalStorage("ivid-volume", 0.7);
  const [storedSpeed, setStoredSpeed] = useLocalStorage("ivid-speed", 1);
  const [accentColor, setAccentColor] = useLocalStorage(
    "ivid-accent",
    "#ffffff",
  );

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(storedVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [speed, setSpeed] = useState(storedSpeed);
  const [quality, setQuality] = useState<Quality>("1080p");

  // UI state
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Subtitles
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [subtitlesVisible, setSubtitlesVisible] = useState(true);

  // Hooks
  const filters = useFilters();
  const audio = useAudioProcessing();
  const playlist = usePlaylist(videoRef);
  const dragDrop = useDragDrop(playlist.addItems);
  const abLoop = useABLoop(videoRef, currentTime);

  const { showControls, handleMouseMove } = useControlsVisibility(
    isPlaying,
    isDraggingTimeline,
    isDraggingVolume,
    showSpeedMenu,
    showSettings,
    showQualityMenu,
    showQueue,
    showThemePicker,
  );

  // Refs for stable keyboard callbacks
  const isPlayingRef = useRef(isPlaying);
  const volumeRef2 = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const durationRef = useRef(duration);
  const speedRef = useRef(speed);
  isPlayingRef.current = isPlaying;
  volumeRef2.current = volume;
  isMutedRef.current = isMuted;
  durationRef.current = duration;
  speedRef.current = speed;

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (!audio.isReady()) audio.setup(videoRef.current);
    else audio.resume();
    if (isPlayingRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [audio]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const willMute = !isMutedRef.current;
    videoRef.current.muted = willMute;
    setIsMuted(willMute);
    if (!willMute && volumeRef2.current === 0) {
      setVolume(0.7);
      videoRef.current.volume = 0.7;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement)
        await containerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  }, []);

  const skipTime = useCallback((amount: number) => {
    if (!videoRef.current) return;
    const t = Math.max(
      0,
      Math.min(videoRef.current.currentTime + amount, durationRef.current),
    );
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const stepFrame = useCallback((dir: 1 | -1) => {
    if (!videoRef.current) return;
    if (isPlayingRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    const t = Math.max(
      0,
      Math.min(
        videoRef.current.currentTime + (1 / 30) * dir,
        durationRef.current,
      ),
    );
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const handleTimelineUpdate = useCallback((clientX: number) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = pct * durationRef.current;
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const handleVolumeUpdate = useCallback(
    (clientX: number) => {
      if (!volumeRef.current || !videoRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setVolume(pct);
      setStoredVolume(pct);
      videoRef.current.volume = pct;
      if (pct > 0 && isMutedRef.current) {
        setIsMuted(false);
        videoRef.current.muted = false;
      } else if (pct === 0 && !isMutedRef.current) {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    },
    [setStoredVolume],
  );

  const filterStringRef = useRef(filters.filterString);
  filterStringRef.current = filters.filterString;

  const handleScreenshot = useCallback(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 1920;
    c.height = v.videoHeight || 1080;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.filter = filterStringRef.current;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = `screenshot_${v.currentTime.toFixed(2)}s.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, []);

  const handleSubtitleLoaded = useCallback((text: string, filename: string) => {
    setSubtitleCues(parseSubtitleFile(text, filename));
    setSubtitlesVisible(true);
  }, []);

  const closeMenusExcept = useCallback((keep?: string) => {
    if (keep !== "speed") setShowSpeedMenu(false);
    if (keep !== "quality") setShowQualityMenu(false);
    if (keep !== "settings") setShowSettings(false);
    if (keep !== "queue") setShowQueue(false);
    if (keep !== "theme") setShowThemePicker(false);
  }, []);

  // Electron IPC Listeners
  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.require) {
      // @ts-ignore
      const { ipcRenderer } = window.require("electron");
      // @ts-ignore
      const fs = window.require("fs");
      // @ts-ignore
      const pathModule = window.require("path");
      // @ts-ignore
      const urlModule = window.require("url");

      const handleOpenFiles = (_event: any, paths: string[]) => {
        const items = paths.map((p) => ({
          id: Math.random().toString(36).substring(2, 10),
          name: p.split(/[\\/]/).pop() || "Video",
          source: urlModule.pathToFileURL(p).href,
        }));
        playlist.addItems(items);
      };

      const handleOpenFolder = (_event: any, folderPath: string) => {
        try {
          const files = fs.readdirSync(folderPath);
          const videoFiles = files.filter((f: string) =>
            /\.(mp4|mkv|webm|avi|mov)$/i.test(f),
          );
          const items = videoFiles.map((f: string) => ({
            id: Math.random().toString(36).substring(2, 10),
            name: f,
            source: urlModule.pathToFileURL(pathModule.join(folderPath, f))
              .href,
          }));
          if (items.length > 0) playlist.addItems(items);
        } catch (err) {
          console.error("Error reading folder", err);
        }
      };

      ipcRenderer.on("open-files", handleOpenFiles);
      ipcRenderer.on("open-folder", handleOpenFolder);

      // Check for files passed via command line (Open With...)
      ipcRenderer.invoke("get-initial-files").then((paths: string[]) => {
        if (paths && paths.length > 0) {
          handleOpenFiles(null, paths);
        }
      });

      return () => {
        ipcRenderer.removeListener("open-files", handleOpenFiles);
        ipcRenderer.removeListener("open-folder", handleOpenFolder);
      };
    }
  }, [playlist.addItems]);

  // Fullscreen listener
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Keyboard shortcuts — uses refs, no stale closures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "s":
          e.preventDefault();
          handleScreenshot();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;

        case "c":
          e.preventDefault();
          setSubtitlesVisible((v) => !v);
          break;
        case "arrowleft":
          e.preventDefault();
          skipTime(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skipTime(10);
          break;
        case "arrowup":
          e.preventDefault();
          if (videoRef.current) {
            const nv = Math.min(1, volumeRef2.current + 0.1);
            setVolume(nv);
            setStoredVolume(nv);
            videoRef.current.volume = nv;
            if (nv > 0 && isMutedRef.current) setIsMuted(false);
          }
          break;
        case "arrowdown":
          e.preventDefault();
          if (videoRef.current) {
            const nv = Math.max(0, volumeRef2.current - 0.1);
            setVolume(nv);
            setStoredVolume(nv);
            videoRef.current.volume = nv;
            if (nv === 0 && !isMutedRef.current) setIsMuted(true);
          }
          break;
        case ",":
          e.preventDefault();
          stepFrame(-1);
          break;
        case ".":
          e.preventDefault();
          stepFrame(1);
          break;
        case "i":
          e.preventDefault();
          abLoop.markStart();
          break;
        case "o":
          e.preventDefault();
          abLoop.markEnd();
          break;
        case "backspace":
          e.preventDefault();
          abLoop.clearLoop();
          break;
        case "?":
        case "/":
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcuts((p) => !p);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    toggleFullscreen,
    toggleMute,

    handleScreenshot,
    skipTime,
    stepFrame,
    abLoop,
    setStoredVolume,
  ]);

  // Mouse drag for timeline/volume
  useEffect(() => {
    if (!isDraggingTimeline && !isDraggingVolume) return;
    const onMove = (e: MouseEvent) => {
      if (isDraggingTimeline) handleTimelineUpdate(e.clientX);
      if (isDraggingVolume) handleVolumeUpdate(e.clientX);
    };
    const onUp = () => {
      setIsDraggingTimeline(false);
      setIsDraggingVolume(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    isDraggingTimeline,
    isDraggingVolume,
    handleTimelineUpdate,
    handleVolumeUpdate,
  ]);

  // Ambient glow — single rAF loop, properly guarded
  useEffect(() => {
    if (!isPlaying) {
      if (ambientFrameId.current !== null) {
        cancelAnimationFrame(ambientFrameId.current);
        ambientFrameId.current = null;
      }
      return;
    }
    const render = () => {
      frameCountRef.current++;
      if (
        frameCountRef.current % 4 === 0 &&
        videoRef.current &&
        ambientRef.current &&
        !videoRef.current.paused
      ) {
        const ctx = ambientRef.current.getContext("2d");
        if (ctx)
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            ambientRef.current.width,
            ambientRef.current.height,
          );
      }
      ambientFrameId.current = requestAnimationFrame(render);
    };
    ambientFrameId.current = requestAnimationFrame(render);
    return () => {
      if (ambientFrameId.current !== null) {
        cancelAnimationFrame(ambientFrameId.current);
        ambientFrameId.current = null;
      }
    };
  }, [isPlaying]);

  // Touch gestures
  const touchHandlers = useMemo(
    () => ({
      onSeek: (d: number) => skipTime(d),
      onVolumeChange: (d: number) => {
        if (!videoRef.current) return;
        const nv = Math.max(0, Math.min(1, volumeRef2.current + d));
        setVolume(nv);
        setStoredVolume(nv);
        videoRef.current.volume = nv;
      },
      onDoubleTapLeft: () => skipTime(-10),
      onDoubleTapRight: () => skipTime(10),
      onSingleTap: () => togglePlay(),
    }),
    [skipTime, togglePlay, setStoredVolume],
  );

  const touch = useTouchGestures(containerRef, touchHandlers);

  const handleVideoProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0)
      setBuffered(
        videoRef.current.buffered.end(videoRef.current.buffered.length - 1),
      );
  }, []);

  // Apply accent color CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", accentColor);
  }, [accentColor]);

  const handleTimelineDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDraggingTimeline(true);
      handleTimelineUpdate(e.clientX);
    },
    [handleTimelineUpdate],
  );
  const handleVolumeDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDraggingVolume(true);
      handleVolumeUpdate(e.clientX);
    },
    [handleVolumeUpdate],
  );
  const handleToggleSpeedMenu = useCallback(() => {
    setShowSpeedMenu((v) => !v);
    closeMenusExcept("speed");
  }, [closeMenusExcept]);
  const handleCloseSpeedMenu = useCallback(() => setShowSpeedMenu(false), []);
  const handleChangeSpeed = useCallback(
    (s: number) => {
      setSpeed(s);
      setStoredSpeed(s);
      if (videoRef.current) videoRef.current.playbackRate = s;
      setShowSpeedMenu(false);
    },
    [setStoredSpeed],
  );
  const handleToggleQualityMenu = useCallback(() => {
    setShowQualityMenu((v) => !v);
    closeMenusExcept("quality");
  }, [closeMenusExcept]);
  const handleCloseQualityMenu = useCallback(
    () => setShowQualityMenu(false),
    [],
  );
  const handleChangeQuality = useCallback((q: Quality) => {
    setQuality(q);
    setShowQualityMenu(false);
  }, []);
  const handleToggleSettings = useCallback(() => {
    setShowSettings((v) => !v);
    closeMenusExcept("settings");
  }, [closeMenusExcept]);
  const handleToggleQueue = useCallback(() => {
    setShowQueue((v) => !v);
    closeMenusExcept("queue");
  }, [closeMenusExcept]);
  const handleToggleSubtitles = useCallback(
    () => setSubtitlesVisible((v) => !v),
    [],
  );
  const handleToggleThemePicker = useCallback(() => {
    setShowThemePicker((v) => !v);
    closeMenusExcept("theme");
  }, [closeMenusExcept]);
  const handleResetFilters = useCallback(() => {
    filters.reset();
    audio.reset();
  }, [filters, audio]);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), []);

  return (
    <div
      className={`player-container ${!showControls ? "hide-cursor" : ""}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
      onDragEnter={dragDrop.handleDragEnter}
      onDragLeave={dragDrop.handleDragLeave}
      onDragOver={dragDrop.handleDragOver}
      onDrop={dragDrop.handleDrop}
      onTouchStart={touch.handleTouchStart}
      onTouchMove={touch.handleTouchMove}
      onTouchEnd={touch.handleTouchEnd}
    >
      {dragDrop.isDragging && (
        <div className="drag-overlay">
          <h2>Drop videos or folders here to play</h2>
        </div>
      )}

      {playlist.currentUrl && (
        <canvas
          ref={ambientRef}
          width={128}
          height={72}
          className="ambient-glow"
          style={{
            filter: `blur(120px) saturate(1.3) ${filters.filterString}`,
          }}
        />
      )}

      {filters.sharpness > 0 && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id="sharpness-filter">
            <feConvolveMatrix
              order="3 3"
              preserveAlpha="true"
              kernelMatrix={`0 -1 0 -1 ${filters.sharpnessX} -1 0 -1 0`}
              divisor={filters.sharpnessX - 4}
            />
          </filter>
        </svg>
      )}

      <video
        ref={videoRef}
        className="video"
        style={{ filter: filters.filterString }}
        onTimeUpdate={() => {
          if (!isDraggingTimeline) {
            setCurrentTime(videoRef.current?.currentTime || 0);
            handleVideoProgress();
          }
        }}
        onLoadedMetadata={(e) => {
          const vid = e.currentTarget;
          setDuration(vid.duration);
          if (videoRef.current)
            videoRef.current.playbackRate = speedRef.current;
          const h = vid.videoHeight;
          if (h >= 2160) setQuality("4K");
          else if (h >= 1080) setQuality("1080p");
          else if (h >= 720) setQuality("720p");
          else if (h >= 480) setQuality("480p");
          else setQuality("360p");

          if (videoRef.current) videoRef.current.volume = volumeRef2.current;
        }}
        onEnded={() => {
          if (playlist.hasNext) playlist.advanceToNext();
          else setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={() => {
          if (showSettings || showSpeedMenu || showQueue || showThemePicker)
            closeMenusExcept();
          else togglePlay();
        }}
      />

      <SubtitleOverlay
        cues={subtitleCues}
        currentTime={currentTime}
        hidden={!subtitlesVisible}
      />

      <div
        className={`controls-pill ${showControls || isDraggingTimeline || isDraggingVolume ? "visible" : "hidden"}`}
      >
        <Timeline
          duration={duration}
          currentTime={currentTime}
          buffered={buffered}
          isDragging={isDraggingTimeline}
          progressRef={progressRef}
          previewUrl={playlist.currentUrl}
          filterString={filters.filterString}
          loopStart={abLoop.loopStart}
          loopEnd={abLoop.loopEnd}
          accentColor={accentColor}
          onDragStart={handleTimelineDragStart}
        />

        <ControlBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isDraggingVolume={isDraggingVolume}
          volumeRef={volumeRef}
          speed={speed}
          showSpeedMenu={showSpeedMenu}
          quality={quality}
          showQualityMenu={showQualityMenu}
          isLocalSource={true}
          isFullscreen={isFullscreen}
          onTogglePlay={togglePlay}
          onSkipTime={skipTime}
          onToggleMute={toggleMute}
          onVolumeDragStart={handleVolumeDragStart}
          onToggleSpeedMenu={handleToggleSpeedMenu}
          onCloseSpeedMenu={handleCloseSpeedMenu}
          onChangeSpeed={handleChangeSpeed}
          onToggleQualityMenu={handleToggleQualityMenu}
          onCloseQualityMenu={handleCloseQualityMenu}
          onChangeQuality={handleChangeQuality}
          onToggleFullscreen={toggleFullscreen}
          onScreenshot={handleScreenshot}
          onToggleSettings={handleToggleSettings}
          showSettings={showSettings}
          showQueue={showQueue}
          onToggleQueue={handleToggleQueue}
          onNextVideo={playlist.playNext}
          onPreviousVideo={playlist.playPrevious}
          hasNext={playlist.hasNext}
          hasPrevious={playlist.hasPrevious}
          subtitlesActive={subtitlesVisible && subtitleCues.length > 0}
          hasSubtitles={subtitleCues.length > 0}
          onToggleSubtitles={handleToggleSubtitles}
          onSubtitleFileSelected={handleSubtitleLoaded}
          onToggleThemePicker={handleToggleThemePicker}
          showThemePicker={showThemePicker}
          loopActive={abLoop.isActive}
        />
      </div>

      {showThemePicker && showControls && (
        <div className="theme-picker">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              className={`theme-swatch ${accentColor === color ? "active" : ""}`}
              style={{ background: color }}
              onClick={() => setAccentColor(color)}
            />
          ))}
        </div>
      )}

      <FilterPanel
        hidden={!showSettings || !showControls}
        brightness={filters.brightness}
        contrast={filters.contrast}
        saturation={filters.saturation}
        hue={filters.hue}
        sepia={filters.sepia}
        sharpness={filters.sharpness}
        exposure={filters.exposure}
        bass={audio.bass}
        treble={audio.treble}
        audioBoost={audio.audioBoost}
        onVideoChange={filters.setFilter}
        onAudioChange={audio.setAudioFilter}
        onReset={handleResetFilters}
        onClose={handleCloseSettings}
        accentColor={accentColor}
      />

      <ShortcutsModal hidden={!showShortcuts} onClose={handleCloseShortcuts} />

      <QueuePanel
        playlist={playlist.playlist}
        currentIndex={playlist.currentIndex}
        hidden={!showQueue || !showControls}
        onSelect={playlist.selectItem}
        onRemove={playlist.removeItem}
      />
    </div>
  );
}
