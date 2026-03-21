import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)"],
      },
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "var(--foreground)",
            a: {
              color: "var(--foreground)",
              "&:hover": {
                color: "var(--foreground)",
              },
            },
            h1: {
              color: "var(--foreground)",
            },
            h2: {
              color: "var(--foreground)",
            },
            h3: {
              color: "var(--foreground)",
            },
            h4: {
              color: "var(--foreground)",
            },
            strong: {
              color: "var(--foreground)",
            },
            code: {
              color: "var(--foreground)",
            },
            figcaption: {
              color: "var(--foreground)",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        ".clip-path-full": {
          "clip-path": "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        },
      });
    },
  ],
};

export default config;
