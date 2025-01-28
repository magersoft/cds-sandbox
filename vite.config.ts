import path from 'node:path';
import SvgLoader from 'vite-svg-loader';
import pkg from './package.json';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Mkcert from 'vite-plugin-mkcert';
import AutoImport from 'unplugin-auto-import/vite';
import Inspect from 'vite-plugin-inspect';
import replPkg from '@vue/repl/package.json' with { type: 'json' };
import fs from 'node:fs';

const pathSrc = path.resolve(__dirname, 'src');

export default defineConfig(() => {
  const port = Number(process.env.PORT) || 3001;

  return {
    server: {
      https: true,
      host: true,
      port
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
      'import.meta.env.REPL_VERSION': JSON.stringify(replPkg.version)
    },
    build: {
      rollupOptions: {
        external: ['typescript'],
      },
    },
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true,
          fs: {
            fileExists: fs.existsSync,
            readFile: (file) => fs.readFileSync(file, 'utf-8'),
          },
        },
      }),
      AutoImport({
        dirs: [path.resolve(pathSrc, 'composables')],
        imports: ['vue', '@vueuse/core'],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Mkcert(),
      Inspect(),
      SvgLoader()
    ],
    optimizeDeps: {
      exclude: ['@vue/repl'],
    },
  };
});
