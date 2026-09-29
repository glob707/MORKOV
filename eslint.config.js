import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const noNetwork = "MARKVI makes no network requests (NFR-2).";

export default defineConfig(
  { ignores: ["dist/", "node_modules/", ".claude/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: noNetwork },
        { name: "XMLHttpRequest", message: noNetwork },
        { name: "WebSocket", message: noNetwork },
        { name: "EventSource", message: noNetwork },
      ],
    },
  },
);
