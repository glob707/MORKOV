// Copies the built plugin into the local BetterDiscord plugins folder.
import { copyFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { OUT_FILE, PLUGIN_FILE } from "./meta.mjs";

function pluginsDir() {
  switch (process.platform) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", "BetterDiscord", "plugins");
    case "win32":
      return join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "BetterDiscord", "plugins");
    default:
      return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "BetterDiscord", "plugins");
  }
}

const dir = pluginsDir();
if (!existsSync(dir)) {
  console.error(`BetterDiscord plugins folder not found: ${dir}`);
  process.exit(1);
}

const target = join(dir, PLUGIN_FILE);
copyFileSync(OUT_FILE, target);
console.log(`deployed to ${target}`);
