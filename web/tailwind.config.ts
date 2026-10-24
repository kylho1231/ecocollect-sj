import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          green: "#147D64",
          "green-dark": "#0C5241",
          "green-light": "#1EA886",
          navy: "#11263A",
          mint: "#EAF7F0",
          soft: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
