import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { getSSL, getFrontendIP, getBackendIP, OS, detectOS } from './config/vite/OS';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    // Serves /portfolio with the correct <title> from the start, so it is right even without JS
    // and does not flash "Project Vocab" before the router sets it.
    // NOTE: works only with the dev server (`npm run dev`). In a build there is no request URL,
    // so dist/index.html keeps the default title; a build would need e.g. a separate
    // dist/portfolio/index.html with this title emitted in generateBundle.
    // Keep the title in sync with meta.title of the portfolio route in router/index.ts.
    {
      name: 'route-title',
      transformIndexHtml(html, ctx) {
        if (ctx.originalUrl?.startsWith('/portfolio'))
          return html.replace(/<title>.*<\/title>/, '<title>Okan | Software Developer</title>');
      },
    },
  ],
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@fontsource/nunito']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./main/src/frontend', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/main/src/frontend/junk/scss/color-palette.scss" as *;\n@use "/main/src/frontend/junk/scss/variables.scss" as *;\n`
      }
    }
  },
  server: {
    host: true,
    port: 443,
    hmr: {
      host: getFrontendIP(), // your public IP / nip.io hostname
      protocol: 'wss',               // force WebSocket over HTTPS
      port: 443,
      overlay: false
    },
    https: {
      key: fs.readFileSync(getSSL().key),
      cert: fs.readFileSync(getSSL().cert)
    },
    proxy: {
      '/api': {
        target: `https://${getBackendIP()}:5174`, // Uvicorn backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
  }
});
