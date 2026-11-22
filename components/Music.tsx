"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LIBRARY, LIKED, MIXES, MORE_LIKE, MORE_LIKE_OF, NEW_RELEASE, NEW_SINGLE, RECENT, SHORTCUTS, TRACKS, ARTIST, findTrack, type Collection, type Track } from "@/lib/music";
import { useDrag } from "./useDrag";

// Spotify-style music app, laid out from the user's screen recording (desktop app, PT-PT UI).

const I = {
  dots: <svg viewBox="0 0 16 16"><path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" /></svg>,
  back: <svg viewBox="0 0 16 16"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0" /></svg>,
  fwd: <svg viewBox="0 0 16 16"><path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8 6.03.47a.75.75 0 0 0-1.06 0" /></svg>,
  home: <svg viewBox="0 0 24 24"><path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732z" /></svg>,
  search: <svg viewBox="0 0 24 24"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z" /></svg>,
  x: <svg viewBox="0 0 16 16"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06" /></svg>,
  browse: <svg viewBox="0 0 24 24"><path d="M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2" /><path d="M1.513 9.37A1 1 0 0 1 2.291 9h19.418a1 1 0 0 1 .979 1.208l-2.339 11a1 1 0 0 1-.978.792H4.63a1 1 0 0 1-.978-.792l-2.339-11a1 1 0 0 1 .201-.837zM3.525 11l1.913 9h13.123l1.913-9zM4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4h-2V3H6v3H4z" /></svg>,
  bell: <svg viewBox="0 0 16 16"><path d="M8 1.5a4 4 0 0 0-4 4v3.27a.75.75 0 0 1-.1.373L2.255 12h11.49L12.1 9.142a.75.75 0 0 1-.1-.374V5.5a4 4 0 0 0-4-4zm-5.5 4a5.5 5.5 0 0 1 11 0v3.067l2.193 3.809a.75.75 0 0 1-.65 1.124H10.5a2.5 2.5 0 0 1-5 0H.957a.75.75 0 0 1-.65-1.124L2.5 8.569zm4.5 8a1 1 0 1 0 2 0z" /></svg>,
  friends: <svg viewBox="0 0 16 16"><path d="M3.849 10.034c-.021-.465.026-.93.14-1.381l.3-1.199a.75.75 0 0 0-1.456-.364l-.3 1.2a6 6 0 0 0-.17 1.856l.067 1.49-1.165 3.495a.75.75 0 1 0 1.423.475l1.21-3.63a.75.75 0 0 0 .037-.271zM5.5 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m7.5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-.849 4.534c.021-.465-.026-.93-.14-1.381l-.3-1.199a.75.75 0 0 1 1.456-.364l.3 1.2c.15.607.207 1.233.17 1.856l-.067 1.49 1.165 3.495a.75.75 0 1 1-1.423.475l-1.21-3.63a.75.75 0 0 1-.037-.271z" /><path d="M8 7a1.5 1.5 0 0 0-1.5 1.5v3.106l-1.21 3.257a.75.75 0 1 0 1.406.522L7.874 12.2h.252l1.178 3.185a.75.75 0 1 0 1.406-.522L9.5 11.606V8.5A1.5 1.5 0 0 0 8 7" /></svg>,
  lib: <svg viewBox="0 0 24 24"><path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866M16 4.732V20h4V7.041zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1m6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1" /></svg>,
  plus: <svg viewBox="0 0 16 16"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75" /></svg>,
  addCircle: <svg viewBox="0 0 16 16"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8" /><path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75" /></svg>,
  play: <svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" /></svg>,
  pause: <svg viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z" /></svg>,
  shuffle: <svg viewBox="0 0 16 16"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z" /><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z" /></svg>,
  prev: <svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z" /></svg>,
  next: <svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z" /></svg>,
  repeat: <svg viewBox="0 0 16 16"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75z" /></svg>,
  check: <svg viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z" /></svg>,
  lyrics: <svg viewBox="0 0 16 16"><path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797M10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z" /></svg>,
  queue: <svg viewBox="0 0 16 16"><path d="M15 15H1v-1.5h14zm0-4.5H1V9h14zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5m2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2z" /></svg>,
  device: <svg viewBox="0 0 16 16"><path d="M6 2.75C6 1.784 6.784 1 7.75 1h6.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15h-6.5A1.75 1.75 0 0 1 6 13.25zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25zm-6 0a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25H4V11H1.75A1.75 1.75 0 0 1 0 9.25v-6.5C0 1.784.784 1 1.75 1H4v1.5zM4 15H2v-1.5h2z" /><path d="M13 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" /></svg>,
  vol: <svg viewBox="0 0 16 16"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88" /><path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127z" /></svg>,
  mute: <svg viewBox="0 0 16 16"><path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06" /><path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.64 3.64 0 0 0-1.33 4.967 3.64 3.64 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.7 4.7 0 0 1-1.5-.694v1.3L2.817 9.852a2.14 2.14 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694z" /></svg>,
  mini: <svg viewBox="0 0 16 16"><path d="M16 2.45c0-.8-.65-1.45-1.45-1.45H1.45C.65 1 0 1.65 0 2.45v11.1C0 14.35.65 15 1.45 15h5.557v-1.5H1.5v-11h13V7H16z" /><path d="M15.25 9.007a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75z" /></svg>,
  full: <svg viewBox="0 0 16 16"><path d="M6.53 9.47a.75.75 0 0 1 0 1.06l-2.72 2.72h1.018a.75.75 0 0 1 0 1.5H1.25v-3.579a.75.75 0 0 1 1.5 0v1.018l2.72-2.72a.75.75 0 0 1 1.06 0zm2.94-2.94a.75.75 0 0 1 0-1.06l2.72-2.72h-1.018a.75.75 0 1 1 0-1.5h3.578v3.579a.75.75 0 0 1-1.5 0V3.81l-2.72 2.72a.75.75 0 0 1-1.06 0" /></svg>,
  note: <svg viewBox="0 0 16 16"><path d="M10 2v9.5a2.75 2.75 0 1 1-2.75-2.75H8.5V2zm-1.5 8.25h-1.25a1.25 1.25 0 1 0 1.25 1.25z" /></svg>,
  heart: <svg viewBox="0 0 16 16"><path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z" /></svg>,
  min: <svg viewBox="0 0 16 16"><path d="M2 8.5h12" strokeWidth="1" stroke="currentColor" fill="none" /></svg>,
  max: <svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" strokeWidth="1" stroke="currentColor" fill="none" /></svg>,
  close: <svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3 3 13" strokeWidth="1" stroke="currentColor" fill="none" /></svg>,
};

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function Eq() {
  return <span className="sp-eq" aria-label="A tocar"><i /><i /><i /><i /></span>;
}

function Cover({ c, round }: { c: Collection; round?: boolean }) {
  if (c.kind === "liked") return <span className={`sp-cover sp-liked${round ? " round" : ""}`}>{I.heart}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`sp-cover${round ? " round" : ""}`} src={c.cover} alt="" draggable={false} />;
}

type Props = {
  id: string; x: number; y: number; z: number; w: number; h: number; closing: boolean; hidden: boolean;
  onClose: (id: string) => void; onFocus: (id: string) => void; onMove: (id: string, dx: number, dy: number) => void; onMinimize: () => void;
};

type View = { kind: "home" } | { kind: "collection"; id: string } | { kind: "search"; q: string };

export function Music({ id, x, y, z, w, h, closing, hidden, onClose, onFocus, onMove, onMinimize }: Props) {
  const { dragging, handlers } = useDrag((dx, dy) => onMove(id, dx, dy));
  const [max, setMax] = useState(false);
  const [friends, setFriends] = useState(true);
  const [hist, setHist] = useState<{ list: View[]; i: number }>({ list: [{ kind: "home" }], i: 0 });
  const view = hist.list[hist.i];
  const go = (v: View) => setHist((h) => ({ list: [...h.list.slice(0, h.i + 1), v], i: h.i + 1 }));
  const [q, setQ] = useState("");
  const [hoverTint, setHoverTint] = useState<string | null>(null);

  // Player
  const audio = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<string[]>(TRACKS.map((t) => t.id));
  const [ctx, setCtx] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<0 | 1 | 2>(0);
  const [vol, setVol] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [missing, setMissing] = useState(false);
  const track: Track = findTrack(queue[idx] ?? TRACKS[0].id);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = muted ? 0 : vol;
  }, [vol, muted]);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (playing) a.play().catch(() => { setPlaying(false); setMissing(true); });
    else a.pause();
  }, [playing, track.id]);
  // Read the new song's length from the element: its metadata can load before this effect runs.
  useEffect(() => { const a = audio.current; setMissing(false); setTime(a?.currentTime ?? 0); setDur(a && Number.isFinite(a.duration) ? a.duration : 0); }, [track.id]);
  // Closing the window stops the music.
  useEffect(() => { if (closing) audio.current?.pause(); }, [closing]);

  const playCollection = (c: Collection, start = 0) => {
    if (ctx === c.id && queue[idx] === c.tracks[start]) { setPlaying((p) => !p); return; }
    const order = shuffle ? [c.tracks[start], ...c.tracks.filter((_, i) => i !== start).sort(() => Math.random() - 0.5)] : c.tracks;
    setQueue(order); setIdx(shuffle ? 0 : start); setCtx(c.id); setPlaying(true);
  };
  const playTrack = (t: Track, from?: Collection) => {
    const c = from ?? { ...LIKED, id: `single-${t.id}`, tracks: [t.id] };
    playCollection(c, Math.max(0, c.tracks.indexOf(t.id)));
  };
  const isOn = (c: Collection) => ctx === c.id && playing;
  const next = (auto = false) => {
    if (auto && repeat === 2) { if (audio.current) { audio.current.currentTime = 0; audio.current.play().catch(() => {}); } return; }
    if (idx + 1 < queue.length) setIdx(idx + 1);
    else if (repeat === 1 || !auto) setIdx(0);
    else setPlaying(false);
  };
  const prev = () => {
    if (audio.current && audio.current.currentTime > 3) audio.current.currentTime = 0;
    else setIdx((i) => (i - 1 + queue.length) % queue.length);
  };

  const seek = (e: React.PointerEvent, set: (f: number) => void) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const apply = (cx: number) => set(Math.min(1, Math.max(0, (cx - r.left) / r.width)));
    apply(e.clientX);
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => apply(ev.clientX);
    const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const all = useMemo(() => [...SHORTCUTS, ...MIXES, ...RECENT, ...MORE_LIKE], []);
  const findCol = (cid: string) => all.find((c) => c.id === cid) ?? LIKED;

  const playBtn = (c: Collection, size: "sm" | "lg" = "lg") => (
    <button type="button" className={`sp-play ${size}${isOn(c) ? " on" : ""}`} aria-label={isOn(c) ? `Pausar ${c.title}` : `Reproduzir ${c.title}`}
      onClick={(e) => { e.stopPropagation(); playCollection(c); }}>
      {isOn(c) ? I.pause : I.play}
    </button>
  );

  const card = (c: Collection, key: string, round?: boolean) => (
    <div key={key} className={`sp-card${ctx === c.id ? " current" : ""}`} onClick={() => go({ kind: "collection", id: c.id })}>
      <div className="sp-card-art">
        <Cover c={c} round={round} />
        {c.label && <span className="sp-mixlabel" style={{ background: c.label.color }}>{c.label.text}</span>}
        {c.kind === "mix" && <span className="sp-badge" style={{ background: c.label?.color }} />}
        {playBtn(c)}
      </div>
      {c.kind !== "mix" && <p className="sp-card-t">{c.title}</p>}
      <p className="sp-card-s">{c.sub}</p>
    </div>
  );

  const section = (title: string, children: React.ReactNode, pre?: string, avatar?: string) => (
    <section className="sp-sec">
      <div className="sp-sec-h">
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="sp-sec-av" src={avatar} alt="" />
        )}
        <div>
          {pre && <p className="sp-pre">{pre}</p>}
          <h3>{title}</h3>
        </div>
        <button type="button" className="sp-more">Mostrar tudo</button>
      </div>
      <div className="sp-row">{children}</div>
    </section>
  );

  let main: React.ReactNode;
  if (view.kind === "collection") {
    const c = findCol(view.id);
    const tracks = c.tracks.map(findTrack);
    main = (
      <div className="sp-page" style={{ "--tint": c.tint } as React.CSSProperties}>
        <header className="sp-hero">
          <Cover c={c} round={c.kind === "artist"} />
          <div>
            <p className="sp-hero-k">{c.kind === "artist" ? "Artista" : c.kind === "single" ? "Single" : "Playlist"}</p>
            <h2>{c.title}</h2>
            <p className="sp-hero-s"><b>{c.owner}</b> • {tracks.length} {tracks.length === 1 ? "música" : "músicas"}</p>
          </div>
        </header>
        <div className="sp-actions">{playBtn(c)}<button type="button" className="sp-icon" aria-label="Aleatório" onClick={() => setShuffle((s) => !s)} data-on={shuffle}>{I.shuffle}</button><button type="button" className="sp-icon" aria-label="Mais opções">{I.dots}</button></div>
        <ol className="sp-list">
          <li className="sp-list-h"><span>#</span><span>Título</span><span>Álbum</span><span>Duração</span></li>
          {tracks.map((t, i) => {
            const cur = ctx === c.id && queue[idx] === t.id;
            return (
              <li key={t.id + i} className={cur ? "cur" : undefined} onDoubleClick={() => playCollection(c, i)}>
                <span className="n">{cur && playing ? <Eq /> : <><b>{i + 1}</b><button type="button" aria-label={`Reproduzir ${t.title}`} onClick={() => playCollection(c, i)}>{cur && playing ? I.pause : I.play}</button></>}</span>
                <span className="tt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.cover} alt="" />
                  <span><b>{t.title}</b><small>{t.artist}</small></span>
                </span>
                <span className="al">{c.title}</span>
                <span className="du">{fmt(t.dur)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  } else if (view.kind === "search") {
    const s = view.q.toLowerCase();
    const hits = TRACKS.filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(s));
    const cols = all.filter((c, i, a) => a.findIndex((d) => d.id === c.id) === i && c.title.toLowerCase().includes(s));
    main = (
      <div className="sp-page sp-search">
        <h3>Músicas</h3>
        {hits.length === 0 && <p className="sp-empty">Nenhum resultado para “{view.q}”</p>}
        <ol className="sp-list compact">
          {hits.map((t) => {
            const cur = queue[idx] === t.id;
            return (
              <li key={t.id} className={cur ? "cur" : undefined} onDoubleClick={() => playTrack(t)}>
                <span className="tt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.cover} alt="" />
                  <button type="button" className="ov" aria-label={`Reproduzir ${t.title}`} onClick={() => playTrack(t)}>{cur && playing ? I.pause : I.play}</button>
                  <span><b>{t.title}</b><small>{t.artist}</small></span>
                </span>
                <span className="du">{fmt(t.dur)}</span>
              </li>
            );
          })}
        </ol>
        {cols.length > 0 && section("Playlists", cols.slice(0, 8).map((c) => card(c, c.id)))}
      </div>
    );
  } else {
    main = (
      <div className="sp-page sp-homepage" style={{ "--tint": hoverTint ?? "#5038a0" } as React.CSSProperties}>
        <div className="sp-chips">
          {["Tudo", "Música", "Podcasts", "Audiolivros"].map((c, i) => <button key={c} type="button" className={i === 0 ? "on" : undefined}>{c}</button>)}
        </div>
        <div className="sp-short" onMouseLeave={() => setHoverTint(null)}>
          {SHORTCUTS.map((c) => (
            <div key={c.id} className={`sp-sc${ctx === c.id ? " current" : ""}`} onMouseOver={() => { if (hoverTint !== c.tint) setHoverTint(c.tint); }} onClick={() => go({ kind: "collection", id: c.id })}>
              <Cover c={c} />
              <p>{c.title}</p>
              {isOn(c) && <Eq />}
              {playBtn(c, "sm")}
            </div>
          ))}
        </div>

        <div className="sp-duo">
          <section className="sp-new">
            <div className="sp-sec-h">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="sp-sec-av" src={NEW_RELEASE.cover} alt="" />
              <div><p className="sp-pre">Novo lançamento de</p><h3>{NEW_RELEASE.artist}</h3></div>
            </div>
            <div className="sp-new-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="sp-new-art" src={NEW_RELEASE.cover} alt="" onClick={() => go({ kind: "collection", id: NEW_SINGLE.id })} />
              <div>
                <p className="sp-new-k">Single • {NEW_RELEASE.artist}</p>
                <p className="sp-new-t">{NEW_RELEASE.title}</p>
                <div className="sp-new-a">
                  <button type="button" className="sp-wplay" aria-label={`Reproduzir ${NEW_RELEASE.title}`} onClick={() => playCollection(NEW_SINGLE)}>{isOn(NEW_SINGLE) ? I.pause : I.play}</button>
                  <button type="button" className="sp-icon" aria-label="Guardar na biblioteca">{I.addCircle}</button>
                </div>
              </div>
            </div>
          </section>
          {section("As tuas mixes mais ouvidas", MIXES.map((c) => card(c, c.id)))}
        </div>

        {section("Recentes", RECENT.map((c) => card(c, c.id + "r", c.kind === "artist")))}
        {section(MORE_LIKE_OF, MORE_LIKE.filter((c) => !c.owner.includes(MORE_LIKE_OF)).map((c) => card(c, c.id)), "Mais como", TRACKS[1].cover)}
      </div>
    );
  }

  const style: React.CSSProperties = max
    ? { left: 0, top: 0, width: "100vw", height: "100dvh", zIndex: z }
    : { left: x, top: y, width: w, height: h, zIndex: z };

  return (
    <div className={`win music${closing ? " is-closing" : ""}${dragging ? " is-dragging" : ""}${max ? " is-max" : ""}`} style={{ ...style, display: hidden ? "none" : undefined }}
      onPointerDown={() => onFocus(id)} role="dialog" aria-label="Spotify">
      <header className="sp-top" {...handlers} onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest("button, input")) setMax((m) => !m); }}>
        <div className="sp-top-l">
          <button type="button" className="sp-icon" aria-label="Menu">{I.dots}</button>
          <button type="button" className="sp-icon" aria-label="Recuar" disabled={hist.i === 0} onClick={() => setHist((h) => ({ ...h, i: Math.max(0, h.i - 1) }))}>{I.back}</button>
          <button type="button" className="sp-icon" aria-label="Avançar" disabled={hist.i >= hist.list.length - 1} onClick={() => setHist((h) => ({ ...h, i: Math.min(h.list.length - 1, h.i + 1) }))}>{I.fwd}</button>
        </div>
        <div className="sp-top-c">
          <button type="button" className="sp-home" aria-label="Início" data-on={view.kind === "home"} onClick={() => { setQ(""); go({ kind: "home" }); }}>{I.home}</button>
          <form className="sp-search-box" role="search" onSubmit={(e) => e.preventDefault()}>
            {I.search}
            <input value={q} placeholder="O que queres ouvir?" aria-label="O que queres ouvir?"
              onChange={(e) => {
                const v = e.target.value; setQ(v);
                setHist((h) => {
                  const cur = h.list[h.i];
                  if (!v) return cur.kind === "search" ? { list: [...h.list.slice(0, h.i + 1), { kind: "home" }], i: h.i + 1 } : h;
                  if (cur.kind === "search") return { list: [...h.list.slice(0, h.i), { kind: "search", q: v }], i: h.i };
                  return { list: [...h.list.slice(0, h.i + 1), { kind: "search", q: v }], i: h.i + 1 };
                });
              }} />
            {q && <button type="button" className="sp-icon" aria-label="Limpar pesquisa" onClick={() => { setQ(""); go({ kind: "home" }); }}>{I.x}</button>}
            <span className="sp-div" />
            <button type="button" className="sp-icon" aria-label="Explorar">{I.browse}</button>
          </form>
        </div>
        <div className="sp-top-r">
          <button type="button" className="sp-icon" aria-label="Novidades">{I.bell}</button>
          <button type="button" className="sp-icon" aria-label="Vista A tocar" data-on={friends} onClick={() => setFriends((f) => !f)}>{I.friends}</button>
          <span className="sp-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TRACKS[0].cover} alt={ARTIST} />
          </span>
          <button type="button" className="sp-wc" aria-label="Minimizar" onClick={onMinimize}>{I.min}</button>
          <button type="button" className="sp-wc" aria-label={max ? "Restaurar" : "Maximizar"} onClick={() => setMax((m) => !m)}>{I.max}</button>
          <button type="button" className="sp-wc close" aria-label="Fechar" onClick={() => onClose(id)}>{I.close}</button>
        </div>
      </header>

      <div className="sp-body">
        <nav className="sp-rail" aria-label="A tua biblioteca">
          <button type="button" className="sp-icon" aria-label="A tua biblioteca">{I.lib}</button>
          <button type="button" className="sp-icon sp-new-pl" aria-label="Criar">{I.plus}</button>
          {LIBRARY.map((c) => (
            <button key={c.id} type="button" className={`sp-rail-i${ctx === c.id ? " cur" : ""}`} aria-label={c.title} onClick={() => go({ kind: "collection", id: c.id })}>
              <Cover c={c} />
            </button>
          ))}
        </nav>

        <main className="sp-main" key={hist.i}>{main}</main>

        {friends && (() => {
          // "A tocar" panel (Now playing view), laid out from the user's screenshot. Spotify shows a
          // lyrics preview in the blue card; lyrics are copyrighted, so it shows the queue instead.
          const ctxTitle = ctx ? findCol(ctx).title : LIKED.title;
          const nextUp = [1, 2, 3].map((k) => queue[(idx + k) % queue.length]).filter((v, i, a) => v !== track.id && a.indexOf(v) === i).map(findTrack);
          const main0 = track.artist.split(", ")[0];
          const related = [...TRACKS.filter((t) => t.id !== track.id && t.artist.includes(main0)), ...TRACKS.filter((t) => t.id !== track.id && !t.artist.includes(main0))].slice(0, 2);
          const count = TRACKS.filter((t) => t.artist.includes(main0)).length;
          return (
            <aside className="sp-np" aria-label="A tocar">
              <div className="sp-np-h"><h3>{ctxTitle}</h3><button type="button" className="sp-icon" aria-label="Fechar" onClick={() => setFriends(false)}>{I.x}</button></div>
              <div className="sp-np-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp-np-art" src={track.cover} alt="" />
                <div className="sp-np-t">
                  <div><p className="t">{track.title}</p><p className="a">{track.artist}</p></div>
                  <span className="sp-saved">{I.check}</span>
                </div>
                <div className="sp-np-card sp-np-queue" style={{ "--tint": track.tint } as React.CSSProperties}>
                  <p className="h">A seguir na fila</p>
                  {nextUp.map((t) => <button key={t.id} type="button" onClick={() => setIdx(queue.indexOf(t.id))}>{t.title}</button>)}
                </div>
                <p className="sp-np-sh">Mais de {main0}{related.some((t) => !t.artist.includes(main0)) ? " e semelhantes" : ""}</p>
                <div className="sp-np-rel">
                  {related.map((t) => (
                    <button key={t.id} type="button" onClick={() => playTrack(t)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.cover} alt="" />
                      <b>{t.title}</b>
                      <small>{t.artist}</small>
                    </button>
                  ))}
                </div>
                <div className="sp-np-card sp-np-artist" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.65)), url(${related[0]?.cover ?? track.cover})` }}>
                  <p className="h">Perfil de artista</p>
                  <p className="n">{main0}</p>
                  <p className="c">{count} {count === 1 ? "música" : "músicas"} nesta biblioteca</p>
                </div>
              </div>
            </aside>
          );
        })()}
      </div>

      <footer className="sp-bar">
        <div className="sp-now">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.cover} alt="" />
          <div>
            <p className="t">{track.title}</p>
            <p className="a">{track.artist}</p>
            <p className="q">{missing ? "MP3 ainda não adicionado" : "Qualidade original"}</p>
          </div>
          <span className="sp-saved">{I.check}</span>
        </div>
        <div className="sp-ctl">
          <div className="sp-btns">
            <button type="button" className="sp-icon" aria-label="Aleatório" data-on={shuffle} onClick={() => setShuffle((s) => !s)}>{I.shuffle}</button>
            <button type="button" className="sp-icon" aria-label="Anterior" onClick={prev}>{I.prev}</button>
            <button type="button" className="sp-pp" aria-label={playing ? "Pausa" : "Reproduzir"} onClick={() => { if (!ctx) playCollection(LIKED); else setPlaying((p) => !p); }}>{playing ? I.pause : I.play}</button>
            <button type="button" className="sp-icon" aria-label="Seguinte" onClick={() => next()}>{I.next}</button>
            <button type="button" className="sp-icon" aria-label="Repetir" data-on={repeat > 0} data-one={repeat === 2} onClick={() => setRepeat((r) => ((r + 1) % 3) as 0 | 1 | 2)}>{I.repeat}</button>
          </div>
          <div className="sp-prog">
            <span>{fmt(time)}</span>
            <div className="sp-range" style={{ "--p": dur ? time / dur : 0 } as React.CSSProperties}
              onPointerDown={(e) => seek(e, (f) => { const a = audio.current; if (a && Number.isFinite(a.duration) && a.duration > 0) { a.currentTime = f * a.duration; setTime(f * a.duration); } })}>
              <i />
            </div>
            <span>{fmt(dur)}</span>
          </div>
        </div>
        <div className="sp-extra">
          <button type="button" className="sp-icon" aria-label="Letra">{I.lyrics}</button>
          <button type="button" className="sp-icon" aria-label="Fila">{I.queue}</button>
          <button type="button" className="sp-icon" aria-label="Ligar a um dispositivo">{I.device}</button>
          <button type="button" className="sp-icon" aria-label={muted ? "Ativar som" : "Desativar som"} onClick={() => setMuted((m) => !m)}>{muted || vol === 0 ? I.mute : I.vol}</button>
          <div className="sp-range vol" style={{ "--p": muted ? 0 : vol } as React.CSSProperties} onPointerDown={(e) => seek(e, (f) => { setVol(f); setMuted(false); })}><i /></div>
          <button type="button" className="sp-icon" aria-label="Mini-leitor">{I.mini}</button>
          <button type="button" className="sp-icon" aria-label="Ecrã inteiro" onClick={() => setMax((m) => !m)}>{I.full}</button>
        </div>
        <audio ref={audio} src={track.src} preload="metadata"
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onEnded={() => next(true)}
          onError={() => { setMissing(true); setPlaying(false); }} />
      </footer>
    </div>
  );
}
