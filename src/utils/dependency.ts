import { useLocalStorage, useFetch } from '@vueuse/core';
import { computed, unref } from 'vue';
import { compare } from 'compare-versions';

import type { IImportMap } from '@/utils/import-map';
import type { TVersions } from '@/composable/store.d';
import type { MaybeRef } from '@vueuse/core';
import type { Ref } from 'vue';

export interface IDependency {
  pkg?: string;
  version?: string;
  path: string;
}

export type Cdn = 'unpkg' | 'jsdelivr' | 'jsdelivr-fastly' | 'local';
export const cdn = useLocalStorage<Cdn>('setting-cdn', 'jsdelivr-fastly');

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

export const getVueLink = (version: string): Record<string, string> => ({
  compilerSfc: getCdnLink('@vue/compiler-sfc', version, '/dist/compiler-sfc.esm-browser.js'),
  runtimeDom: getCdnLink('@vue/runtime-dom', version, '/dist/runtime-dom.esm-browser.js')
});

export const generateImportMap = ({ vue, cds }: Partial<TVersions> = {}): IImportMap => {
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
      version: '6',
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
    '@central-design-system/components': {
      pkg: '@central-design-system/components',
      version: cds,
      path: '/dist/cds.es.js'
    },
    '@central-design-system/icons': {
      pkg: '@central-design-system/icons',
      version: '1',
      path: '/dist/cds-icons.es.js'
    },
    '@central-design-system/illustrations': {
      pkg: '@central-design-system/illustrations',
      version: '3.0.0-alpha.2',
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
  const versions = $(getVersions('vue'));
  return computed(() => versions.filter((version) => compare(version, '3.2.47', '>=')));
};

export const getSupportedCdsVersions = () => {
  const versions = getVersions('@central-design-system/components');
  return computed(() => versions.value.filter((version) => compare(version, '3.0.0', '>=')));
};
