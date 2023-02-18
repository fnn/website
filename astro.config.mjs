import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [solid(), tailwind(), mdx()],
  adapter: cloudflare(),
  vite: {
    ssr: {
      noExternal: ["@kobalte/core"],
    },
  },
});
