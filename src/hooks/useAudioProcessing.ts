import { useCallback, useRef, useState } from "react";
import type { AudioFilterType } from "../types";

export function useAudioProcessing() {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bassRef = useRef<BiquadFilterNode | null>(null);
  const trebleRef = useRef<BiquadFilterNode | null>(null);

  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);
  const [audioBoost, setAudioBoost] = useState(100);

  const isReady = useCallback(() => ctxRef.current !== null, []);

  const resume = useCallback(() => {
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume();
  }, []);

  const setup = useCallback((videoElement: HTMLVideoElement) => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(videoElement);
    const gain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    const trebleFilter = ctx.createBiquadFilter();

    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 200;
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 3000;

    source
      .connect(bassFilter)
      .connect(trebleFilter)
      .connect(gain)
      .connect(ctx.destination);

    ctxRef.current = ctx;
    sourceRef.current = source;
    gainRef.current = gain;
    bassRef.current = bassFilter;
    trebleRef.current = trebleFilter;
  }, []);

  const setAudioFilter = useCallback((type: AudioFilterType, value: number) => {
    switch (type) {
      case "bass":
        setBass(value);
        if (bassRef.current) bassRef.current.gain.value = value;
        break;
      case "treble":
        setTreble(value);
        if (trebleRef.current) trebleRef.current.gain.value = value;
        break;
      case "audioBoost":
        setAudioBoost(value);
        if (gainRef.current) gainRef.current.gain.value = value / 100;
        break;
    }
  }, []);

  const reset = useCallback(() => {
    setBass(0);
    setTreble(0);
    setAudioBoost(100);
    if (bassRef.current) bassRef.current.gain.value = 0;
    if (trebleRef.current) trebleRef.current.gain.value = 0;
    if (gainRef.current) gainRef.current.gain.value = 1;
  }, []);

  return {
    bass,
    treble,
    audioBoost,
    isReady,
    resume,
    setup,
    setAudioFilter,
    reset,
  };
}
