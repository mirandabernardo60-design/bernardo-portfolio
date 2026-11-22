"use client";

import { ALERTS } from "@/lib/content";
import { AppIcon } from "./AppIcons";
import { useDrag } from "./useDrag";

type Key = keyof typeof ALERTS;

type Props = {
  id: Key;
  z: number;
  dx: number;
  dy: number;
  onClose: (id: Key) => void;
  onFocus: (id: Key) => void;
  onMove: (id: Key, dx: number, dy: number) => void;
};

export function Alert({ id, z, dx, dy, onClose, onFocus, onMove }: Props) {
  const a = ALERTS[id];
  const { dragging, handlers } = useDrag((mx, my) => onMove(id, mx, my));
  return (
    <div
      className={`alert${dragging ? " is-dragging" : ""}`}
      role="alertdialog"
      aria-label={a.app}
      {...handlers}
      onPointerDown={(e) => { onFocus(id); handlers.onPointerDown(e); }}
      style={{
        // Measured spot on desktop; clamped so the dialog stays on screen on narrow viewports.
        // Dragging adds a free offset (no limits, like the reference).
        left: `calc(clamp(calc(var(--aw) / 2 + 10px), ${a.at[0]}%, calc(100% - var(--aw) / 2 - 10px)) + ${dx}px)`,
        top: `calc(${a.at[1]}% + ${dy}px)`,
        zIndex: z,
      }}
    >
      <p className="alert-title">{a.app}</p>
      <div className="alert-body">
        <AppIcon id={id} />
        <div>
          <p className="alert-text">{a.text}</p>
          <button type="button" className="alert-btn" onClick={() => onClose(id)}>
            {a.button}
          </button>
        </div>
      </div>
    </div>
  );
}
