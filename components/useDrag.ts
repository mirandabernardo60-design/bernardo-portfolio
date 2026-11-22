"use client";

import { useRef, useState } from "react";

// Pointer drag measured on the reference windows and alerts: grab from anywhere, follows the
// pointer 1:1, no momentum and no edge limits; buttons and links inside keep working.
export function useDrag(onMove: (dx: number, dy: number) => void, onStart?: () => void) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("button, a, input, textarea")) return;
    // Leave the scrollbar of a scrolling body to the browser.
    if (t.scrollHeight > t.clientHeight && e.nativeEvent.offsetX > t.clientWidth) return;
    // On touch, let the window body scroll; drag from the title bar only.
    if (e.pointerType === "touch" && !t.closest(".win-bar, .sp-top, .alert-title")) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onStart?.();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!dragging && Math.hypot(dx, dy) < 2) return;
    if (!dragging) setDragging(true);
    s.x = e.clientX; s.y = e.clientY;
    onMove(dx, dy);
  };
  const end = () => { start.current = null; setDragging(false); };

  return { dragging, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}
