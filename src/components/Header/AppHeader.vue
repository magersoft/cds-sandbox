<script setup lang="ts">
import { usePrettier } from '@/composable/prettier';
import { reactive } from 'vue';

import type { ReplStore } from '@/composable';
import type { ComputedRef } from 'vue';
import type { TVersionKey } from '@/composable/store.d';
import { getSupportedCdsVersions, getSupportedVueVersions } from '@/utils';

const appVersion = import.meta.env.APP_VERSION;
const replVersion = import.meta.env.REPL_VERSION;

const { store } = defineProps<{
  store: ReplStore;
}>();

interface IVersion {
  text: string;
  published: ComputedRef<string[]>;
  active: string;
}

const versions = reactive<Record<TVersionKey, IVersion>>({
  cds: {
    text: 'CDS',
    published: getSupportedCdsVersions(),
    active: store.versions.cds
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue
  }
});

async function handleSetVersion(key: TVersionKey, v: string) {
  console.log(v);
  versions[key].active = `loading...`;
  await store.setVersion(key, v);
  versions[key].active = v;
}

async function handleCopyLink() {
  await navigator.clipboard.writeText(location.href);
  alert('Sharable URL has been copied to clipboard.');
}

function handlePrettier() {
  usePrettier(store);
}
</script>

<template>
  <header class="app-header cds-flex cds-justify-between">
    <div>
      <h1>
        CDS Sandbox <small>v{{ appVersion }} repl v{{ replVersion }}</small>
      </h1>
    </div>
    <div>
      CDS version:
      <select
        :name="versions.cds.text"
        id="versionVue"
        @change="(event) => handleSetVersion('cds', event.target.value)"
      >
        <option :value="versions.cds.active">{{ versions.cds.active }}</option>
        <option v-for="version in versions.cds.published" :key="version" :value="version">{{ version }}</option>
      </select>
      Vue version:
      <select
        :name="versions.vue.text"
        id="versionVue"
        @change="(event) => handleSetVersion('vue', event.target.value)"
      >
        <option :value="versions.vue.active">{{ versions.vue.active }}</option>
        <option v-for="version in versions.vue.published" :key="version" :value="version">{{ version }}</option>
      </select>
      <cds-button dark appearance="transparent" @click="handlePrettier">prettier</cds-button>
      <cds-button dark appearance="transparent" @click="handleCopyLink">copy</cds-button>
    </div>
  </header>
</template>

<style lang="scss">
@import './AppHeader';
</style>
