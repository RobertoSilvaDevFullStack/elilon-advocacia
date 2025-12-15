/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Elilon Lopes (CORRETO: Preto + Vinho/Vermelho)
        // Vinho (tom escuro de vermelho) - Cor principal escura
        vinho: {
          50: "#F9E8EA",
          100: "#F3D1D5",
          200: "#E7A3AB",
          300: "#DB7581",
          400: "#CF4757",
          500: "#A1333E", // Vinho principal (vermelho escuro)
          600: "#812932",
          700: "#611F25",
          800: "#411419",
          900: "#200A0C", // Vinho mais escuro
        },
        // Vermelho (tom mais claro para destaques)
        vermelho: {
          50: "#FEE8E8",
          100: "#FDD1D1",
          200: "#FBA3A3",
          300: "#F97575",
          400: "#F74747",
          500: "#F51919", // Vermelho vibrante
          600: "#C41414",
          700: "#930F0F",
          800: "#620A0A",
          900: "#310505",
        },
        // Preto específico da marca
        preto: {
          50: "#E6E6E6",
          100: "#CCCCCC",
          200: "#999999",
          300: "#666666",
          400: "#333333",
          500: "#1A1A1A", // Preto principal
          600: "#151515",
          700: "#101010",
          800: "#0A0A0A",
          900: "#000000",
        },
        neutral: {
          50: "#F5F5F0", // Off-white/Bege
          100: "#E8E8E0",
          800: "#2C4A4A",
          900: "#1A1A1A",
        },
        // Legacy aliases (manter compatibilidade temporária)
        accent: {
          400: "#F74747",
          500: "#A1333E", // Vinho
          600: "#812932",
        },
        navy: {
          500: "#1A1A1A", // Map to preto
          600: "#151515",
          700: "#101010",
        },
        gold: {
          400: "#A1333E",
          500: "#812932",
          600: "#611F25",
        },
      },
      fontFamily: {
        headline: ['"Cabin"', "sans-serif"], // Halcom alternative
        sans: ['"Montserrat"', "sans-serif"], // Body text
        serif: ['"Cabin"', "sans-serif"], // For compatibility
      },
    },
  },
  plugins: [],
};
