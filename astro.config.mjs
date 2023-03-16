import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [solid(), tailwind(), mdx()],
  adapter: vercel({
    analytics: true,
  }),
  vite: {
    ssr: {
      noExternal: ["@kobalte/core"],
    },
  },
});
