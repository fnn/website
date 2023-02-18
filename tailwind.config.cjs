/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
    },
    extend: {
      screens: {
        touch: { raw: "(hover: none) and (pointer: coarse)" },
      },
      colors: {
        gray: {
          1: "var(--gray-1)",
          a1: "var(--gray-a1)",
          2: "var(--gray-2)",
          a2: "var(--gray-a2)",
          3: "var(--gray-3)",
          a3: "var(--gray-a3)",
          4: "var(--gray-4)",
          a4: "var(--gray-a4)",
          5: "var(--gray-5)",
          a5: "var(--gray-a5)",
          6: "var(--gray-6)",
          a6: "var(--gray-a6)",
          7: "var(--gray-7)",
          a7: "var(--gray-a7)",
          8: "var(--gray-8)",
          a8: "var(--gray-a8)",
          9: "var(--gray-9)",
          a9: "var(--gray-a9)",
          10: "var(--gray-10)",
          a10: "var(--gray-a10)",
          11: "var(--gray-11)",
          a11: "var(--gray-a11)",
          12: "var(--gray-12)",
          a12: "var(--gray-a12)",
        },
        blue: {
          1: "var(--blue-1)",
          a1: "var(--blue-a1)",
          2: "var(--blue-2)",
          a2: "var(--blue-a2)",
          3: "var(--blue-3)",
          a3: "var(--blue-a3)",
          4: "var(--blue-4)",
          a4: "var(--blue-a4)",
          5: "var(--blue-5)",
          a5: "var(--blue-a5)",
          6: "var(--blue-6)",
          a6: "var(--blue-a6)",
          7: "var(--blue-7)",
          a7: "var(--blue-a7)",
          8: "var(--blue-8)",
          a8: "var(--blue-a8)",
          9: "var(--blue-9)",
          a9: "var(--blue-a9)",
          10: "var(--blue-10)",
          a10: "var(--blue-a10)",
          11: "var(--blue-11)",
          a11: "var(--blue-a11)",
          12: "var(--blue-12)",
          a12: "var(--blue-a12)",
        },
        red: {
          1: "var(--red-1)",
          a1: "var(--red-a1)",
          2: "var(--red-2)",
          a2: "var(--red-a2)",
          3: "var(--red-3)",
          a3: "var(--red-a3)",
          4: "var(--red-4)",
          a4: "var(--red-a4)",
          5: "var(--red-5)",
          a5: "var(--red-a5)",
          6: "var(--red-6)",
          a6: "var(--red-a6)",
          7: "var(--red-7)",
          a7: "var(--red-a7)",
          8: "var(--red-8)",
          a8: "var(--red-a8)",
          9: "var(--red-9)",
          a9: "var(--red-a9)",
          10: "var(--red-10)",
          a10: "var(--red-a10)",
          11: "var(--red-11)",
          a11: "var(--red-a11)",
          12: "var(--red-12)",
          a12: "var(--red-a12)",
        },
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        input: "inset 0 0 0 1px var(--tw-shadow-color)",
        "input-focus":
          "inset 0 0 0 1px var(--tw-shadow-color),0 0 0 1px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [require("@kobalte/tailwindcss")],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
