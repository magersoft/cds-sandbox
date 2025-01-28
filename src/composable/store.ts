import { reactive, ref, unref, watch, watchEffect } from 'vue';
import { File, compileFile, mergeImportMap, useStore as useReplStore } from '@vue/repl';
import { atou, genCompilerSfcLink, generateImportMap, getCdnLink, utoa } from '@/utils';
import { objectOmit, useStorage } from '@vueuse/core';
import config from '@/config';

import WelcomeTemplate from '@/template/Welcome.vue?raw';
import MainTemplate from '@/template/Main.vue?raw';
import CdsSetupTemplate from '@/template/cds-setup.js?raw';
import TsConfigTemplate from '@/template/tsconfig.json?raw';
import StylesTemplate from '@/template/styles.css?raw';

import type { IInitial, IUserOptions, TSerializeState, TVersionKey, TVersions } from './store.d';
import type { StoreState, ImportMap } from '@vue/repl';

export const useStore = (initial: IInitial) => {
  const saved: TSerializeState | undefined = initial.serializedState ? deserialize(initial.serializedState) : undefined;
  const isLegacy = config.LEGACY_VERSIONS.some((legacyVersion) => config.CDS_VERSION.startsWith(legacyVersion));
  const storage = useStorage('theme', isLegacy ? config.LEGACY_DEFAULT_THEME : config.DEFAULT_THEME);

  const versions = reactive<TVersions>({
    vue: config.VUE_VERSION,
    cds: config.CDS_VERSION,
    typescript: config.TYPESCRIPT_VERSION
  });


  const theme = ref(isLegacy ? config.LEGACY_DEFAULT_THEME : unref(storage));

  const userOptions: IUserOptions = {};
  const hideFile = !config.IS_DEV && !userOptions.showHidden;
  const builtinImportMap = computed<ImportMap>(() => generateImportMap(versions));

  const storeState: Partial<StoreState> = toRefs(reactive({
    files: initFiles(),
    mainFile: config.MAIN_FILE,
    activeFilename: config.APP_FILE,
    vueVersion: computed(() => versions.vue),
    typescriptVersion: versions.typescript,
    builtinImportMap,
    template: {
      welcomeSFC: MainTemplate
    },
    sfcOptions: {
      script: {
        propsDestructure: true
      }
    }
  }));

  const store = useReplStore(storeState);
  store.files[config.CDS_FILE].hidden = hideFile;
  store.files[config.MAIN_FILE].hidden = hideFile;

  setVueVersion(versions.vue).then(() => {
    initial.initialized?.();
  });

  watch(() => versions.cds, (version) => {
    const isLegacyVersion = config.LEGACY_VERSIONS.some((legacyVersion) => version.startsWith(legacyVersion));
    setTheme(isLegacyVersion ? config.LEGACY_DEFAULT_THEME : config.DEFAULT_THEME);

    store.files[config.CDS_FILE].code = generateCdsCode(version, userOptions.styleSource).trim();
    compileFile(store, store.files[config.CDS_FILE]).then((errs) => (store.errors = errs));
  });

  watch(builtinImportMap, (newBuiltInImportMap) => {
    const importMap = JSON.parse(store.files[config.IMPORT_MAP].code);
    store.files[config.IMPORT_MAP].code = JSON.stringify(mergeImportMap(importMap, newBuiltInImportMap), undefined, 2);
  }, { deep: true });

  watch(
    theme,
    () => {
      store.files[config.CDS_FILE].code = generateCdsCode(versions.cds, userOptions.styleSource).trim();
      compileFile(store, store.files[config.CDS_FILE]).then((errs) => (store.errors = errs));
    },
    { immediate: true }
  );

  function generateCdsCode(version: string, stylesSource?: string): string {
    const style = stylesSource
      ? stylesSource.replace('#VERSION#', version)
      : getCdnLink('@central-design-system/components', version, '/dist/cds.css');
    return CdsSetupTemplate.replace('#STYLE#', style).replace('#THEME#', unref(theme));
  }

  async function setVueVersion(version: string): Promise<void> {
    store.compiler = await import(
      /* @vite-ignore */ genCompilerSfcLink(version)
    );

    versions.vue = version;

    console.info(`[@vue/repl] Vue version set to ${version}]`);
  }

  async function setVersion(key: TVersionKey, version: string): Promise<void> {
    switch (key) {
      case 'vue':
        await setVueVersion(version);
        break;
      case 'cds':
        versions.cds = version;
        break;
      case 'typescript':
        versions.typescript = version;
        break;
    }
  }

  function init() {
    watchEffect(() => {
      compileFile(store, store.activeFile).then((errs) => (store.errors = errs));
    });

    for (const [filename, file] of Object.entries(store.files)) {
      if (filename === store.activeFilename) continue;
      compileFile(store, file).then((errs) => store.errors.push(...errs));
    }

    watch(
      () => [
        store.files[config.TSCONFIG]?.code,
        store.typescriptVersion,
        store.dependencyVersion,
        store.vueVersion
      ],
      useDebounceFn(() => store.reloadLanguageTools?.(), config.RELOAD_LANGUAGE_TOOLS_DELAY),
      { deep: true }
    )
  }

  function serialize(): string {
    const state: TSerializeState = { ...store.getFiles() };
    state._o = userOptions;
    return utoa(JSON.stringify(state));
  }

  function deserialize(str: string): TSerializeState {
    return JSON.parse(atou(str));
  }

  function initFiles() {
    const files: Record<string, File> = Object.create(null)

    if (saved) {
      for (let [filename, file] of Object.entries(objectOmit(saved, ['_o']))) {
        if (![config.IMPORT_MAP, config.TSCONFIG].includes(filename) && !filename.startsWith('src/')) {
          filename = `src/${filename}`;
        }

        files[filename] = new File(filename, file as string);
      }
    } else {
      files[config.APP_FILE] = new File(config.APP_FILE, WelcomeTemplate);
    }

    if (!files[config.CDS_FILE]) {
      files[config.CDS_FILE] = new File(config.CDS_FILE, generateCdsCode(versions.cds, userOptions.styleSource));
    }

    if (!files[config.TSCONFIG]) {
      files[config.TSCONFIG] = new File(config.TSCONFIG, TsConfigTemplate);
    }

    if (!files[config.STYLES_FILE]) {
      files[config.STYLES_FILE] = new File(config.STYLES_FILE, StylesTemplate, hideFile);
    }

    return files;
  }

  function setTheme(value: string): void {
    theme.value = value;
    storage.value = value;
  }

  const utils = {
    versions,
    setVersion,
    setTheme,
    serialize,
    init,
    theme
  }

  Object.assign(store, utils);

  return store as typeof store & typeof utils;
};

export type ReplStore = ReturnType<typeof useStore>;
