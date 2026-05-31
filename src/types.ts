export interface PlaylistItem {
  id: string;
  name: string;
  source: File | string;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export type VideoFilterType =
  | "brightness"
  | "contrast"
  | "saturation"
  | "hue"
  | "sepia"
  | "sharpness"
  | "exposure";
export type AudioFilterType = "bass" | "treble" | "audioBoost";
