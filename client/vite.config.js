import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),

    // 🔥 Force copy _redirects into dist
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects',
          dest: '.'     // copy directly into dist/
        }
      ]
    })
  ],

  build: {
    outDir: "dist",
  },
});
