const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    path.resolve(__dirname, './App.{js,jsx,ts,tsx}').replace(/\\/g, '/'),
    path.resolve(__dirname, './src/**/*.{js,jsx,ts,tsx}').replace(/\\/g, '/'),
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#32CD32',
        'primary-dark': '#1F8A1F',
        'primary-tint': '#E9F8E9',
        'on-primary': '#0F2A0F',
        background: '#F8FAF7',
        surface: '#FFFFFF',
        'surface-low': '#F2F5EE',
        border: '#E6EAE4',
        'text-primary': '#1B1F1B',
        'text-secondary': '#6B726B',
        error: '#D64545',
        'error-tint': '#FDF2F2',
        success: '#1F8A1F',
      },
      fontFamily: {
        regular: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
