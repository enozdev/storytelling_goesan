import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}", // app router 사용 시
  ],
  theme: {
    extend: {
      colors: {
        "neon-yellow": "#FFFF33",
        "neon-green": "#00FF00",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 6px #FFFF33)" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 2px #FFFF33)" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".85", transform: "scale(0.98)" },
        },
        compass: {
          "0%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
          "100%": { transform: "rotate(-8deg)" },
        },
      },
      animation: {
        flicker: "flicker 1.2s infinite",
        fadeOut: "fadeOut .9s ease-in forwards",
        wiggle: "wiggle 1.2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        compass: "compass 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
