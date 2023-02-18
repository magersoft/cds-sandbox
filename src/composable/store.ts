import { reactive, shallowRef, watch, watchEffect } from 'vue';
import { File, compileFile } from '@vue/repl';
import { atou, generateImportMap, getCdnLink, getVueLink, mergeImportMap, utoa } from '@/utils';
import config from '@/config';

import helloWorldTemplate from '@/template/HelloWorld.vue?raw';
import mainTemplate from '@/template/Main.vue?raw';
import cdsSetupTemplate from '@/template/cds-setup.js?raw';

import type { IInitial, IUseStore, IUserOptions, TSerializeState, TVersionKey } from './store.d';
import type { StoreState, Store } from '@vue/repl';
import type { IImportMap } from '@/utils';

export const useStore = (initial: IInitial): IUseStore => {
  let compiler = $(shallowRef<typeof import('vue/compiler-sfc')>());
  let userOptions = $ref<IUserOptions>(initial.userOptions || {});

  const versions = reactive(initial.versions || { vue: 'latest', cds: 'latest' });
  const hideFile = $computed(() => !config.IS_DEV && !userOptions.showHidden);

  const files = initFiles(initial.serializedState || '');
  const state = reactive<StoreState>({
    mainFile: config.MAIN_FILE,
    files,
    activeFile: files[config.APP_FILE],
    errors: [],
    vueRuntimeURL: '',
    vueServerRendererURL: '',
    resetFlip: false
  });

  const builtinImportMap = $computed<IImportMap>(() => generateImportMap(versions));

  const userImportMap = $computed<IImportMap>(() => {
    const code = state.files[config.USER_IMPORT_MAP]?.code.trim();

    if (!code) return {};

    let map: IImportMap = {};

    try {
      map = JSON.parse(code);
    } catch (err) {
      console.error(err);
    }

    return map;
  });

  const importMap = $computed<IImportMap>(() => mergeImportMap(builtinImportMap, userImportMap));

  if (config.IS_DEV) {
    console.log('Files:', files, 'Options:', userOptions);
  }

  const store: Store = reactive({
    init,
    state,
    compiler: $$(compiler!),
    setActive,
    addFile,
    deleteFile,
    getImportMap,
    initialShowOutput: false,
    initialOutputMode: 'preview'
  });

  watch(
    $$(importMap),
    (content) => {
      state.files[config.IMPORT_MAP] = new File(config.IMPORT_MAP, JSON.stringify(content, undefined, 2), hideFile);
    },
    { immediate: true, deep: true }
  );

  watch(
    () => versions.cds,
    (version) => {
      const file = new File(config.CDS_FILE, generateCdsCode(version, userOptions.styleSource).trim(), hideFile);
      state.files[config.CDS_FILE] = file;
      compileFile(store, file);
    },
    { immediate: true }
  );

  function generateCdsCode(version: string, stylesSource?: string) {
    const style = stylesSource
      ? stylesSource.replace('#VERSION#', version)
      : getCdnLink('@central-design-system/components', version, '/dist/cds.css');
    return cdsSetupTemplate.replace('#STYLE#', style);
  }

  async function setVueVersion(version: string) {
    const { compilerSfc, runtimeDom } = getVueLink(version);

    compiler = await import(/* @vite-ignore */ compilerSfc);
    state.vueRuntimeURL = runtimeDom;
    versions.vue = version;

    console.info(`[@vue/repl] Vue version set to ${version}]`);
  }

  async function init() {
    await setVueVersion(versions.vue);

    for (const file of Object.values(state.files)) {
      compileFile(store, file);
    }

    watchEffect(() => compileFile(store, state.activeFile));
  }

  function getFiles() {
    const exported: Record<string, string> = {};
    for (const file of Object.values(state.files)) {
      if (file.hidden) continue;
      exported[file.filename] = file.code;
    }
    return exported;
  }

  function serialize() {
    const state: TSerializeState = { ...getFiles() };
    state._o = userOptions;
    return utoa(JSON.stringify(state));
  }

  function deserialize(str: string): TSerializeState {
    return JSON.parse(atou(str));
  }

  function initFiles(serializedState: string) {
    const files: StoreState['files'] = {};

    if (serializedState) {
      const saved = deserialize(serializedState);

      for (const [filename, file] of Object.entries(saved)) {
        if (filename === '_o') continue;
        files[filename] = new File(filename, file as string);
      }

      userOptions = saved._o || {};
    } else {
      files[config.APP_FILE] = new File(config.APP_FILE, helloWorldTemplate);
    }

    files[config.MAIN_FILE] = new File(config.MAIN_FILE, mainTemplate, hideFile);

    if (!files[config.USER_IMPORT_MAP]) {
      files[config.USER_IMPORT_MAP] = new File(config.USER_IMPORT_MAP, JSON.stringify({ imports: {} }, undefined, 2));
    }

    return files;
  }

  function setActive(filename: string) {
    const file = state.files[filename];
    if (file.hidden) return;
    state.activeFile = file;
  }

  function addFile(fileOrFilename: string | File) {
    const file = typeof fileOrFilename === 'string' ? new File(fileOrFilename) : fileOrFilename;
    state.files[file.filename] = file;
    setActive(file.filename);
  }

  async function deleteFile(filename: string) {
    const configFiles = [config.MAIN_FILE, config.APP_FILE, config.CDS_FILE, config.USER_IMPORT_MAP, config.IMPORT_MAP];

    if (configFiles.includes(filename)) {
      alert('You cannot remove this file. It is required for the CDS Sandbox to work.');
      return;
    }

    if (await confirm(`Are you sure you want to delete ${filename}?`)) {
      if (state.activeFile.filename === filename) {
        setActive(config.APP_FILE);
      }
      delete state.files[filename];
    }
  }

  function getImportMap() {
    return importMap;
  }

  async function setVersion(key: TVersionKey, version: string) {
    switch (key) {
      case 'cds':
        await setCdsVersion(version);
        break;
      case 'vue':
        await setVueVersion(version);
        break;
    }
  }

  function setCdsVersion(version: string) {
    versions.cds = version;
  }

  return {
    ...store,

    versions,
    userOptions: $$(userOptions),

    init,
    serialize,
    setVersion,
    pr: initial.pr
  };
};

export type ReplStore = ReturnType<typeof useStore>;
