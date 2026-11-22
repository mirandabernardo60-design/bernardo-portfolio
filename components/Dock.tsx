"use client";

import { Fragment } from "react";
import { OWNER, type AppId } from "@/lib/content";
import { AppIcon } from "./AppIcons";

const GROUPS: { id: AppId; name: string; href?: string }[][] = [
  [
    { id: "motion", name: "After Effects" },
    { id: "pixel", name: "Photoshop" },
    { id: "vector", name: "Illustrator" },
    { id: "error", name: "Error" },
  ],
  [
    { id: "notes", name: "CV" },
    { id: "photos", name: "Gallery" },
  ],
  [
    { id: "social", name: "Instagram", href: OWNER.social },
    { id: "mail", name: "Mail", href: `mailto:${OWNER.email}` },
  ],
  [{ id: "bin", name: "Bin of ideas" }],
];

export function Dock({ onApp }: { onApp: (id: AppId) => void }) {
  return (
    <nav className="dock" aria-label="Dock">
      <div className="dock-panel" aria-hidden />
      {GROUPS.map((g, gi) => (
        <Fragment key={gi}>
          {gi > 0 && <span className="dock-div" aria-hidden />}
          {g.map((a) =>
            a.href ? (
              <a key={a.id} className="dock-item" href={a.href} target="_blank" rel="noreferrer" aria-label={a.name}>
                <AppIcon id={a.id} />
                <span className="tip">{a.name}</span>
              </a>
            ) : (
              <button key={a.id} type="button" className={`dock-item${a.id === "bin" ? " bin" : ""}`} onClick={() => onApp(a.id)} aria-label={a.name}>
                <AppIcon id={a.id} />
                <span className="tip">{a.name}</span>
              </button>
            ),
          )}
        </Fragment>
      ))}
    </nav>
  );
}
