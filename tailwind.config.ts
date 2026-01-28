import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pr: {
          red: "#ED0000",
          blue: "#0050F0",
          white: "#FFFFFF",
        },
        edge: {
          buy: "#22c55e",
          sell: "#ef4444",
          neutral: "#6b7280",
          gold: "#eab308",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
