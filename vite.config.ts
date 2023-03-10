import path from 'node:path';
import { getPackageInfo } from 'local-pkg';
import SvgLoader from 'vite-svg-loader';
import pkg from './package.json';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Mkcert from 'vite-plugin-mkcert';
import Inspect from 'vite-plugin-inspect';

export default defineConfig(async () => {
  const repl = await getPackageInfo('@vue/repl');
  const port = Number(process.env.PORT) || 3001;

  return {
    base: './',
    server: {
      https: true,
      host: true,
      port
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
      'import.meta.env.REPL_VERSION': JSON.stringify(repl!.version)
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        },
        {
          find: /~(.+)/,
          replacement: path.join(process.cwd(), 'node_modules/$1')
        }
      ]
    },
    plugins: [
      vue({
        reactivityTransform: true
      }),
      Mkcert(),
      Inspect(),
      SvgLoader()
    ]
  };
});
