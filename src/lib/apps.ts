import fs from "fs";
import path from "path";

export interface AppMeta {
  slug: string;
  name: string;
  description?: string;
  tags?: string[];
}

function loadMeta(dir: string): AppMeta | null {
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  const raw = fs.readFileSync(metaPath, "utf8");
  const meta = JSON.parse(raw);
  return { slug: path.basename(dir), ...meta } as AppMeta;
}

const appsDir = path.join(process.cwd(), "apps");
export const allApps: AppMeta[] = fs.existsSync(appsDir)
  ? fs
      .readdirSync(appsDir)
      .map((slug) => loadMeta(path.join(appsDir, slug)))
      .filter((m): m is AppMeta => !!m)
  : [];
