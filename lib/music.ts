import { asset } from "./asset";

// Music app (dock icon "Spotify"). The songs are placeholders until the MP3s arrive:
// drop the files in public/music/ and set each track's title and file below.
export const ARTIST = "Bernardo Miranda";

const pad = (n: number) => String(n).padStart(2, "0");
// Square covers cut from the user's 18 CV colourways (public/music/covers).
export const cover = (n: number) => asset(`/music/covers/c-${pad(((n - 1) % 18) + 1)}.jpg`);
// Main colour of each cover (dominant pixel colour; black covers use Spotify's grey).
const TINTS = ["#309030", "#535353", "#535353", "#1010f0", "#b0b0b0", "#1010f0", "#b3b3b3", "#b3b3b3", "#b3b3b3", "#b3b3b3", "#f0b0d0", "#d0f0f0", "#10f0f0", "#10f030", "#f0f010", "#f01070", "#b3b3b3", "#f0f010"];
export const tint = (n: number) => TINTS[(n - 1) % 18];

export type Track = { id: string; title: string; artist: string; src: string; cover: string; tint: string };

export const TRACKS: Track[] = Array.from({ length: 8 }, (_, i) => ({
  id: `t${i + 1}`,
  title: `Song ${i + 1}`,
  artist: ARTIST,
  src: asset(`/music/song-${pad(i + 1)}.mp3`),
  cover: cover(i + 1),
  tint: tint(i + 1),
}));
const ALL = TRACKS.map((t) => t.id);
const rot = (k: number) => [...ALL.slice(k), ...ALL.slice(0, k)];

export type Collection = {
  id: string;
  title: string;
  sub: string;
  kind: "liked" | "playlist" | "artist" | "mix" | "single";
  cover: string;
  tint: string;
  tracks: string[];
  label?: { text: string; color: string };
};

const col = (id: string, title: string, sub: string, kind: Collection["kind"], n: number, tracks: string[], label?: Collection["label"]): Collection => ({
  id, title, sub, kind, cover: cover(n), tint: kind === "liked" ? "#5038a0" : tint(n), tracks, label,
});

export const LIKED = col("liked", "Músicas de que gostaste", "Playlist • Bernardo Miranda", "liked", 1, ALL);

export const SHORTCUTS: Collection[] = [
  LIKED,
  col("hire", "Hire me *Pls", "Playlist • Bernardo Miranda", "playlist", 15, rot(1)),
  col("motion", "Motion Designer", "Playlist • Bernardo Miranda", "playlist", 13, rot(2)),
  col("editor", "Video Editor", "Playlist • Bernardo Miranda", "playlist", 4, rot(3)),
  col("artist", ARTIST, "Artista", "artist", 1, ALL),
  col("designer", "Designer", "Playlist • Bernardo Miranda", "playlist", 16, rot(4)),
  col("lisboa", "Lisboa à noite", "Playlist • Bernardo Miranda", "playlist", 2, rot(5)),
  col("estudio", "Estúdio", "Playlist • Bernardo Miranda", "playlist", 11, rot(6)),
];

export const NEW_RELEASE = TRACKS[0];

export const MIXES: Collection[] = [
  col("mix-house", "Mix de House", "Bernardo Miranda, Song 2, Song 5 e mais", "mix", 18, rot(1), { text: "Mix de House", color: "#f0f046" }),
  col("mix-calm", "Mix tranquila", "Song 3, Song 7, Bernardo Miranda e mais", "mix", 6, rot(2), { text: "Mix tranquila", color: "#7fb3f5" }),
  col("mix-hiphop", "Mix de Hip-hop", "Song 4, Song 1, Song 8 e mais", "mix", 3, rot(3), { text: "Mix de Hip-hop", color: "#f2c6f2" }),
  col("mix-pop", "Mix de Pop", "Bernardo Miranda, Song 6 e mais", "mix", 16, rot(4), { text: "Mix de Pop", color: "#f7b3a5" }),
  col("mix-lofi", "Mix de Lo-fi", "Song 2, Song 8, Song 5 e mais", "mix", 12, rot(5), { text: "Mix de Lo-fi", color: "#cfc8f7" }),
  col("mix-indie", "Mix de Indie", "Song 6, Song 3 e mais", "mix", 14, rot(6), { text: "Mix de Indie", color: "#a8e6b4" }),
];

export const RECENT: Collection[] = [
  { ...LIKED, title: "Músicas apreciadas", sub: "Playlist • Spotify" },
  SHORTCUTS[1],
  { ...SHORTCUTS[4], sub: "Artista" },
  SHORTCUTS[2],
  SHORTCUTS[3],
  SHORTCUTS[5],
  SHORTCUTS[6],
  SHORTCUTS[7],
];

export const MORE_LIKE: Collection[] = TRACKS.map((t, i) => col(`more-${t.id}`, t.title, `Single • ${t.artist}`, "single", i + 9, rot(i)));

// "Atividade de audição": made-up friends listening to the user's songs (no real people).
export const FRIENDS = [
  ["Inês", 0, "3 min", "Hire me *Pls"],
  ["Tiago", 3, "3 min", "Motion Designer"],
  ["Marta", 1, "56 min", "Lisboa à noite"],
  ["rui.costa", 5, "1 h", "Mix tranquila"],
  ["Joana", 2, "2 h", "Estúdio"],
  ["Duarte", 6, "5 h", "Video Editor"],
  ["Beatriz", 4, "8 h", "Designer"],
  ["sofia.m", 7, "22 h", "Mix de Pop"],
  ["Pedro", 1, "1 d", "Músicas apreciadas"],
  ["Miguel", 3, "1 d", "Mix de House"],
  ["Carolina", 5, "2 d", "Hire me *Pls"],
].map(([name, t, ago, from], i) => ({ name: name as string, track: TRACKS[t as number], ago: ago as string, from: from as string, avatar: cover(i + 4) }));

// Left rail of the library (covers only, like the reference).
export const LIBRARY: Collection[] = [LIKED, ...SHORTCUTS.slice(1), ...MIXES.slice(0, 4), ...MORE_LIKE.slice(0, 4)];

export const findTrack = (id: string) => TRACKS.find((t) => t.id === id)!;
