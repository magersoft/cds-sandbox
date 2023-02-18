<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { Repl } from '@vue/repl';
import { usePrettier } from '@/composable';
import config from '@/config';

import type { ReplStore } from '@/composable/store';
import type { SFCOptions } from '@vue/repl';

const { store } = defineProps<{
  store: ReplStore;
}>();
let loading = ref(true);

const showImportMap = ref(store.userOptions.value.showHidden || config.IS_DEV);
const sfcOptions: SFCOptions = {
  script: {
    reactivityTransform: true
  }
};

store.init().then(() => (loading.value = false));

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    return;
  }

  if ((event.altKey || event.ctrlKey) && event.shiftKey && event.code === 'KeyF') {
    event.preventDefault();
    usePrettier(store);
    return;
  }
};

watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`));
</script>

<template>
  <main v-if="!loading">
    <repl
      ref="repl"
      :store="store"
      show-compile-output
      auto-resize
      :sfc-options="sfcOptions"
      :clear-console="false"
      :show-import-map="showImportMap"
      @keydown="handleKeydown"
    />
  </main>
  <template v-else>
    <cds-loader />
  </template>
</template>

<style lang="scss">
@import './AppSandbox';
</style>
