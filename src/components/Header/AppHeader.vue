<script setup lang="ts">
import { usePrettier } from '@/composable/prettier';
import { reactive } from 'vue';
import { cdn, getSupportedCdsVersions, getSupportedVueVersions } from '@/utils';

import cdsLogo from '../../assets/logo.svg?raw';
import githubSvg from '../../assets/icons/github.svg?raw';

import type { ReplStore } from '@/composable';
import type { ComputedRef } from 'vue';
import type { TVersionKey } from '@/composable/store.d';
import config from '@/config';

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

const cdnList = ['jsdelivr', 'jsdelivr-fastly', 'unpkg'];

if (config.IS_DEV) {
  cdnList.push('local');
}

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
        <div class="control">
          <span>CDS version:</span>
          <cds-dropdown
            v-model="versions.cds.active"
            :items="versions.cds.published"
            placeholder="CDS version"
            hide-messages
            @update:model-value="(value) => handleSetVersion('cds', value)"
          />
        </div>

        <div class="control">
          <span>Vue version:</span>
          <cds-dropdown
            v-model="versions.vue.active"
            :items="versions.vue.published"
            placeholder="Vue version"
            hide-messages
            @update:model-value="(value) => handleSetVersion('vue', value)"
          />
        </div>

        <div class="control">
          <span>CDN:</span>
          <cds-dropdown v-model="cdn" :items="cdnList" hide-messages />
        </div>
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
