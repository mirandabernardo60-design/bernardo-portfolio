// Prefix for files in public/. Empty locally; "/bernardo-portfolio" on GitHub Pages
// (set by NEXT_PUBLIC_BASE_PATH in the Pages workflow).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (p: string) => `${BASE_PATH}${p}`;
