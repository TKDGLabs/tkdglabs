import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content.ts"
  ],
  theme: {
    extend: {
      colors: {
        background: "#041411",
        accent: "#21c1a2",
        foreground: "#e8fff9",
        muted: "#9db7b1"
      },
      borderRadius: {
        system: "14px"
      }
    }
  },
  plugins: []
};

export default config;
