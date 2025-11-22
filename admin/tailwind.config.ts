import type { Config } from "tailwindcss";

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand": "#30715e",
                "brand-dark": "#255248",
                "success": "#eefff4"
            },
        },
    },
} satisfies Config;
