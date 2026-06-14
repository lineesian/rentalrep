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
        teal: {
          DEFAULT: "#0E9E92",
          50: "#E6F9F8",
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
          DEFAULT: "#07312C",
          50: "#E6F0EF",
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
        gold: {
          DEFAULT: "#F4B53F",
          50: "#FEF7E8",
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
        surface: "#F5F8F7",
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
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
