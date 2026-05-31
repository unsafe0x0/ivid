import { useState, useMemo, useCallback } from "react";
import type { VideoFilterType } from "../types";

const DEFAULTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  sepia: 0,
  sharpness: 0,
  exposure: 100,
};

export function useFilters() {
  const [brightness, setBrightness] = useState(DEFAULTS.brightness);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [saturation, setSaturation] = useState(DEFAULTS.saturation);
  const [hue, setHue] = useState(DEFAULTS.hue);
  const [sepia, setSepia] = useState(DEFAULTS.sepia);
  const [sharpness, setSharpness] = useState(DEFAULTS.sharpness);
  const [exposure, setExposure] = useState(DEFAULTS.exposure);

  const sharpnessX = useMemo(
    () => (sharpness > 0 ? 50 - (sharpness / 100) * 45 : 50),
    [sharpness],
  );

  const filterString = useMemo(() => {
    let s = `brightness(${brightness}%) brightness(${exposure}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) sepia(${sepia}%)`;
    if (sharpness > 0) s += " url(#sharpness-filter)";
    return s;
  }, [brightness, exposure, contrast, saturation, hue, sepia, sharpness]);

  const setFilter = useCallback((type: VideoFilterType, value: number) => {
    const map: Record<
      VideoFilterType,
      React.Dispatch<React.SetStateAction<number>>
    > = {
      brightness: setBrightness,
      contrast: setContrast,
      saturation: setSaturation,
      hue: setHue,
      sepia: setSepia,
      sharpness: setSharpness,
      exposure: setExposure,
    };
    map[type]?.(value);
  }, []);

  const reset = useCallback(() => {
    setBrightness(DEFAULTS.brightness);
    setContrast(DEFAULTS.contrast);
    setSaturation(DEFAULTS.saturation);
    setHue(DEFAULTS.hue);
    setSepia(DEFAULTS.sepia);
    setSharpness(DEFAULTS.sharpness);
    setExposure(DEFAULTS.exposure);
  }, []);

  return {
    brightness,
    contrast,
    saturation,
    hue,
    sepia,
    sharpness,
    exposure,
    sharpnessX,
    filterString,
    setFilter,
    reset,
  };
}
