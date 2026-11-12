// Tailwind CSS v4 through PostCSS. Works with both bundlers: the production build uses webpack
// (see package.json), because Turbopack runs PostCSS in helper processes that fail on Hostinger.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
