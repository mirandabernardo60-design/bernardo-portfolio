import layoutJson from "./layout.json";
import { asset } from "./asset";

export type Pos = [number, number];
export type Block =
  | { kind: "full"; src: string; ratio: number }
  | { kind: "two"; srcs: [string, string] }
  | { kind: "three"; srcs: [string, string, string] }
  | { kind: "video"; src: string; caption?: string };

export type Project = {
  id: string;
  title: string;
  label: string;
  client: string;
  type: string;
  thumb: string;
  w: number;
  h: number;
  pos: { desktop: Pos; tablet: Pos; mobile: Pos };
  text: string[];
  preview: Block[];
  credits: [string, string][];
};

type LayoutItem = { i: number; w: number; h: number; desktop: Pos; tablet: Pos; mobile: Pos };
const layout = layoutJson as LayoutItem[];

// Placeholder project names (originals replaced; see qa/known-differences.md).
const PROJECTS: [string, string, string][] = [
  ["Northwave", "Online radio", "Art Direction > Key Visual > Social Media"],
  ["Hotel Static Vinyl", "Record label", "Packaging Design > Vinyl"],
  ["Stage Visuals", "Live shows", "Video Boards > Motion > Stage Design"],
  ["Merch", "Various projects", "Merch Design > Photography"],
  ["Lumen Tour 2024", "Tour", "Key Visual > Posters > Social Media"],
  ["Tour\nAfter The End", "Tour", "Key Visual > Posters"],
  ["Roar", "Album", "Art Direction > Cover Art > Typography"],
  ["EitherOr", "Single", "Cover Art > Typography"],
  ["First Swag\nIn Town", "Album", "Cover Art > Art Direction"],
  ["wine bottlE\nLabel", "Winery", "Packaging Design > Illustration"],
  ["End Of World\nTour", "Tour", "Key Visual > Stage Design"],
  ["Slow Song Blue", "Single", "Cover Art > Photography"],
  ["Schedule", "Festival", "Graphic Design > Social Media"],
  ["Velvet", "Fashion editorial", "Styling > Photography"],
  ["lunar * Grey", "EP", "Cover Art > Typography"],
  ["NRV FF24", "Festival", "Key Visual > Event Materials"],
  ["Notebook", "Stationery", "Product Design > Illustration"],
  ["Not Just Pop", "Podcast", "Branding > Social Media"],
  ["We Are All\nThe Lumen", "Tour", "Key Visual > Merch > Posters"],
  ["Roar X Open", "Campaign", "Art Direction > Typography > Graphic Design > Video"],
  ["Phantasmata", "Album", "Cover Art > Art Direction"],
  ["Whisper", "Single", "Cover Art"],
  ["Foundry", "Single", "Cover Art > Photography"],
  ["WTF", "Single", "Cover Art > Typography"],
  ["Interlude", "EP", "Cover Art > Art Direction"],
  ["Never Let Go", "Single", "Cover Art > Photography"],
  ["ephemera", "Album", "Cover Art > Packaging Design"],
];

const TEXT = [
  "This one started as a short brief and turned into a whole visual world. The goal was simple: make something people remember after the scroll.",
  "We built the look around one strong image, then pushed it through every format: covers, posters, screens and the small squares on your phone.",
  "Type, colour and photography were treated as one system, so every piece feels like part of the same story without repeating itself.",
  "Placeholder copy: the original project description is not reproduced in this reconstruction.",
];

const CV_IMAGES = 18;
export const CV_RATIO = 2000 / 1416;
const cvImage = (i: number) => asset(`/projects/cv-`) + `${String((i % CV_IMAGES) + 1).padStart(2, "0")}`;

const CREDITS: [string, string][] = [
  ["Art Direction:", "Nova Arlen"],
  ["Photography:", "Name Surname"],
  ["Styling:", "Name Surname"],
  ["Make-up:", "Name Surname"],
  ["Project Manager:", "Name Surname"],
  ["Special Thanks:", "Everyone on set"],
];

export const projects: Project[] = PROJECTS.map(([title, client, type], i) => ({
  id: `p${i}`,
  title: title.replace("\n", " "),
  label: title,
  client,
  type,
  // The user's 18 CV colourways (A4, 1416×2000) are the icon pictures; 27 icons, so 9 repeat.
  thumb: `${cvImage(i)}-thumb.jpg`,
  w: 60,
  h: 85,
  pos: { desktop: layout[i].desktop, tablet: layout[i].tablet, mobile: layout[i].mobile },
  text: TEXT.slice(0, 2 + (i % 3)),
  // Only the user's CV pictures: no placeholder art.
  preview: [{ kind: "full", src: `${cvImage(i)}.webp`, ratio: CV_RATIO }],
  credits: CREDITS.slice(0, 3 + (i % 4)),
}));

export const OWNER = { name: "Nova Arlen", email: "hello@example.com", social: "https://example.com/social" };

export const NOTES = {
  intro:
    "Art Director, Graphic Designer, Photographer, and sometimes a Stylist, but honestly, I do more than that. Put simply, I turn ideas into visuals and look after everything that makes a project come together in the end.",
  canDo: [
    "Anything",
    "Art Direction",
    "Creative Direction",
    "Artwork (album covers, merch, posters, packaging design, video boards)",
    "Key Visual design (artist, tour, brand, album, festival)",
    "EP, single covers",
    "Posters",
    "Web",
    "Clothing design",
    "Social media design",
    "Collaborations with music platforms",
    "Event materials and visual design",
    "Social media content",
  ],
  sidebar: [
    ["About me", "18"],
    ["CV", "48"],
    ["Interests", "∞"],
  ] as [string, string][],
};

export const GALLERY = {
  title: "Gallery",
  subtitle: "Lowkey documentation",
  images: Array.from({ length: CV_IMAGES }, (_, k) => `${cvImage(k)}.webp`),
};
export const BIN = {
  title: "Bin of ideas",
  subtitle: "Unused yet cool selection",
  items: [12, 13, 14, 15].map((k) => ({ src: `${cvImage(k)}.webp`, caption: `Unused colourway ${k - 11}` })),
};

export type AppId = "motion" | "pixel" | "vector" | "error" | "notes" | "pdf1" | "pdf2" | "photos" | "social" | "mail" | "bin";

// The user's PDFs, opened from the dock's PDF icons. Keys are the window keys.
export const PDFS: Record<string, { file: string; name: string; app: AppId }> = {
  cv: { file: asset("/cv_miranda_final.pdf"), name: "cv_miranda_final.pdf", app: "notes" },
};

export const ALERTS: Record<"motion" | "pixel" | "vector" | "error", { app: string; text: string; button: string; at: Pos }> = {
  motion: { app: "Adobe After Effects", text: "Cleaned up your footage folder? Too bad, now nothing links to those layers and clips anymore!", button: "This is too much", at: [46, 36] },
  pixel: { app: "Adobe Photoshop", text: "I won't save this file, there's not enough memory, even after you cleaned up before starting. No auto-save? Pity…", button: "Start from scratch", at: [51, 40] },
  vector: { app: "Adobe Illustrator", text: "No, I will not join these shapes the way you want, and I won't explain why.", button: "Fine", at: [48, 50] },
  error: { app: "Adobe Error", text: "The designer just lost his mind. Shame there was no backup drive.", button: "Give up and go cry", at: [55, 55] },
};
