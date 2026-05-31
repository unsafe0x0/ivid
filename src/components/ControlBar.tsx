import React, { memo, useRef } from "react";
import { SpeedDropdown } from "./SpeedDropdown";
import { QualityDropdown } from "./QualityDropdown";
import type { Quality } from "./QualityDropdown";
import { VolumeControl } from "./VolumeControl";
import { TimeDisplay } from "./TimeDisplay";
import {
  MdPlayArrow,
  MdPause,
  MdReplay10,
  MdForward10,
  MdFullscreen,
  MdFullscreenExit,
  MdPhotoCamera,
  MdSettings,
  MdPlaylistPlay,
  MdSkipNext,
  MdSkipPrevious,
  MdSubtitles,
  MdColorLens,
} from "react-icons/md";

interface ControlBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isDraggingVolume: boolean;
  volumeRef: React.RefObject<HTMLDivElement | null>;
  speed: number;
  showSpeedMenu: boolean;
  quality: Quality;
  showQualityMenu: boolean;
  isLocalSource: boolean;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onSkipTime: (amount: number) => void;
  onToggleMute: () => void;
  onVolumeDragStart: (e: React.MouseEvent) => void;
  onToggleSpeedMenu: () => void;
  onCloseSpeedMenu: () => void;
  onChangeSpeed: (s: number) => void;
  onToggleQualityMenu: () => void;
  onCloseQualityMenu: () => void;
  onChangeQuality: (q: Quality) => void;
  onToggleFullscreen: () => void;
  onScreenshot: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  showQueue: boolean;
  onToggleQueue: () => void;
  onNextVideo: () => void;
  onPreviousVideo: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  subtitlesActive: boolean;
  hasSubtitles: boolean;
  onToggleSubtitles: () => void;
  onSubtitleFileSelected: (text: string, filename: string) => void;
  onToggleThemePicker: () => void;
  showThemePicker: boolean;
  loopActive: boolean;
}

export const ControlBar = memo(function ControlBar({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isDraggingVolume,
  volumeRef,
  speed,
  showSpeedMenu,
  quality,
  showQualityMenu,
  isLocalSource,
  isFullscreen,
  onTogglePlay,
  onSkipTime,
  onToggleMute,
  onVolumeDragStart,
  onToggleSpeedMenu,
  onCloseSpeedMenu,
  onChangeSpeed,
  onToggleQualityMenu,
  onCloseQualityMenu,
  onChangeQuality,
  onToggleFullscreen,
  onScreenshot,
  showSettings,
  onToggleSettings,
  showQueue,
  onToggleQueue,
  onNextVideo,
  onPreviousVideo,
  hasNext,
  hasPrevious,
  subtitlesActive,
  hasSubtitles,
  onToggleSubtitles,
  onSubtitleFileSelected,
  onToggleThemePicker,
  showThemePicker,
  loopActive,
}: ControlBarProps) {
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleSubtitleClick = () => {
    if (hasSubtitles) {
      onToggleSubtitles();
    } else {
      subtitleInputRef.current?.click();
    }
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSubtitleFileSelected(reader.result, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="control-bar">
      <div className="left-group">
        <button
          className={`control-btn ${!hasPrevious ? "disabled" : ""}`}
          onClick={onPreviousVideo}
          title="Previous Video"
          disabled={!hasPrevious}
        >
          <MdSkipPrevious size={26} />
        </button>
        <button
          className="control-btn"
          onClick={() => onSkipTime(-10)}
          title="Skip Backward 10s"
        >
          <MdReplay10 size={24} />
        </button>
        <button
          className="control-btn play-btn"
          onClick={onTogglePlay}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={28} />}
        </button>
        <button
          className="control-btn"
          onClick={() => onSkipTime(10)}
          title="Skip Forward 10s"
        >
          <MdForward10 size={24} />
        </button>
        <button
          className={`control-btn ${!hasNext ? "disabled" : ""}`}
          onClick={onNextVideo}
          title="Next Video"
          disabled={!hasNext}
        >
          <MdSkipNext size={26} />
        </button>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          isDragging={isDraggingVolume}
          volumeRef={volumeRef}
          onToggleMute={onToggleMute}
          onDragStart={onVolumeDragStart}
        />

        <TimeDisplay currentTime={currentTime} duration={duration} />
        {loopActive && <span className="loop-badge">A⇄B</span>}
      </div>

      <div className="right-group">
        <SpeedDropdown
          speed={speed}
          showMenu={showSpeedMenu}
          onToggleMenu={onToggleSpeedMenu}
          onCloseMenu={onCloseSpeedMenu}
          onChangeSpeed={onChangeSpeed}
        />
        <QualityDropdown
          quality={quality}
          showMenu={showQualityMenu}
          isLocal={isLocalSource}
          onToggleMenu={onToggleQualityMenu}
          onCloseMenu={onCloseQualityMenu}
          onChangeQuality={onChangeQuality}
        />

        <button
          className="control-btn"
          onClick={onScreenshot}
          title="Screenshot (S)"
        >
          <MdPhotoCamera size={22} />
        </button>

        <button
          className={`control-btn ${subtitlesActive ? "active-icon" : ""}`}
          onClick={handleSubtitleClick}
          title={hasSubtitles ? "Toggle Subtitles (C)" : "Load Subtitles (C)"}
        >
          <MdSubtitles size={22} />
        </button>
        <input
          ref={subtitleInputRef}
          type="file"
          accept=".srt,.vtt"
          onChange={handleSubtitleChange}
          style={{ display: "none" }}
        />

        <button
          className={`control-btn ${showSettings ? "active-icon" : ""}`}
          onClick={onToggleSettings}
          title="Video Adjustments"
        >
          <MdSettings size={22} />
        </button>
        <button
          className={`control-btn ${showQueue ? "active-icon" : ""}`}
          onClick={onToggleQueue}
          title="Queue / Playlist"
        >
          <MdPlaylistPlay size={26} />
        </button>
        <button
          className={`control-btn ${showThemePicker ? "active-icon" : ""}`}
          onClick={onToggleThemePicker}
          title="Accent Color"
        >
          <MdColorLens size={22} />
        </button>

        <button
          className="control-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? (
            <MdFullscreenExit size={24} />
          ) : (
            <MdFullscreen size={24} />
          )}
        </button>
      </div>
    </div>
  );
});
