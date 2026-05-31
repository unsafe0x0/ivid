import { memo, useState } from "react";
import { MdClose, MdRefresh } from "react-icons/md";
import type { VideoFilterType, AudioFilterType } from "../types";

interface FilterPanelProps {
  hidden: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number;
  sharpness: number;
  exposure: number;
  bass: number;
  treble: number;
  audioBoost: number;
  onVideoChange: (type: VideoFilterType, value: number) => void;
  onAudioChange: (type: AudioFilterType, value: number) => void;
  onReset: () => void;
  onClose: () => void;
  accentColor: string;
}

export const FilterPanel = memo(function FilterPanel({
  hidden,
  brightness,
  contrast,
  saturation,
  hue,
  sepia,
  sharpness,
  exposure,
  bass,
  treble,
  audioBoost,
  onVideoChange,
  onAudioChange,
  onReset,
  onClose,
  accentColor,
}: FilterPanelProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");

  return (
    <div className={`filter-panel ${hidden ? "hidden" : ""}`}>
      <div className="filter-header">
        <h3>Adjustments</h3>
        <div className="filter-actions">
          <button onClick={onReset} title="Reset">
            <MdRefresh size={18} />
          </button>
          <button onClick={onClose}>
            <MdClose size={18} />
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={activeTab === "video" ? "active" : ""}
          onClick={() => setActiveTab("video")}
        >
          Video
        </button>
        <button
          className={activeTab === "audio" ? "active" : ""}
          onClick={() => setActiveTab("audio")}
        >
          Audio
        </button>
      </div>

      {activeTab === "video" && (
        <div className="filter-tab-content">
          <Slider
            label="Exposure"
            value={exposure}
            unit="%"
            min={0}
            max={200}
            accent={accentColor}
            onChange={(v) => onVideoChange("exposure", v)}
          />
          <Slider
            label="Brightness"
            value={brightness}
            unit="%"
            min={20}
            max={200}
            accent={accentColor}
            onChange={(v) => onVideoChange("brightness", v)}
          />
          <Slider
            label="Contrast"
            value={contrast}
            unit="%"
            min={20}
            max={200}
            accent={accentColor}
            onChange={(v) => onVideoChange("contrast", v)}
          />
          <Slider
            label="Saturation"
            value={saturation}
            unit="%"
            min={0}
            max={200}
            accent={accentColor}
            onChange={(v) => onVideoChange("saturation", v)}
          />
          <Slider
            label="Hue"
            value={hue}
            unit="°"
            min={0}
            max={360}
            accent={accentColor}
            onChange={(v) => onVideoChange("hue", v)}
          />
          <Slider
            label="Sepia"
            value={sepia}
            unit="%"
            min={0}
            max={100}
            accent={accentColor}
            onChange={(v) => onVideoChange("sepia", v)}
          />
          <Slider
            label="Sharpness"
            value={sharpness}
            unit="%"
            min={0}
            max={100}
            accent={accentColor}
            onChange={(v) => onVideoChange("sharpness", v)}
          />
        </div>
      )}

      {activeTab === "audio" && (
        <div className="filter-tab-content">
          <Slider
            label="Volume Boost"
            value={audioBoost}
            unit="%"
            min={100}
            max={400}
            accent={accentColor}
            onChange={(v) => onAudioChange("audioBoost", v)}
          />
          <Slider
            label="Bass Boost"
            value={bass}
            unit="dB"
            min={-15}
            max={15}
            accent={accentColor}
            onChange={(v) => onAudioChange("bass", v)}
            showSign
          />
          <Slider
            label="Treble / Clarity"
            value={treble}
            unit="dB"
            min={-15}
            max={15}
            accent={accentColor}
            onChange={(v) => onAudioChange("treble", v)}
            showSign
          />
        </div>
      )}
    </div>
  );
});

function Slider({
  label,
  value,
  unit,
  min,
  max,
  accent,
  onChange,
  showSign,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  accent: string;
  onChange: (v: number) => void;
  showSign?: boolean;
}) {
  const display = showSign && value > 0 ? `+${value}` : `${value}`;
  return (
    <div className="filter-group">
      <label>
        <span>{label}</span>
        <span>
          {display}
          {unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: accent }}
      />
    </div>
  );
}
