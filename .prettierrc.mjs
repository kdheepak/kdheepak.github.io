/** @type {import("prettier").Config} */
export default {
  arrowParens: "avoid",
  semi: true,
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  quoteProps: "preserve",
  endOfLine: "lf",
  bracketSameLine: false,
  bracketSpacing: true,
  proseWrap: "always",
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
