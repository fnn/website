import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import markdoc from "@astrojs/markdoc";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://fynn.at",
  integrations: [solid(), tailwind(), mdx(), markdoc()],
  adapter: vercel({
    analytics: true,
  }),
  markdown: {
    shikiConfig: {
      theme: "rose-pine-moon",
    },
  },
  vite: {
    ssr: {
      noExternal: ["@kobalte/core"],
    },
  },
});
