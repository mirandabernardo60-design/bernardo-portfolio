// Dock / alert app icons: user-supplied macOS .icns icons, extracted to PNG (256 px) and trimmed
// to their visible artwork so they fill the box like the reference (41×40, Trash 37×46).
import type { AppId } from "@/lib/content";
import { asset } from "@/lib/asset";

export function AppIcon({ id }: { id: AppId }) {
  // eslint-disable-next-line @next/next/no-img-element
  // All PDF items share the PDF Document icon.
  const file = id === "pdf1" || id === "pdf2" ? "notes" : id;
  return <img className="app-icon" src={asset(`/apps/${file}.png`)} alt="" draggable={false} />;
}
