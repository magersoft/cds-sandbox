import { gte } from 'semver'

import type { TVersions } from '@/composable/store.d';
import type { MaybeRef } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ImportMap } from '@vue/repl';

export interface IDependency {
  pkg?: string;
  version?: string;
  path: string;
}

export type Cdn = 'unpkg' | 'jsdelivr' | 'jsdelivr-fastly' | 'local';
export const cdn = useLocalStorage<Cdn>('setting-cdn', 'jsdelivr');

export const getCdnLink = (pkg: string, version: string | undefined, path: string): string => {
  version = version ? `@${version}` : '';

  switch (cdn.value) {
    case 'jsdelivr':
      return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`;
    case 'jsdelivr-fastly':
      return `https://fastly.jsdelivr.net/npm/${pkg}${version}${path}`;
    case 'unpkg':
      return `https://unpkg.com/${pkg}${version}${path}`;
    case 'local':
      return `${import.meta.env.VITE_LOCAL_CDN_URL}/npm/${pkg}${version}${path}`;
  }
};

export const genCompilerSfcLink = (version: string) => {
  return getCdnLink('@vue/compiler-sfc', version, '/dist/compiler-sfc.esm-browser.js');
};

export const generateImportMap = ({ vue, cds }: Partial<TVersions> = {}): ImportMap => {
  const dependencies: Record<string, IDependency> = {
    vue: {
      pkg: '@vue/runtime-dom',
      version: vue,
      path: '/dist/runtime-dom.esm-browser.js'
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js'
    },
    '@vue/devtools-api': {
      version: '7',
      path: '/lib/esm/index.js'
    },
    'vee-validate': {
      version: '4',
      path: '/dist/vee-validate.esm.js'
    },
    '@vuelidate/core': {
      version: '2',
      path: '/dist/index.esm.js'
    },
    '@vuelidate/validators': {
      version: '2',
      path: '/dist/index.esm.js'
    },
    'vue-demi': {
      version: '0.13.11',
      path: '/lib/index.mjs'
    },
    maska: {
      version: '2.1.9',
      path: '/dist/maska.js'
    },
    axios: {
      pkg: 'axios',
      version: '1.4.0',
      path: '/dist/esm/axios.js'
    },
    '@central-design-system/components': {
      pkg: '@central-design-system/components',
      version: cds,
      path: '/dist/cds.es.js'
    },
    '@central-design-system/icons': {
      pkg: '@central-design-system/icons',
      version: cds,
      path: '/dist/cds-icons.es.js'
    },
    '@central-design-system/illustrations': {
      pkg: '@central-design-system/illustrations',
      version: cds,
      path: '/dist/cds-illustrations.es.js'
    }
  };

  return {
    imports: Object.fromEntries(
      Object.entries(dependencies).map(([key, dep]) => [key, getCdnLink(dep.pkg ?? key, dep.version, dep.path)])
    )
  };
};

export const getVersions = (pkg: MaybeRef<string>) => {
  const url = computed(() => `https://data.jsdelivr.com/v1/package/npm/${unref(pkg)}`);
  return useFetch(url, {
    initialData: [],
    afterFetch: (ctx) => ((ctx.data = ctx.data.versions), ctx),
    refetch: true
  }).json<string[]>().data as Ref<string[]>;
};

export const getSupportedVueVersions = () => {
  const versions = getVersions('vue');
  return computed(() => versions.value.filter((version: string) => gte(version, '3.2.0')));
};

export const getSupportedTSVersions = () => {
  const versions = getVersions('typescript');
  return computed(() => versions.value.filter((version) => !version.includes('dev') && !version.includes('insiders')));
}

export const getSupportedCdsVersions = () => {
  const versions = getVersions('@central-design-system/components');
  return computed(() => unref(versions).filter((version) => gte(version, '3.0.0-beta.0')));
};
