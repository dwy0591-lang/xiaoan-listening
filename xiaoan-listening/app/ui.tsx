"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import QRCode from "qrcode";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Sound = "bay" | "cliffs" | "chopin";

const tracks: Record<
  Sound,
  { label: string; shortLabel: string; src: string; credit: string; creditUrl: string }
> = {
  bay: {
    label: "日落后的海滩",
    shortLabel: "海边黄昏",
    src: "https://upload.wikimedia.org/wikipedia/commons/d/d3/NausetBeach.ogg",
    credit: "海浪实录：Groov3 · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:NausetBeach.ogg",
  },
  cliffs: {
    label: "礁石与海鸥",
    shortLabel: "海浪与海鸥",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg",
    credit: "海浪实录：Luftrum · CC BY 3.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg",
  },
  chopin: {
    label: "肖邦《降 E 大调夜曲》Op.9 No.2",
    shortLabel: "肖邦夜曲",
    src: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Chopin.Nocturne.Es-Dur.opus.9.2.ogg",
    credit: "完整演奏：Membeth · CC0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chopin.Nocturne.Es-Dur.opus.9.2.ogg",
  },
};

const gullSrc =
  "https://upload.wikimedia.org/wikipedia/commons/c/cc/Red-billed_gulls_calling%2C_Otago_Peninsula%2C_NZ.ogg";

type AudioController = {
  sound: Sound;
  playing: boolean;
  loading: boolean;
  volume: number;
  error: string;
  start: (sound?: Sound) => Promise<void>;
  stop: () => void;
  setVolume: (value: number) => void;
};

const AudioControllerContext = createContext<AudioController | null>(null);

function SoftClickSound() {
  useEffect(() => {
    let context: AudioContext | null = null;
    const play = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("button, a, [role='button']")) return;
      const AudioContextClass =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;
      context ||= new AudioContextClass();
      const now = context.currentTime;
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(330, now);
      tone.frequency.exponentialRampToValueAtTime(470, now + 0.045);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.0032, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      tone.connect(gain).connect(context.destination);
      tone.start(now);
      tone.stop(now + 0.06);
    };
    document.addEventListener("pointerdown", play);
    return () => {
      document.removeEventListener("pointerdown", play);
      void context?.close();
    };
  }, []);
  return null;
}

export function AudioExperienceProvider({ children }: { children: ReactNode }) {
  const mainAudio = useRef<HTMLAudioElement | null>(null);
  const gullAudio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const autoplayAttempted = useRef(false);
  const [sound, setSoundState] = useState<Sound>(() => {
    if (typeof window === "undefined") return "bay";
    const saved = localStorage.getItem("little-shore-sound");
    return saved === "cliffs" || saved === "chopin" || saved === "bay" ? saved : "bay";
  });
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return 68;
    const saved = Number(localStorage.getItem("little-shore-volume"));
    return Number.isFinite(saved) && saved >= 20 && saved <= 100 ? saved : 68;
  });

  const applyVolume = (next: number) => {
    const safe = Math.max(20, Math.min(100, next));
    setVolumeState(safe);
    localStorage.setItem("little-shore-volume", String(safe));
    if (mainAudio.current) mainAudio.current.volume = safe / 100;
    if (gullAudio.current) gullAudio.current.volume = Math.min(0.12, safe / 650);
  };

  const stop = () => {
    mainAudio.current?.pause();
    gullAudio.current?.pause();
    localStorage.setItem("little-shore-autoplay", "off");
    setPlaying(false);
    setLoading(false);
  };

  const start = useCallback(async (nextSound = sound, automatic = false) => {
    const audio = mainAudio.current;
    if (!audio) return;
    setError("");
    setLoading(true);
    if (sound !== nextSound || audio.src !== tracks[nextSound].src) {
      audio.pause();
      audio.src = tracks[nextSound].src;
      audio.currentTime = 0;
      audio.load();
    }
    audio.volume = volume / 100;
    try {
      await audio.play();
      setSoundState(nextSound);
      localStorage.setItem("little-shore-sound", nextSound);
      localStorage.setItem("little-shore-autoplay", "on");
      setPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setPlaying(false);
      if (automatic) {
        setAutoplayBlocked(true);
      } else {
        setError("声音没有加载出来，点一下再试试");
      }
    } finally {
      setLoading(false);
    }
  }, [sound, volume]);

  useEffect(() => {
    if (autoplayAttempted.current) return;
    autoplayAttempted.current = true;
    if (localStorage.getItem("little-shore-autoplay") === "off") return;
    const timer = window.setTimeout(() => void start(sound, true), 0);
    return () => window.clearTimeout(timer);
  }, [sound, start]);

  useEffect(() => {
    if (!autoplayBlocked) return;
    const unlock = () => void start(sound);
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true });
      document.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [autoplayBlocked, sound, start]);

  useEffect(() => {
    if (!playing || sound !== "cliffs") return;
    const gullElement = gullAudio.current;
    const playGulls = () => {
      const gull = gullElement;
      if (!gull) return;
      gull.currentTime = 0;
      gull.volume = Math.min(0.12, volume / 650);
      void gull.play().catch(() => undefined);
    };
    const first = window.setTimeout(playGulls, 11000);
    const repeat = window.setInterval(playGulls, 42000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(repeat);
      gullElement?.pause();
    };
  }, [playing, sound, volume]);

  const value: AudioController = {
    sound,
    playing,
    loading,
    volume,
    error,
    start,
    stop,
    setVolume: applyVolume,
  };

  return (
    <AudioControllerContext.Provider value={value}>
      <SoftClickSound />
      {children}
      {autoplayBlocked && (
        <button className="sound-entry-hint" type="button" onClick={() => void start(sound)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/capybara-avatar.webp" alt="" />
          <span><strong>点一下，让海浪靠岸</strong><small>浏览器第一次见小岸，需要你碰一下屏幕</small></span>
        </button>
      )}
      <audio ref={mainAudio} loop autoPlay preload="auto" onPause={() => setPlaying(false)} />
      <audio ref={gullAudio} src={gullSrc} preload="none" />
    </AudioControllerContext.Provider>
  );
}

function useAudioController() {
  const value = useContext(AudioControllerContext);
  if (!value) throw new Error("AudioExperienceProvider is missing");
  return value;
}

export function SiteMark() {
  return (
    <Link className="site-mark" href="/" aria-label="小岸在听呢首页">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mark-mascot" src="/capybara-avatar.webp" alt="" />
      <span>
        小岸在听呢
        <small>一只水豚，认真听你说话</small>
      </span>
    </Link>
  );
}

export function CalmBackground() {
  return (
    <div className="calm-background" aria-hidden="true">
      <i className="star star-1">✧</i>
      <i className="star star-2">·</i>
      <i className="star star-3">✧</i>
      <i className="star star-4">·</i>
      <i className="star star-5">✦</i>
      <i className="star star-6">·</i>
      <i className="star star-7">✧</i>
    </div>
  );
}

export function CapybaraAside({ children }: { children: ReactNode }) {
  return (
    <div className="capybara-aside">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/capybara-avatar.webp" alt="水豚小岸" />
      <span>{children}</span>
    </div>
  );
}

export function AmbientAudio() {
  const [open, setOpen] = useState(false);
  const { sound, playing, loading, volume, error, start, stop, setVolume } =
    useAudioController();

  return (
    <div className="audio-control">
      <button
        className={`sound-toggle ${playing ? "is-playing" : ""}`}
        type="button"
        aria-label={playing ? "暂停背景音" : "打开背景音"}
        onClick={() => (playing ? stop() : void start())}
      >
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>
        {loading ? "声音正在靠岸…" : playing ? tracks[sound].shortLabel : "背景音乐 · 关"}
      </button>
      <button
        className="sound-menu-button"
        type="button"
        aria-label="选择背景音"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⌄
      </button>
      {open && (
        <div className="sound-menu sound-menu-v3">
          {(Object.entries(tracks) as [Sound, (typeof tracks)[Sound]][]).map(
            ([value, track]) => (
              <button
                type="button"
                className={sound === value ? "active" : ""}
                key={value}
                onClick={() => void start(value)}
              >
                <span aria-hidden="true">{value === "chopin" ? "♪" : "≈"}</span>
                <span>{track.label}</span>
              </button>
            ),
          )}
          <label className="volume-row">
            <span>音量</span>
            <input
              type="range"
              min="20"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
            <span>{volume}%</span>
          </label>
          {error && <p className="sound-error">{error}</p>}
          <a className="audio-credit" href={tracks[sound].creditUrl} target="_blank" rel="noreferrer">
            {tracks[sound].credit}
          </a>
          {sound === "cliffs" && (
            <a className="audio-credit" href="https://commons.wikimedia.org/wiki/File:Red-billed_gulls_calling,_Otago_Peninsula,_NZ.ogg" target="_blank" rel="noreferrer">
              海鸥实录：Benchill · CC BY-SA 3.0
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function ShareSiteButton() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const shareData = {
      title: "小岸在听呢",
      text: "有一只水豚在海边认真听你说话。累的时候，可以来这里坐一会儿。",
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  };

  return (
    <button className="share-site-button" type="button" onClick={() => void share()}>
      <span aria-hidden="true">⌁</span>
      {copied ? "链接抄好啦" : "分享小岸"}
    </button>
  );
}

function loadPosterImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function SharePosterButton() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      setReady(false);
      canvas.width = 1080;
      canvas.height = 1440;

      const background = context.createLinearGradient(0, 0, 1080, 1440);
      background.addColorStop(0, "#fbfaf1");
      background.addColorStop(0.5, "#edf5eb");
      background.addColorStop(1, "#dcecef");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "rgba(255, 254, 246, .78)";
      context.beginPath();
      context.roundRect(62, 62, 956, 1316, 58);
      context.fill();

      context.fillStyle = "#537970";
      context.font = '42px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("小岸在听呢", 120, 150);
      context.fillStyle = "#829a94";
      context.font = '24px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("给柔软小画家的匿名情绪海岸", 120, 198);

      context.fillStyle = "#456d64";
      context.font = '72px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("累了就来吧，", 120, 330);
      context.fillText("海边一直给你留着位置。", 120, 425);
      context.fillStyle = "#708a84";
      context.font = '30px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("不用注册，不用解释。", 124, 494);
      context.fillText("有一只水豚，会把你的话认真听完。", 124, 542);

      const illustration = await loadPosterImage("/hero-capybara-seaside.webp");
      if (cancelled) return;
      context.save();
      context.beginPath();
      context.roundRect(104, 612, 872, 470, 42);
      context.clip();
      const scale = Math.max(872 / illustration.width, 470 / illustration.height);
      const width = illustration.width * scale;
      const height = illustration.height * scale;
      context.drawImage(illustration, 104 + (872 - width) / 2, 612 + (470 - height) / 2, width, height);
      context.restore();

      const qrUrl = await QRCode.toDataURL(window.location.origin, {
        width: 190,
        margin: 1,
        color: { dark: "#476d64", light: "#fffdf5" },
      });
      const qr = await loadPosterImage(qrUrl);
      if (cancelled) return;
      context.drawImage(qr, 118, 1140, 190, 190);
      context.fillStyle = "#52766e";
      context.font = '31px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("扫码来小岸旁边坐一会儿", 350, 1204);
      context.fillStyle = "#8ba19b";
      context.font = '22px "Kaiti SC", "STKaiti", "KaiTi", serif';
      context.fillText("写心事 · 找同频 · 哄自己开心一下", 350, 1252);
      context.fillText("小岸不催你，只陪你。", 350, 1294);
      setReady(true);
    };
    void draw();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const link = document.createElement("a");
    link.download = "小岸在听呢-分享海报.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <button className="poster-trigger" type="button" onClick={() => setOpen(true)}>
        生成分享海报
      </button>
      {open && (
        <div className="poster-layer" role="dialog" aria-modal="true" aria-label="小岸分享海报">
          <div className="poster-dialog">
            <div className="poster-dialog-head">
              <div><strong>把小岸带给同频的人</strong><span>二维码会自动使用现在的网址</span></div>
              <button type="button" aria-label="关闭分享海报" onClick={() => setOpen(false)}>×</button>
            </div>
            <canvas ref={canvasRef} aria-label="小岸在听呢分享海报预览" />
            <button className="poster-download" type="button" disabled={!ready} onClick={download}>
              {ready ? "保存这张海报" : "小岸正在画海报…"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    const key = `xiaoan-viewed:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}

const primaryLinks = [
  { href: "/write", label: "说给小岸", icon: "✎" },
  { href: "/plaza", label: "同频海滩", icon: "≈" },
  { href: "/joy", label: "开心一下", icon: "☀" },
  { href: "/me", label: "我的海岸", icon: "⌂" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/plaza") return pathname === "/plaza" || pathname === "/music";
  if (href === "/me") return pathname === "/me" || pathname === "/glow";
  return pathname === href;
}

export function PrimaryNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={`primary-nav ${className}`.trim()} aria-label="主导航">
      {primaryLinks.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className={isActivePath(pathname, item.href) ? "active" : ""}
          aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileDock() {
  return <PrimaryNav className="mobile-dock" />;
}

export function InnerHeader() {
  return (
    <header className="inner-header">
      <SiteMark />
      <PrimaryNav />
      <div className="header-actions">
        <ShareSiteButton />
        <AmbientAudio />
      </div>
    </header>
  );
}
