# Nova Arlen desktop (reconstruction)

One-screen "desktop" portfolio: draggable project icons over a blurred figure, a dock, Finder-style info windows and joke alert dialogs.

## Run
```
npm install
npm run build
npm start        # http://localhost:3200 (or serve it with the Nexus `serve` command)
```

## Structure
- `app/` — layout (Inter via `next/font`), page, `globals.css` (all measured sizes, colours and animations)
- `components/Desktop.tsx` — state: icon drag offsets, selection, open windows (z-order, close animation), alerts
- `components/Window.tsx` — project / notes / gallery / bin windows
- `components/Dock.tsx`, `Alert.tsx`, `AppIcons.tsx` — dock, alerts, app icons (`public/apps/*.png`, user-supplied macOS icons)
- `lib/content.ts` — placeholder projects, copy, alerts; `lib/layout.json` — icon positions (% centre) per breakpoint
- `scripts/generate-art.mjs` — generates every image in `public/art/` and `public/bg.svg` (rendered to `public/bg.jpg`)

## Behaviour
- Hover/selected: grey box, 60 → 70 px art, blue label pill (195 ms).
- Drag an icon to move it (3 px threshold); click without moving to open its window.
- Windows open with a measured spring (366 ms) and close with a 210 ms scale-down + fade.
- Windows and alerts can be dragged from anywhere (grab / grabbing cursor, no limits); on touch, from the title bar.
- Dock tooltips: pill + arrow, 195 ms crossfade.
- The CV dock item (PDF icon) opens `public/cv_miranda_final.pdf` in an A4-sized window (set in `lib/content.ts` → `PDFS`). (Browsers that can't show PDFs inline, like most phones, show a blank or download prompt in that window.)
- Breakpoints: ≤ 1199 px tablet layout and vertical dock; ≤ 809 px mobile layout and 293×506 windows.
- Respects `prefers-reduced-motion`.
