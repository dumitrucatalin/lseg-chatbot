import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "lseg-blue": "var(--lseg-blue)", // Add your custom blue color
        "lseg-light-blue": "var(--lseg-light-blue)", // Add your custom light blue color
      },
    },
  },
  plugins: [],
} satisfies Config;
