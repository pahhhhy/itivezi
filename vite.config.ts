import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'


// https://vitejs.dev/config/
export default defineConfig({

  plugins: [
      vue(),
      Icons({
        autoInstall: true,
        compiler: 'vue3',
        customCollections: {
          icon: FileSystemIconLoader(
              './src/assets/Icon',
              svg => svg.replace(/^<svg /, '<svg fill="currentColor" '),
          ),
        },
      }),
    Components({
      dts: true,
      resolvers: [
        IconsResolver({
          customCollections: ['icon'],
          prefix: false,
        }),
      ],
    }),
  ],

  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // すべてのネットワークインターフェースで待機
    port: 5173,      // 任意のポート番号に変更可能
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 分割されたチャンクを定義します
          vendor: ['vue'],
        },
      },
    },
  },
})
