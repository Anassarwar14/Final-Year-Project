"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type YtPlayerTarget = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
};

type YtPlayerCtor = new (
  el: HTMLElement,
  opts: {
    videoId: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (e: { target: YtPlayerTarget }) => void;
      onStateChange?: (e: { data: number; target: YtPlayerTarget }) => void;
    };
  }
) => unknown;

function loadIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as Window & {
    YT?: { Player: YtPlayerCtor; PlayerState?: { ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (w.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function YoutubeChapterPlayer({
  videoId,
  onEnded,
  onProgress,
  startSeconds = 0,
  className,
}: {
  videoId: string | null;
  onEnded: () => void;
  onProgress?: (percent: number) => void;
  /** Resume playback position (seconds) */
  startSeconds?: number;
  className?: string;
}) {
  const [client, setClient] = useState(false);
  /** Radix Dialog portals often mount after the first effect tick; ref alone does not retrigger effects. */
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const playerRef = useRef<YtPlayerTarget | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const stableOnEnded = useCallback(() => {
    onEndedRef.current();
  }, []);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    setMountEl(node);
  }, []);

  useEffect(() => {
    setClient(true);
  }, []);

  useEffect(() => {
    if (!client || !videoId || !mountEl) return;

    let cancelled = false;

    const stopTicks = () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    const destroy = () => {
      stopTicks();
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
      if (mountEl.isConnected) {
        mountEl.innerHTML = "";
      }
    };

    (async () => {
      await loadIframeApi();

      // Iframe API callback can run before `YT.Player` is defined — wait briefly.
      for (let i = 0; i < 60 && !cancelled; i++) {
        const w = window as Window & {
          YT?: { Player: YtPlayerCtor; PlayerState: { ENDED: number } };
        };
        if (w.YT?.Player) break;
        await sleep(50);
      }

      if (cancelled) return;

      const w = window as Window & {
        YT?: { Player: YtPlayerCtor; PlayerState: { ENDED: number } };
      };
      const YT = w.YT;
      if (!YT?.Player || !mountEl.isConnected) return;
      if (cancelled) return;

      destroy();
      if (cancelled || !mountEl.isConnected) return;

      new YT.Player(mountEl, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            const tgt = e.target;
            playerRef.current = tgt;
            if (startSeconds > 0) {
              tgt.seekTo(startSeconds, true);
            }
            if (onProgressRef.current) {
              tickRef.current = setInterval(() => {
                const dur = tgt.getDuration();
                const t = tgt.getCurrentTime();
                if (dur > 0) {
                  onProgressRef.current?.(Math.min(100, Math.round((t / dur) * 100)));
                }
              }, 500);
            }
          },
          onStateChange: (e) => {
            const ended =
              YT.PlayerState !== undefined
                ? e.data === YT.PlayerState.ENDED
                : e.data === 0;
            if (ended) {
              onProgressRef.current?.(100);
              stableOnEnded();
            }
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      destroy();
    };
    // Note: do not list `onProgress` here — use ref only so the player is not torn down every render.
  }, [client, videoId, startSeconds, stableOnEnded, mountEl]);

  if (!videoId) {
    return (
      <div
        className={
          className ??
          "flex aspect-video w-full min-h-[200px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground"
        }
      >
        Invalid or missing YouTube link for this chapter.
      </div>
    );
  }

  const shellClass =
    className ?? "aspect-video w-full min-h-[200px] overflow-hidden rounded-lg bg-black/5";

  if (!client) {
    return (
      <div
        ref={setContainerRef}
        className={`${shellClass} animate-pulse bg-muted/40`}
        aria-hidden
        suppressHydrationWarning
      />
    );
  }

  return <div ref={setContainerRef} className={shellClass} suppressHydrationWarning />;
}
