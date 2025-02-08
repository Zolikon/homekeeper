import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-to": "var(--background-to)",
        foreground: "var(--foreground)",
        theme_primary: "rgb(29,181,147)",
      },
    },
  },
  plugins: [],
} satisfies Config;
