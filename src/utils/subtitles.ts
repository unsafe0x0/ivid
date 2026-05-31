import type { SubtitleCue } from "../types";

export function parseSubtitleFile(
  text: string,
  filename: string,
): SubtitleCue[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "srt") return parseSRT(text);
  if (ext === "vtt") return parseVTT(text);
  return [];
}

function parseTimestamp(ts: string): number {
  const parts = ts.trim().replace(",", ".").split(":");
  if (parts.length === 3) {
    return (
      parseFloat(parts[0]) * 3600 +
      parseFloat(parts[1]) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
}

function parseSRT(text: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = text.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [startStr, endStr] = timeLine.split("-->");
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);
    const textIdx = lines.indexOf(timeLine) + 1;
    const cueText = lines
      .slice(textIdx)
      .join("\n")
      .replace(/<[^>]+>/g, "");
    if (cueText.trim()) cues.push({ start, end, text: cueText.trim() });
  }
  return cues;
}

function parseVTT(text: string): SubtitleCue[] {
  const body = text.replace(/^WEBVTT.*?\n\n/s, "");
  return parseSRT(body);
}
