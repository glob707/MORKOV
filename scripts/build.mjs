import { build } from "esbuild";
import { OUT_FILE, buildMetaHeader, version } from "./meta.mjs";

await build({
  entryPoints: ["src/index.ts"],
  outfile: OUT_FILE,
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2022",
  charset: "utf8",
  legalComments: "none",
  define: { __MORKOV_VERSION__: JSON.stringify(version) },
  // The meta header must be the very first thing in the file.
  banner: { js: buildMetaHeader() },
  // esbuild exposes `export default` as module.exports.default;
  // BetterDiscord expects the plugin class itself in module.exports.
  footer: { js: "module.exports = module.exports.default;" },
});

console.log(`built ${OUT_FILE} v${version}`);
