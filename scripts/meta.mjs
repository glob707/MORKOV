import { readFileSync } from "node:fs";

export const PLUGIN_FILE = "MORKOV.plugin.js";
export const OUT_FILE = `dist/${PLUGIN_FILE}`;

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

export const version = pkg.version;

/** Fields BetterDiscord refuses to load a plugin without. */
export const REQUIRED_META = ["name", "author", "description", "version"];

export function buildMetaHeader() {
  const meta = {
    name: "MORKOV",
    author: pkg.morkov.author,
    description: "Раскладывает голоса участников звонка по стереопанораме",
    version,
  };

  // Without a GitHub repo there is nowhere to fetch updates from yet.
  const repo = pkg.morkov.githubRepo;
  if (repo) {
    meta.source = `https://github.com/${repo}`;
    meta.updateUrl = `https://github.com/${repo}/releases/latest/download/${PLUGIN_FILE}`;
  }

  const lines = Object.entries(meta).map(([key, value]) => ` * @${key} ${value}`);
  return ["/**", ...lines, " */"].join("\n");
}
