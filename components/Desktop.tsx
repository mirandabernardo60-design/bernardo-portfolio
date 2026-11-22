"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { ALERTS, PDFS, projects, type AppId } from "@/lib/content";
import { asset } from "@/lib/asset";
import { Dock } from "./Dock";
import { Alert } from "./Alert";
import { Window, type WinKind } from "./Window";

type Win = { key: string; kind: WinKind; z: number; x: number; y: number; w: number; h: number; closing?: boolean };
const CLOSE_MS = 210;
type AlertKey = keyof typeof ALERTS;

// Window spots measured on the reference at 1440×900 (left, top as fractions), reused per item.
const SPOTS: [number, number][] = [
  [677 / 1440, 20 / 900],
  [169 / 1440, 69 / 900],
  [463 / 1440, 138 / 900],
  [548 / 1440, 141 / 900],
  [659 / 1440, 117 / 900],
];
const FIXED_SPOT: Record<string, [number, number]> = {
  notes: [659 / 1440, 117 / 900],
  pdf: [659 / 1440, 20 / 900],
  gallery: [463 / 1440, 138 / 900],
  bin: [548 / 1440, 141 / 900],
};

function windowSize(vw: number, kind: WinKind) {
  // The PDF window is portrait so a full A4 page fits (same chrome as the other windows).
  if (kind === "pdf") {
    const vh = window.innerHeight;
    const maxH = Math.min(Math.max(vh - 140, 420), 880);
    const w = Math.min(Math.round((maxH - 41) / 1.414) + 20, vw - 20);
    // Fit the height to one A4 page at that width (title bar 31 + 10 px bottom margin).
    return { w, h: Math.min(maxH, Math.round((w - 20) * 1.414) + 41) };
  }
  if (vw < 810) return { w: 293, h: 506 };
  return { w: 576, h: kind === "notes" ? 500 : 540 };
}

const DRAG_THRESHOLD = 3;

export function Desktop() {
  const [offsets, setOffsets] = useState<Record<string, [number, number]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [lifted, setLifted] = useState<string | null>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [alerts, setAlerts] = useState<{ id: AlertKey; dx: number; dy: number }[]>([]);
  const zRef = useRef(10);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  const open = useCallback((key: string, kind: WinKind) => {
    zRef.current += 1;
    const z = zRef.current;
    setWins((ws) => {
      const found = ws.find((w) => w.key === key);
      if (found) return ws.map((w) => (w.key === key ? { ...w, z, closing: false } : w));
      const vw = window.innerWidth, vh = window.innerHeight;
      const { w, h } = windowSize(vw, kind);
      const idx = kind === "project" ? Number(key.slice(1)) : 0;
      const [fx, fy] = FIXED_SPOT[kind] ?? SPOTS[idx % SPOTS.length];
      // PDF windows cascade (40 px each) so the three CVs don't open exactly on top of each other.
      const step = kind === "pdf" ? Math.max(0, Object.keys(PDFS).indexOf(key)) * 40 : 0;
      const x = Math.round(Math.min(Math.max(10, fx * vw - step), Math.max(10, vw - w - 10)));
      const y = Math.round(Math.min(Math.max(10, fy * vh + step), Math.max(10, vh - h - 10)));
      return [...ws, { key, kind, z, x, y, w, h }];
    });
  }, []);

  // Measured on the reference: the window scales to .5 and fades out in ~200 ms, then is removed.
  const close = useCallback((key: string) => {
    setWins((ws) => ws.map((w) => (w.key === key ? { ...w, closing: true } : w)));
    window.setTimeout(() => setWins((ws) => ws.filter((w) => !(w.key === key && w.closing))), CLOSE_MS);
  }, []);
  const focus = useCallback((key: string) => {
    zRef.current += 1;
    const z = zRef.current;
    setWins((ws) => ws.map((w) => (w.key === key ? { ...w, z } : w)));
  }, []);
  // Windows and alerts drag 1:1 with the pointer, without limits (measured on the reference).
  const moveWin = useCallback((key: string, dx: number, dy: number) => {
    setWins((ws) => ws.map((w) => (w.key === key ? { ...w, x: w.x + dx, y: w.y + dy } : w)));
  }, []);
  const focusAlert = useCallback((id: AlertKey) => {
    setAlerts((a) => (a[a.length - 1]?.id === id ? a : [...a.filter((x) => x.id !== id), a.find((x) => x.id === id)!]));
  }, []);
  const moveAlert = useCallback((id: AlertKey, dx: number, dy: number) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, dx: x.dx + dx, dy: x.dy + dy } : x)));
  }, []);

  const onApp = useCallback(
    (id: AppId) => {
      if (id === "motion" || id === "pixel" || id === "vector" || id === "error") {
        setAlerts((a) => { const cur = a.find((x) => x.id === id); return [...a.filter((x) => x.id !== id), cur ?? { id, dx: 0, dy: 0 }]; });
      } else if (id === "notes") open("cv", "pdf");
      else if (id === "pdf1") open("cv1", "pdf");
      else if (id === "pdf2") open("cv2", "pdf");
      else if (id === "photos") open("gallery", "gallery");
      else if (id === "bin") open("bin", "bin");
    },
    [open],
  );

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const [ox, oy] = offsets[id] ?? [0, 0];
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox, oy, moved: false };
    setSelected(id);
    setLifted(id);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setOffsets((o) => ({ ...o, [d.id]: [d.ox + dx, d.oy + dy] }));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) open(d.id, "project");
  };

  return (
    <main className="desk">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* User-supplied "Hire me *Pls" background (2000×738). Earlier portrait: public/bg-photo.webp; drawn stand-in: bg.svg / bg.jpg. */}
      <img className="desk-bg" src={asset("/bg-hireme.webp")} alt="" draggable={false} />
      <div className="icons" onPointerMove={onPointerMove}>
        {projects.map((p) => {
          const [ox, oy] = offsets[p.id] ?? [0, 0];
          const style = {
            "--dx": p.pos.desktop[0], "--dy": p.pos.desktop[1],
            "--tx": p.pos.tablet[0], "--ty": p.pos.tablet[1],
            "--mx": p.pos.mobile[0], "--my": p.pos.mobile[1],
            "--ox": `${ox}px`, "--oy": `${oy}px`,
            "--iw": `${p.w}px`, "--ih": `${p.h}px`,
            zIndex: lifted === p.id ? 4 : undefined,
          } as CSSProperties;
          return (
            <button
              key={p.id}
              type="button"
              className={`icon${selected === p.id ? " is-selected" : ""}`}
              style={style}
              aria-label={`Open ${p.title}`}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(p.id);
                  open(p.id, "project");
                }
              }}
            >
              <span className="icon-sel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="icon-img" src={p.thumb} alt="" draggable={false} />
              </span>
              <span className="icon-label">{p.label}</span>
            </button>
          );
        })}
      </div>

      {wins.map((w) => (
        <Window key={w.key} id={w.key} kind={w.kind} x={w.x} y={w.y} z={w.z} w={w.w} h={w.h} closing={!!w.closing} onClose={close} onFocus={focus} onMove={moveWin} />
      ))}

      {alerts.map((al, i) => (
        <Alert
          key={al.id}
          id={al.id}
          z={200 + i}
          dx={al.dx}
          dy={al.dy}
          onClose={(id) => setAlerts((a) => a.filter((x) => x.id !== id))}
          onFocus={focusAlert}
          onMove={moveAlert}
        />
      ))}

      <Dock onApp={onApp} />
    </main>
  );
}
