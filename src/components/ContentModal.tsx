"use client";

import { useEffect, useRef, useCallback, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import type { ContentItem } from "@/types/content";

const SAVE_PROGRESS_INTERVAL_MS = 2000;
const POPUP_CLOSE_DELAY_MS = 200;
const CONTROLS_HIDE_DELAY_MS = 2500;
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface ContentModalProps {
  item: ContentItem | null;
  onClose: () => void;
  onProgressUpdate?: (id: number, progress: number) => void;
}

function getProgressPercent(video: HTMLVideoElement): number | null {
  if (!video.duration || !Number.isFinite(video.duration)) return null;
  return Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100));
}

export function ContentModal({
  item,
  onClose,
  onProgressUpdate,
}: ContentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volumePopupOpen, setVolumePopupOpen] = useState(false);
  const [speedPopupOpen, setSpeedPopupOpen] = useState(false);
  const [volumePopupVisible, setVolumePopupVisible] = useState(false);
  const [speedPopupVisible, setSpeedPopupVisible] = useState(false);
  const [volumePopupRect, setVolumePopupRect] = useState<{ top: number; left: number } | null>(null);
  const [speedPopupRect, setSpeedPopupRect] = useState<{ top: number; left: number } | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const volumeAnchorRef = useRef<HTMLButtonElement>(null);
  const speedAnchorRef = useRef<HTMLButtonElement>(null);
  const volumeCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const clearVolumeCloseTimeout = useCallback(() => {
    if (volumeCloseTimeoutRef.current != null) {
      clearTimeout(volumeCloseTimeoutRef.current);
      volumeCloseTimeoutRef.current = null;
    }
  }, []);

  const clearSpeedCloseTimeout = useCallback(() => {
    if (speedCloseTimeoutRef.current != null) {
      clearTimeout(speedCloseTimeoutRef.current);
      speedCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleVolumeClose = useCallback(() => {
    clearVolumeCloseTimeout();
    volumeCloseTimeoutRef.current = setTimeout(() => setVolumePopupOpen(false), POPUP_CLOSE_DELAY_MS);
  }, [clearVolumeCloseTimeout]);

  const scheduleSpeedClose = useCallback(() => {
    clearSpeedCloseTimeout();
    speedCloseTimeoutRef.current = setTimeout(() => setSpeedPopupOpen(false), POPUP_CLOSE_DELAY_MS);
  }, [clearSpeedCloseTimeout]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        onClose();
      }
    },
    [onClose]
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      e.preventDefault();
      togglePlay();
    },
    [togglePlay]
  );

  const scheduleControlsHide = useCallback(() => {
    if (controlsHideTimeoutRef.current != null) clearTimeout(controlsHideTimeoutRef.current);
    controlsHideTimeoutRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  useEffect(() => {
    if (!item) return;
    setControlsVisible(true);
    document.body.style.overflow = "hidden";
    contentRef.current?.focus({ preventScroll: true });
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", handleKeyDown);
      clearVolumeCloseTimeout();
      clearSpeedCloseTimeout();
      if (controlsHideTimeoutRef.current != null) clearTimeout(controlsHideTimeoutRef.current);
    };
  }, [item, handleEscape, handleKeyDown, clearVolumeCloseTimeout, clearSpeedCloseTimeout]);

  useEffect(() => {
    if (!item || !onProgressUpdate) return;
    const video = videoRef.current;
    if (!video) return;

    const save = () => {
      const pct = getProgressPercent(video);
      if (pct != null) onProgressUpdate(item.id, pct);
    };

    let lastSave = 0;
    const onTimeUpdate = () => {
      if (Date.now() - lastSave < SAVE_PROGRESS_INTERVAL_MS) return;
      lastSave = Date.now();
      save();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      save();
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [item, onProgressUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      const pct = getProgressPercent(video);
      if (pct != null) setProgress(pct);
    };
    const onLoadedMetadata = () => {
      const pct = getProgressPercent(video);
      if (pct != null) setProgress(pct);
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [item]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = muted ? 0 : volume;
    video.muted = muted;
  }, [volume, muted]);

  useLayoutEffect(() => {
    if (!volumePopupOpen || !volumeAnchorRef.current) return;
    const rect = volumeAnchorRef.current.getBoundingClientRect();
    setVolumePopupRect({ top: rect.top - 4, left: rect.left });
  }, [volumePopupOpen]);

  useLayoutEffect(() => {
    if (!speedPopupOpen || !speedAnchorRef.current) return;
    const rect = speedAnchorRef.current.getBoundingClientRect();
    setSpeedPopupRect({ top: rect.top - 4, left: rect.left });
  }, [speedPopupOpen]);

  useEffect(() => {
    if (volumePopupOpen) {
      const t = requestAnimationFrame(() => setVolumePopupVisible(true));
      return () => cancelAnimationFrame(t);
    }
    setVolumePopupVisible(false);
  }, [volumePopupOpen]);

  useEffect(() => {
    if (speedPopupOpen) {
      const t = requestAnimationFrame(() => setSpeedPopupVisible(true));
      return () => cancelAnimationFrame(t);
    }
    setSpeedPopupVisible(false);
  }, [speedPopupOpen]);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setSpeedPopupOpen(false);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const video = videoRef.current;
      if (!bar || !video || !Number.isFinite(video.duration)) return;
      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      video.currentTime = pct * video.duration;
      setProgress(pct * 100);
    },
    []
  );

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (!item) return null;

  const popupTarget =
    typeof document !== "undefined" && isFullscreen && videoContainerRef.current
      ? videoContainerRef.current
      : document.body;

  const volumePopup = volumePopupOpen && volumePopupRect && typeof document !== "undefined" && createPortal(
    <div
      className={`pointer-events-auto rounded border border-zinc-700 bg-zinc-800 p-1.5 shadow-xl transition-opacity duration-150 ease-out ${
        volumePopupVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        position: "fixed",
        top: volumePopupRect.top - 72,
        left: volumePopupRect.left,
        zIndex: 9999,
      }}
      onMouseEnter={clearVolumeCloseTimeout}
      onMouseLeave={scheduleVolumeClose}
    >
      <div className="flex h-14 w-5 items-center justify-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="video-volume-slider vertical cursor-pointer rounded-full bg-zinc-700 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:hover:bg-red-400"
          style={{ width: "3.5rem", height: "0.2rem", transform: "rotate(-90deg)" }}
          aria-label="Volume"
        />
      </div>
    </div>,
    popupTarget
  );

  const speedPopupHeight = 7 * 28 + 8;
  const speedPopup = speedPopupOpen && speedPopupRect && typeof document !== "undefined" && createPortal(
    <ul
      className={`pointer-events-auto min-w-[3.5rem] rounded border border-zinc-700 bg-zinc-800 py-0.5 text-xs shadow-xl transition-opacity duration-150 ease-out ${
        speedPopupVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        position: "fixed",
        top: speedPopupRect.top - speedPopupHeight,
        left: speedPopupRect.left,
        zIndex: 9999,
      }}
      role="listbox"
      aria-label="Speed options"
      onMouseEnter={clearSpeedCloseTimeout}
      onMouseLeave={scheduleSpeedClose}
    >
      {SPEED_OPTIONS.map((rate) => (
        <li key={rate} role="option" aria-selected={playbackRate === rate}>
          <button
            type="button"
            className={`w-full px-2 py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
              playbackRate === rate
                ? "bg-red-600/20 text-red-400"
                : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
            onClick={() => setSpeed(rate)}
          >
            {rate}x
          </button>
        </li>
      ))}
    </ul>,
    popupTarget
  );

  return (
    <>
      <div
        ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={videoContainerRef}
          className="relative aspect-video w-full bg-black"
          onMouseMove={showControls}
          onMouseLeave={scheduleControlsHide}
        >
          <video
            ref={videoRef}
            className="h-full w-full rounded-t-xl object-contain"
            src="/video.mp4"
            playsInline
            preload="metadata"
            aria-label="Відео"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
          <button
            type="button"
            className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/90 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {!isPlaying && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-t-xl"
              onClick={togglePlay}
            >
              <button
                type="button"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-600 bg-zinc-800/90 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label="Play"
              >
                <svg className="h-6 w-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </button>
            </div>
          )}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col rounded-b-xl transition-opacity duration-300 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            } ${controlsVisible ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <div className="bg-gradient-to-t from-black/90 to-transparent px-3 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/90 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  )}
                </button>
                <div
                  onMouseEnter={() => {
                    clearVolumeCloseTimeout();
                    setVolumePopupOpen(true);
                  }}
                  onMouseLeave={scheduleVolumeClose}
                  className="relative"
                >
                  <button
                    ref={volumeAnchorRef}
                    type="button"
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/90 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute" : "Mute"}
                    aria-expanded={volumePopupOpen}
                  >
                    {muted || volume === 0 ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    )}
                  </button>
                </div>
                <div
                  onMouseEnter={() => {
                    clearSpeedCloseTimeout();
                    setSpeedPopupOpen(true);
                  }}
                  onMouseLeave={scheduleSpeedClose}
                  className="relative"
                >
                  <button
                    ref={speedAnchorRef}
                    type="button"
                    className="flex h-8 min-w-[2.75rem] cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/90 px-2 text-xs text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    aria-expanded={speedPopupOpen}
                    aria-haspopup="listbox"
                    aria-label="Playback speed"
                  >
                    {playbackRate}x
                  </button>
                </div>
                <div className="min-w-0 flex-1" aria-hidden />
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/90 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div
              ref={progressBarRef}
              className="flex h-1.5 cursor-pointer rounded-b-xl bg-zinc-800/80"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onKeyDown={(e) => {
                const video = videoRef.current;
                if (!video?.duration) return;
                const step = 5;
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  video.currentTime = Math.min(video.duration, video.currentTime + step);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  video.currentTime = Math.max(0, video.currentTime - step);
                }
              }}
            >
              <div
                className="h-full rounded-b-xl bg-red-600 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <h2 id="modal-title" className="text-xl font-semibold text-white">
            {item.title}
          </h2>
          <p className="text-sm text-zinc-400">
            {item.year} • {item.rating}/10 • {item.duration} min
          </p>
          <p id="modal-description" className="text-sm text-zinc-300">
            {item.description}
          </p>
          {item.genre?.length > 0 && (
            <p className="text-xs text-zinc-500">
              {item.genre.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
      {volumePopup}
      {speedPopup}
    </>
  );
}
