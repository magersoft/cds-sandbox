<script setup lang="ts">
import { usePrettier } from '@/composable/prettier';
import { reactive } from 'vue';
import { getSupportedCdsVersions, getSupportedVueVersions } from '@/utils';

import cdsLogo from '../../assets/logo.svg?raw';
import githubSvg from '../../assets/icons/github.svg?raw';

import type { ReplStore } from '@/composable';
import type { ComputedRef } from 'vue';
import type { TVersionKey } from '@/composable/store.d';

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
  alert('URL has been copied to clipboard.');
}

function handlePrettier() {
  usePrettier(store);
  alert('Your code is prettier now!');
}

function handleGithub() {
  window.open('https://github.com/magersoft/cds-sandbox', '_blank');
}
</script>

<template>
  <header class="app-header cds-flex cds-justify-between">
    <div class="cds-flex cds-items-center">
      <div v-html="cdsLogo" class="logo" />
      <h1 class="title">Sandbox</h1>
      <div class="tags">
        <cds-tag color="blue">v{{ appVersion }}</cds-tag>
        <cds-tag color="blue">repl v{{ replVersion }}</cds-tag>
      </div>
    </div>
    <div class="cds-flex cds-items-center">
      <div class="versions">
        CDS version:
        <select
          :name="versions.cds.text"
          id="versionVue"
          @change="(event) => handleSetVersion('cds', event.target?.value)"
        >
          <option :value="versions.cds.active">{{ versions.cds.active }}</option>
          <option v-for="version in versions.cds.published" :key="version" :value="version">{{ version }}</option>
        </select>
        Vue version:
        <select
          :name="versions.vue.text"
          id="versionVue"
          @change="(event) => handleSetVersion('vue', event.target?.value)"
        >
          <option :value="versions.vue.active">{{ versions.vue.active }}</option>
          <option v-for="version in versions.vue.published" :key="version" :value="version">{{ version }}</option>
        </select>
      </div>
      <div class="actions">
        <cds-button
          title="Prettier code"
          dark
          appearance="transparent"
          prepend-icon="edit"
          icon-only
          @click="handlePrettier"
        />
        <cds-button
          title="Copy URL"
          dark
          appearance="transparent"
          prepend-icon="copy"
          icon-only
          @click="handleCopyLink"
        />
        <cds-button title="Show on Github" dark appearance="transparent" icon-only @click="handleGithub">
          <template #prepend>
            <i v-html="githubSvg" class="svg-icon" />
          </template>
        </cds-button>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@import './AppHeader';
</style>
