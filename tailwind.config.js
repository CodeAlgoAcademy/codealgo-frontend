/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["pages/**/*.{js,ts,jsx,tsx}", "components/**/*.{js,ts,jsx,tsx}"],
   theme: {
      extend: {
         backgroundImage: {
            home1: "url('../public/assets/background3.png')",
            home2: "url('../public/assets/background2.png')",
            home3: "url('../public/assets/background1.png')",
            background: "url('../public/assets/background.png')",
            authLayout: "url('../public/assets/auth-layout-bg.jpg')",
            blueToBlackGradient: "linear-gradient(to bottom, #67B2E7 0%, #202748 75%)",
            whiteToBlueGradient: "linear-gradient(to bottom left, #FFF7F0, #7193F9 40%)",
            redToBlackGradient: "linear-gradient(to bottom, #FF0D11, #040404 99%)",
         },
         colors: {
            mainPurple: "#412281",
            mainColor: "#2073fa",
            mainPink: "#FF88AF",
            mainBlack: "#191919",
            mainRed: "#FF0D11",
            mainGreen: "#038800",
            mainOrange: "#F59E0B",

         },
         screens: {
            xs: "400px",
            lg: "1100px",
            "2xl": "1700px",
            "3xl": "2400px",
            w840: "840px",
            w500: "500px", 
            w820: "900px",
         },
         clipPath: {
            wave: "polygon(0 75%, 50% 100%, 100% 75%, 100% 100%, 0 100%)",
            "right-parallelogram": "polygon(0% 0, 100% 0, 78% 100%, 0% 100%)", // Left side straight
            "left-parallelogram": "polygon(25% 0, 100% 0, 100% 100%, 0% 100%)", // Right side straight
            "center-parallelogram": "polygon(16% 0, 100% 0, 75% 100%, 0% 100%)", // Both sides slanted
         },
         fontFamily: {
            tiltWarp: ["TiltWarp"],
            thabit: ["Thabit"],
            thabitBold: ["ThabitBold"],
            workSans: ["worksans"],
         },
          keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out forwards',
      }
      },
   },
   plugins: [
      require("tailwind-clip-path"),
      function ({ addUtilities }) {
         addUtilities({
            ".forced-color-adjust-none": {
               forcedColorAdjust: "none",
            },
         });
      },
   ],
};
