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
      },
      animation: {
        flicker: "flicker 1.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
