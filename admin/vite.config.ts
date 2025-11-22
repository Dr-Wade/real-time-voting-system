import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";
import Vue from "@vitejs/plugin-vue";
import TailwindCSS from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Icons from "unplugin-icons/vite";
import IconResolver from "unplugin-icons/resolver";

export default defineConfig({
    plugins: [
        Vue(),
        TailwindCSS(),
        Components({
            dts: true,
            dirs: ["components"],
            extensions: ["vue"],
            resolvers: [
                IconResolver({
                    prefix: false,
                    enabledCollections: ["mdi"],
                })
            ]
        }),
        Icons({
            compiler: "vue3"
        }),
        AutoImport({
            imports: [
                "vue",
                "vue-router",
            ]
        })
    ],
    resolve: {
        alias: [
            { find: "@", replacement: fileURLToPath(new URL("./src/client", import.meta.url)) },
            { find: "@ui", replacement: fileURLToPath(new URL("./src/client/components/ui", import.meta.url)) },
            { find: "vue", replacement: "vue/dist/vue.esm-bundler.js" }
        ]
    },
    build: {
        chunkSizeWarningLimit: 1000,
        outDir: "dist",
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        hmr: { port: 3001 }
    }
});
