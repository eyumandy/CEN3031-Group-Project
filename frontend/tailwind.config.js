/**
 * 
 * @description Tailwind CSS configuration file
 * @version 1.0
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
      "./src/app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        },
        colors: {
          cyan: {
            400: '#00DCFF',
            500: '#00C8E6',
          }
        },
        fontFamily: {
          'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        },
      },
    },
    plugins: [],
  }