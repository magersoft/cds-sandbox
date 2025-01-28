export default {
  MAIN_FILE: 'src/Main.vue',
  APP_FILE: 'src/App.vue',
  CDS_FILE: 'src/cds-setup.js',
  STYLES_FILE: 'src/styles.css',
  LEGACY_STYLES_FILE: 'src/legacy-styles.css',
  IMPORT_MAP: 'import-map.json',
  TSCONFIG: 'tsconfig.json',
  IS_DEV: import.meta.env.DEV,
  CDS_VERSION: 'latest',
  VUE_VERSION: 'latest',
  TYPESCRIPT_VERSION: 'latest',
  DEFAULT_THEME: 'cdsLight',
  LEGACY_DEFAULT_THEME: 'cds',
  LEGACY_VERSIONS: ['3.0.0-beta', 'latest'], // @todo remove latest after release
  THEME_LIST: ['cdsLight', 'cdsDark', 'b2bLight', 'b2bDark'],
  LEGACY_THEME_LIST: ['cds', 'b2b', 'dark', 'promo'],
  AUTO_SAVE_KEY: 'cds-auto-save-state',
  RELOAD_LANGUAGE_TOOLS_DELAY: 300
};
