import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import TailwindCSS from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

export default defineConfig({
    plugins: [
        Vue(),
        TailwindCSS(),
        Components({
            dts: true,
            dirs: ["src/components"],
            extensions: ["vue"],
            resolvers: [IconsResolver({
                prefix: false,
                enabledCollections: ["mdi"],
                alias: {
                    icon: "mdi"
                }
            })]
        }),
        Icons(),
        AutoImport({
            imports: ["vue"]
        })
    ],
    base: "./",
    build: {
        target: "esnext",
        minify: "esbuild",
        outDir: "./dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        lib: {
            entry: {
                "my-vote": "./src/widgets/Vote.ts",
                "website": "./index.html"
            },
            fileName: "[name]",
            formats: ["es"]
        }
    },
    define: {
        "process.env": process.env
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
});
