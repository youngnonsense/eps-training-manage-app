import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // เพิ่มบรรทัดนี้ เผื่อโปรเจกต์คุณใช้โฟลเดอร์ src
  ],
  theme: {
    extend: {
      fontFamily: {
        combined: ['Libertinus Serif', 'Google Sans', 'Noto Sans Thai', 'serif'],
        google: ['Google Sans', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;