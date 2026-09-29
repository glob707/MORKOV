// Guards the promises from docs/PROJECT_DEFINITION.md that a unit test cannot:
// valid BetterDiscord header, no network calls (NFR-2), no runtime deps (NFR-4).
import { readFileSync } from "node:fs";
import { OUT_FILE, REQUIRED_META } from "./meta.mjs";

const bundle = readFileSync(OUT_FILE, "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const problems = [];

const header = bundle.match(/^\/\*\*\n([\s\S]*?)\n \*\//);
if (!header) {
  problems.push("bundle does not start with a /** meta header */");
} else {
  for (const field of REQUIRED_META) {
    if (!new RegExp(`^ \\* @${field} \\S`, "m").test(header[1])) {
      problems.push(`meta header is missing @${field}`);
    }
  }
}

const forbidden = [
  [/\bfetch\s*\(/, "fetch()"],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bEventSource\b/, "EventSource"],
  [/\bsendBeacon\b/, "navigator.sendBeacon"],
  [/require\(\s*["'](?:node:)?(?:http|https|net|tls|dgram)["']\s*\)/, "Node network module"],
];
for (const [pattern, name] of forbidden) {
  if (pattern.test(bundle)) problems.push(`network call found in bundle: ${name}`);
}

if (Object.keys(pkg.dependencies ?? {}).length > 0) {
  problems.push("package.json has runtime dependencies; everything must be a devDependency");
}

if (!bundle.trimEnd().endsWith("module.exports = module.exports.default;")) {
  problems.push("bundle does not export the plugin class as module.exports");
}

if (problems.length > 0) {
  console.error(`${OUT_FILE} failed checks:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`${OUT_FILE} passed checks`);
