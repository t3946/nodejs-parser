import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'ParserNodeJS',
            fileName: () => 'index.js',
            formats: ['es'],
        },
        minify: false,
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },
    server: {
        watch: {
            usePolling: true,
        },
        hmr: true,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)), // alias @ на src
        },
    },
});
