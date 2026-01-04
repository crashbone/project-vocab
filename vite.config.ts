import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { getSSL, getFrontendIP, getBackendIP, OS, detectOS } from './config/vite/OS';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
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
      port: 443
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
    }
  }
});
