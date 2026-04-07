/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "320px",
        sm: "375px",
        sml: "500px",
        md: "667px",
        mdl: "768px",
        lg: "960px",
        lgl: "1024px",
        xl: "1280px",
      },
      colors: {
        brand_purple: "#cb299e",
        brand_pink: "#cb299e",
        brand_teal: "#fae20a",
        brand_yellow: "#fae20a",
        brand_green: "#7CD957",
        amazon_blue: "#cb299e",
        amazon_light: "#a81f7f",
        amazon_yellow: "#fae20a",
        lightText: "#ccc",
      },
      fontFamily: {
        bodyFont: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
