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
        gray: generateScale("gray"),
        blue: generateScale("blue"),
        red: generateScale("red"),
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
  plugins: [
    require("@kobalte/tailwindcss"),
    require("@tailwindcss/typography"),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

function generateScale(name) {
  let scale = Array.from({ length: 12 }, (_, i) => {
    let id = i + 1;
    return [
      [id, `var(--${name}${id})`],
      [`a${id}`, `var(--${name}A${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}
