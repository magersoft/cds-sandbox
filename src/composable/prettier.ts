import { getCdnLink } from '@/utils';

import type { Fn } from '@vueuse/core';
import type { Store } from '@vue/repl';
import type { BuiltInParserName, format } from 'prettier';
import type { default as parserHtml } from 'prettier/parser-html';
import type { default as parserTypescript } from 'prettier/parser-typescript';
import type { default as parserBabel } from 'prettier/parser-babel';
import type { default as parserPostcss } from 'prettier/parser-postcss';

let prettier:
  | [typeof format, typeof parserHtml, typeof parserTypescript, typeof parserBabel, typeof parserPostcss]
  | undefined;

export async function usePrettier(store: Store) {
  let close: Fn | undefined;
  if (!prettier) {
    console.log('Loading Prettier...');
  }

  const [format, parseHtml, parserTypescript, parserBabel, parserPostcss] = await loadPrettier();

  const file = store.state.activeFile;
  let parser: BuiltInParserName | string | undefined;

  if (file.filename.endsWith('.vue')) {
    parser = 'vue';
  } else if (file.filename.endsWith('.js')) {
    parser = 'babel';
  } else if (file.filename.endsWith('.ts')) {
    parser = 'typescript';
  } else if (file.filename.endsWith('.html')) {
    parser = 'html';
  } else if (file.filename.endsWith('.json')) {
    parser = 'json';
  } else if (file.filename.endsWith('.css')) {
    parser = 'css';
  } else {
    return;
  }

  file.code = format(file.code, {
    parser,
    plugins: [parseHtml, parserTypescript, parserBabel, parserPostcss],
    singleQuote: true,
    semi: true,
    trailingComma: 'none',
    printWidth: 120
  });
}

async function loadPrettier() {
  const load = (path: string) => import(/* @vite-ignore */ getCdnLink('prettier', '2', `/esm/${path}`));

  if (!prettier) {
    prettier = await Promise.all([
      load('standalone.mjs').then((m) => m.default.format),
      load('parser-html.mjs').then((m) => m.default),
      load('parser-typescript.mjs').then((m) => m.default),
      load('parser-babel.mjs').then((m) => m.default),
      load('parser-postcss.mjs').then((m) => m.default)
    ]);
  }

  return prettier;
}
