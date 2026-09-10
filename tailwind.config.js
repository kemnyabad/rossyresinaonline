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
        brand_purple: "#c21885",
        brand_pink: "#e4147f",
        brand_teal: "#10aebb",
        brand_yellow: "#facc15",
        brand_green: "#86b817",
        amazon_blue: "#e4147f",
        amazon_light: "#c21885",
        amazon_yellow: "#86b817",
        lightText: "#ccc",
      },
      fontFamily: {
        bodyFont: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
