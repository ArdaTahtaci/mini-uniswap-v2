export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: "#05060d",
                foreground: "#e9efff",
                card: "#0b1224",
                "card-foreground": "#f2f6ff",
                muted: "#0f172a",
                "muted-foreground": "#9cb0d3",
                border: "#1a2640",
                input: "#1b2944",
                primary: "#65ffb6",
                "primary-foreground": "#03130a",
                secondary: "#10203a",
                "secondary-foreground": "#e6edff",
                accent: "#1b2f4d",
                "accent-foreground": "#ddecff",
                ring: "#5ce3ba",
            },
            fontFamily: {
                sans: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
                mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
            },
            boxShadow: {
                glow: "0 0 0 1px rgba(101,255,182,0.2), 0 20px 80px rgba(32,240,168,0.15)",
                card: "0 24px 70px -32px rgba(0,0,0,0.65)",
            },
            backgroundImage: {
                "grid-lines":
                    "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                "radial-fade":
                    "radial-gradient(circle at 20% 20%, rgba(69,255,191,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(52,144,255,0.12), transparent 32%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.08), transparent 30%)",
            },
            borderRadius: {
                "2xl": "1.25rem",
                "3xl": "1.75rem",
            },
        },
    },
    plugins: [],
}
