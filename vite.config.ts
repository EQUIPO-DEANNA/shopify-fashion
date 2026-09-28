// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pinned rather than auto-detected. Left alone, a production build defaults to
  // `cloudflare-module`, which emits an output layout Vercel cannot run — and the
  // failure shows up as a deploy that builds cleanly and then 404s, which is a
  // slow thing to diagnose. NITRO_PRESET still wins for a local standalone build:
  //   NITRO_PRESET=node_server npm run build && node .output/server/index.mjs
  // Inside a Lovable build LOVABLE_NITRO_PRESET pins the preset and this is ignored.
  nitro: { preset: process.env["NITRO_PRESET"] ?? "vercel" },
});
