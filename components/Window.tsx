"use client";

import { BIN, GALLERY, NOTES, OWNER, PDFS, projects, type Block } from "@/lib/content";
import { AppIcon } from "./AppIcons";
import { useDrag } from "./useDrag";

export type WinKind = "project" | "notes" | "gallery" | "bin" | "pdf";

type Props = {
  id: string;
  kind: WinKind;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  closing: boolean;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
};

function Chrome({ title, id, onClose }: { title: string; id: string; onClose: (id: string) => void }) {
  return (
    <div className="win-bar">
      <div className="lights">
        <button type="button" className="light red" aria-label="Close window" onClick={() => onClose(id)} />
        <span className="light yellow" />
        <span className="light green" />
      </div>
      <h2 className="win-title">Information about: {title}</h2>
    </div>
  );
}

function Head({ thumb, title, sub }: { thumb: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="win-head">
      <div className="win-thumb">{thumb}</div>
      <div>
        <p className="win-h">{title}</p>
        <p className="win-sub">{sub}</p>
      </div>
    </div>
  );
}

function Img({ src, ratio }: { src: string; ratio?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="media" src={src} alt="" loading="lazy" style={ratio ? { aspectRatio: `1 / ${ratio}` } : undefined} />;
}

function Preview({ blocks }: { blocks: Block[] }) {
  return (
    <div className="preview">
      {blocks.map((b, i) => {
        if (b.kind === "full") return <Img key={i} src={b.src} ratio={b.ratio} />;
        if (b.kind === "two") return <div key={i} className="grid g2">{b.srcs.map((s) => <Img key={s} src={s} ratio={1} />)}</div>;
        if (b.kind === "three") return <div key={i} className="grid g3">{b.srcs.map((s) => <Img key={s} src={s} ratio={1} />)}</div>;
        return (
          <figure key={i} className="video">
            <Img src={b.src} ratio={0.5625} />
            <span className="play" aria-hidden />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

function Caret({ children }: { children: React.ReactNode }) {
  return (
    <p className="caret">
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
        <path d="M1 2.5 L4 5.5 L7 2.5" fill="none" stroke="#9a9a9a" strokeWidth="1.2" />
      </svg>
      {children}
    </p>
  );
}

export function Window({ id, kind, x, y, z, w, h, closing, onClose, onFocus, onMove }: Props) {
  const { dragging, handlers } = useDrag((dx, dy) => onMove(id, dx, dy));
  const cls = (closing ? " is-closing" : "") + (dragging ? " is-dragging" : "");
  const rootProps = { ...handlers, onPointerDown: (e: React.PointerEvent) => { onFocus(id); handlers.onPointerDown(e); } };
  let title = "";
  let body: React.ReactNode = null;

  if (kind === "project") {
    const p = projects.find((q) => q.id === id)!;
    title = p.title;
    body = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Head thumb={<img src={p.thumb} alt="" />} title={p.title} sub={p.client} />
        <section className="win-text">{p.text.map((t, i) => <p key={i}>{t}</p>)}</section>
        <Caret>Details:</Caret>
        <p className="detail"><span>Type:</span> {p.type}</p>
        <Caret>Preview:</Caret>
        <Preview blocks={p.preview} />
        <Caret>Credits:</Caret>
        <dl className="credits">
          {p.credits.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </>
    );
  } else if (kind === "gallery") {
    title = GALLERY.title;
    body = (
      <>
        <Head thumb={<AppIcon id="photos" />} title={GALLERY.title} sub={GALLERY.subtitle} />
        <Caret>Preview:</Caret>
        <div className="preview">{GALLERY.images.map((s, i) => <Img key={s} src={s} ratio={i % 2 ? 0.66 : 1} />)}</div>
      </>
    );
  } else if (kind === "bin") {
    title = BIN.title;
    body = (
      <>
        <Head thumb={<AppIcon id="bin" />} title={BIN.title} sub={BIN.subtitle} />
        <Caret>Preview:</Caret>
        <div className="preview">
          {BIN.items.map((it) => (
            <figure key={it.src} className="bin-item">
              <Img src={it.src} ratio={0.6} />
              <figcaption>{it.caption}</figcaption>
            </figure>
          ))}
        </div>
      </>
    );
  }

  if (kind === "pdf") {
    const CV_PDF = PDFS[id] ?? PDFS.cv;
    return (
      <div className={`win pdf${cls}`} style={{ left: x, top: y, zIndex: z, width: w, height: h }} {...rootProps} role="dialog" aria-label={CV_PDF.name}>
        <Chrome title={CV_PDF.name} id={id} onClose={onClose} />
        <div className="pdf-body">
          <iframe className="pdf-frame" src={`${CV_PDF.file}#view=FitH&toolbar=0&navpanes=0`} title={CV_PDF.name} />
        </div>
      </div>
    );
  }

  if (kind === "notes") {
    return (
      <div className={`win notes${cls}`} style={{ left: x, top: y, zIndex: z }} {...rootProps} role="dialog" aria-label={`About ${OWNER.name}`}>
        <Chrome title={`${OWNER.name}, ${OWNER.email}`} id={id} onClose={onClose} />
        <div className="notes-body">
          <ul className="notes-side">
            {NOTES.sidebar.map(([k, v], i) => (
              <li key={k} className={i === 0 ? "on" : undefined}><span>{k}</span><span className="count">{v}</span></li>
            ))}
          </ul>
          <div className="notes-pane">
            <p>{NOTES.intro}</p>
            <p>I can do…</p>
            <ul className="dots">{NOTES.canDo.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`win${cls}`} style={{ left: x, top: y, zIndex: z }} {...rootProps} role="dialog" aria-label={`Information about ${title}`}>
      <Chrome title={title} id={id} onClose={onClose} />
      <div className="win-body">{body}</div>
    </div>
  );
}
