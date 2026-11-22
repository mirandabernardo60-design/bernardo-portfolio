import { asset } from "./asset";

// Music app (dock icon "Spotify"). The MP3s live in public/music/song-NN.mp3 on the user's
// computer only: they are commercial releases, so they are gitignored and never published.
export const ARTIST = "Bernardo Miranda"; // owner of the playlists

const pad = (n: number) => String(n).padStart(2, "0");
// Square covers cut from the user's 18 CV colourways (public/music/covers).
export const cover = (n: number) => asset(`/music/covers/c-${pad(((n - 1) % 18) + 1)}.jpg`);
// Main colour of each cover (dominant pixel colour; black and white covers use Spotify's greys).
const TINTS = ["#309030", "#535353", "#535353", "#1010f0", "#b0b0b0", "#1010f0", "#b3b3b3", "#b3b3b3", "#b3b3b3", "#b3b3b3", "#f0b0d0", "#d0f0f0", "#10f0f0", "#10f030", "#f0f010", "#f01070", "#b3b3b3", "#f0f010"];
export const tint = (n: number) => TINTS[(n - 1) % 18];

// Each song's own cover, taken from its MP3 (local only; the published build uses the CV covers).
const LOCAL_ART = process.env.NEXT_PUBLIC_LOCAL_ART === "1";
const ART_TINTS = ["#505050", "#90d0d0", "#5090b0", "#505050", "#b0d050", "#509070", "#907050", "#5090b0", "#505050", "#9090b0", "#905070", "#f09050", "#907050"];

export type Track = { id: string; title: string; artist: string; src: string; cover: string; tint: string; dur: number };

// [title, artist, length in s (read from the files)]
const SONGS: [string, string, number][] = [
  ["Deslocado", "NAPA", 180],
  ["Gilded Lily", "Cults", 213],
  ["Always Forever", "Cults", 224],
  ["Which Witch", "Florence + The Machine", 259],
  ["A Gira", "unfazed", 152],
  ["Oblivion", "Grimes", 251],
  ["Disparate Youth", "Santigold", 284],
  ["Spitting Off the Edge of the World", "Yeah Yeah Yeahs, Perfume Genius", 258],
  ["Never Saw The Point", "Cults", 184],
  ["Porto Côvo", "Rui Veloso", 243],
  ["Lisboa (feat. Tim)", "Tara Perdida, Tim", 193],
  ["Amanhã Tou Melhor", "Capitão Fausto", 207],
  ["1 Casa 2 Portões", "Filipe Karlsson", 153],
];

export const TRACKS: Track[] = SONGS.map(([title, artist, dur], i) => ({
  id: `t${i + 1}`, title, artist, dur,
  src: asset(`/music/song-${pad(i + 1)}.mp3`),
  cover: LOCAL_ART ? asset(`/music/art/song-${pad(i + 1)}.jpg`) : cover(i + 1),
  tint: LOCAL_ART ? ART_TINTS[i] : tint(i + 1),
}));
const ids = (...n: number[]) => n.map((i) => TRACKS[i].id);
const ALL = TRACKS.map((t) => t.id);
const firstArtists = (tr: string[]) => {
  const names = [...new Set(tr.map((id) => TRACKS.find((t) => t.id === id)!.artist.split(", ")[0]))];
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} e mais` : names.join(", ");
};

export type Collection = {
  id: string;
  title: string;
  sub: string;
  owner: string;
  kind: "liked" | "playlist" | "artist" | "mix" | "single";
  cover: string;
  tint: string;
  tracks: string[];
  label?: { text: string; color: string };
};

const col = (id: string, title: string, sub: string, kind: Collection["kind"], n: number, tracks: string[], owner = ARTIST, label?: Collection["label"]): Collection => ({
  id, title, sub, owner, kind, cover: cover(n), tint: kind === "liked" ? "#5038a0" : tint(n), tracks, label,
});
const playlist = (id: string, title: string, n: number, tracks: string[]) => col(id, title, `Playlist • ${ARTIST}`, "playlist", n, tracks);

export const LIKED = col("liked", "Músicas de que gostaste", `Playlist • ${ARTIST}`, "liked", 1, ALL);
const CULTS = { ...col("cults", "Cults", "Artista", "artist", 2, ids(1, 2, 8), "Cults"), ...(LOCAL_ART ? { cover: TRACKS[1].cover, tint: TRACKS[1].tint } : {}) };

export const SHORTCUTS: Collection[] = [
  LIKED,
  playlist("hire", "Hire me *Pls", 15, ids(6, 1, 10, 3, 0, 5, 12, 7, 2, 9, 4, 11, 8)),
  playlist("motion", "Motion Designer", 13, ids(5, 6, 7, 3)),
  playlist("editor", "Video Editor", 4, ids(2, 1, 8, 3)),
  CULTS,
  playlist("designer", "Designer", 16, ids(3, 5, 6, 7, 1)),
  playlist("lisboa", "Lisboa à noite", 2, ids(10, 9, 11, 12, 0, 4)),
  playlist("estudio", "Estúdio", 11, ids(0, 4, 11, 12, 2)),
];

export const NEW_RELEASE = TRACKS[0];

const mix = (id: string, text: string, n: number, tracks: string[], color: string) => col(id, text, firstArtists(tracks), "mix", n, tracks, "Spotify", { text, color });
export const MIXES: Collection[] = [
  mix("mix-indie", "Mix de Indie", 18, ids(1, 7, 3, 2, 8), "#f0f046"),
  mix("mix-calm", "Mix tranquila", 6, ids(1, 8, 11, 12), "#7fb3f5"),
  mix("mix-pt", "Mix de Rock Português", 3, ids(9, 10, 11, 0, 4), "#f2c6f2"),
  mix("mix-pop", "Mix de Pop", 16, ids(5, 6, 3, 0), "#f7b3a5"),
  mix("mix-alt", "Mix de Alternativa", 12, ids(7, 6, 5, 4), "#cfc8f7"),
  mix("mix-dream", "Mix de Dream Pop", 14, ids(2, 5, 1, 8), "#a8e6b4"),
];

export const RECENT: Collection[] = [
  { ...LIKED, title: "Músicas apreciadas", sub: "Playlist • Spotify" },
  SHORTCUTS[1],
  CULTS,
  SHORTCUTS[6],
  SHORTCUTS[2],
  SHORTCUTS[3],
  SHORTCUTS[5],
  SHORTCUTS[7],
];

// "Mais como Cults": the other songs, one card each.
export const MORE_LIKE_OF = "Cults";
export const MORE_LIKE: Collection[] = TRACKS.map((t, i) => ({ ...col(`single-${t.id}`, t.title, `Single • ${t.artist}`, "single", i + 1, [t.id], t.artist), cover: t.cover, tint: t.tint }));
export const NEW_SINGLE = MORE_LIKE[0];

// Left rail of the library (covers only, like the reference).
export const LIBRARY: Collection[] = [LIKED, ...SHORTCUTS.slice(1), ...MIXES.slice(0, 4), ...MORE_LIKE.slice(0, 4)];

export const findTrack = (id: string) => TRACKS.find((t) => t.id === id)!;
