// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.css'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)']
      }
    }
  },
  plugins: []
};

export default config;
