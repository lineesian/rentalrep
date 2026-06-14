import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette ────────────────────────────────────────
        teal: {
          DEFAULT: "#0E9E92",   // Trust Teal — primary
          50:  "#E6F9F8",
          100: "#CCEEEC",
          200: "#99DDDA",
          300: "#4DC4BC",
          400: "#0E9E92",
          500: "#0B8177",
          600: "#08635C",
          700: "#064843",
          800: "#042E2B",
          900: "#021614",
        },
        petrol: {
          DEFAULT: "#07312C",   // Petrol Ink — dark backgrounds, headers
          50:  "#E6F0EF",
          100: "#CCE1DF",
          200: "#99C3BF",
          300: "#4D938D",
          400: "#07312C",
          500: "#062823",
          600: "#041F1B",
          700: "#031512",
          800: "#020C0A",
          900: "#010605",
        },
        mint: {
          DEFAULT: "#2FD4C0",   // Mint — accents, active states, "Rep" wordmark
          50:  "#EDFAF8",
          100: "#D4F4F1",
          200: "#AAE9E3",
          300: "#6EDDD5",
          400: "#2FD4C0",
          500: "#1FADA0",
          600: "#178177",
          700: "#0F5550",
          800: "#082B2A",
          900: "#041615",
        },
        gold: {
          DEFAULT: "#F4B53F",   // Sun Gold — stars, ratings, score numbers
          50:  "#FEF7E8",
          100: "#FDEFD1",
          200: "#FBDFA3",
          300: "#F8C966",
          400: "#F4B53F",
          500: "#F0A010",
          600: "#C0800D",
          700: "#906009",
          800: "#604006",
          900: "#302003",
        },
        sage: {
          DEFAULT: "#5E7470",   // Slate Sage — secondary text, meta labels
          50:  "#EEF2F1",
          100: "#D4DEDD",
          200: "#A9BDBB",
          300: "#7E9B99",
          400: "#5E7470",
          500: "#4B5D5A",
          600: "#394644",
          700: "#262F2E",
          800: "#131817",
          900: "#090C0C",
        },
        surface: "#F5F8F7",     // Mist — page background, card fill
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body:    ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
