export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        primary: "hsl(var(--p))",
        "primary-focus": "hsl(var(--pf))",
        "primary-content": "hsl(var(--pc))",
        secondary: "hsl(var(--s))",
        "secondary-focus": "hsl(var(--sf))",
        "secondary-content": "hsl(var(--sc))",
        accent: "hsl(var(--a))",
        "accent-focus": "hsl(var(--af))",
        "accent-content": "hsl(var(--ac))",
        neutral: "hsl(var(--n))",
        "neutral-focus": "hsl(var(--nf))",
        "neutral-content": "hsl(var(--nc))",
        "base-100": "hsl(var(--b1))",
        "base-200": "hsl(var(--b2))",
        "base-300": "hsl(var(--b3))",
        "base-content": "hsl(var(--bc))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#2563eb",          // Blue-600
          "primary-focus": "#1d4ed8",    // Blue-700
          "primary-content": "#ffffff",   // White
          
          "secondary": "#4f46e5",        // Indigo-600
          "secondary-focus": "#4338ca",   // Indigo-700
          "secondary-content": "#ffffff", // White
          
          "accent": "#0891b2",           // Cyan-600
          "accent-focus": "#0e7490",     // Cyan-700
          "accent-content": "#ffffff",    // White
          
          "neutral": "#1f2937",          // Gray-800
          "neutral-focus": "#111827",    // Gray-900
          "neutral-content": "#ffffff",   // White
          
          "base-100": "#ffffff",         // White
          "base-200": "#f9fafb",         // Gray-50
          "base-300": "#f3f4f6",         // Gray-100
          "base-content": "#1f2937",     // Gray-800
          
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
        dark: {
          "primary": "#3b82f6",          // Blue-500
          "primary-focus": "#2563eb",    // Blue-600
          "primary-content": "#ffffff",   // White
          
          "secondary": "#6366f1",        // Indigo-500
          "secondary-focus": "#4f46e5",   // Indigo-600
          "secondary-content": "#ffffff", // White
          
          "accent": "#06b6d4",           // Cyan-500
          "accent-focus": "#0891b2",     // Cyan-600
          "accent-content": "#ffffff",    // White
          
          "neutral": "#374151",          // Gray-700
          "neutral-focus": "#1f2937",    // Gray-800
          "neutral-content": "#ffffff",   // White
          
          "base-100": "#1f2937",         // Gray-800
          "base-200": "#111827",         // Gray-900
          "base-300": "#0f172a",         // Slate-900
          "base-content": "#f9fafb",     // Gray-50
          
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
  },
};
