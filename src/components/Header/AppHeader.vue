<script setup lang="ts">
import { usePrettier } from '@/composable/prettier';
import { reactive } from 'vue';
import { languageToolsVersion } from '@vue/repl';
import { cdn, getSupportedCdsVersions, getSupportedTSVersions, getSupportedVueVersions } from '@/utils';

import cdsLogo from '../../assets/logo.svg?raw';

import type { ReplStore } from '@/composable';
import type { ComputedRef } from 'vue';
import type { TVersionKey } from '@/composable/store.d';
import config from '@/config';
import { useTheme } from '@central-design-system/components';
import { useNotificationStore } from '@/composable/notification';
import ShareLink from '@/components/ShareLink/ShareLink.vue';

const appVersion = import.meta.env.APP_VERSION;
const replVersion = import.meta.env.REPL_VERSION;

const { store } = defineProps<{
  store: ReplStore;
}>();
const emit = defineEmits<{
  (e: 'refresh'): void
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
  },
  typescript: {
    text: 'TypeScript',
    published: getSupportedTSVersions(),
    active: store.versions.typescript
  }
});

const cdnList = ['jsdelivr', 'jsdelivr-fastly', 'unpkg'];

const legacyVersion = computed(() => config.LEGACY_VERSIONS.some((legacyVersion) => store.versions.cds.startsWith(legacyVersion)));
const themesList = computed(() => unref(legacyVersion) ? config.LEGACY_THEME_LIST : config.THEME_LIST);

if (config.IS_DEV) {
  cdnList.push('local');
}

const dark = useDark()
const toggleDark = useToggle(dark);
const { notifications, addNotification } = useNotificationStore();

async function handleSetVersion(key: TVersionKey, v: string) {
  versions[key].active = `loading...`;
  await store.setVersion(key, v);
  versions[key].active = v;
}

async function handleChangeTheme(theme: string) {
  await store.setTheme(theme);
}

function handlePrettier() {
  usePrettier(store);
  addNotification('Your code is prettier now!');
}

function handleRefreshView() {
  emit('refresh');
}

const theme = useTheme();
function handleToggleTheme() {
  toggleDark();
  theme.global.name.value = theme.global.current.value.dark ? 'cdsLight' : 'cdsDark'
}
</script>

<template>
  <header class="app-header cds-flex cds-justify-between">
    <div class="cds-flex cds-items-center">
      <div v-html="cdsLogo" class="logo" />
      <h1 class="title">Sandbox</h1>
      <div class="tags">
        <cds-tag color="indigo">v{{ appVersion }}</cds-tag>
        <cds-tag color="cyan">repl v{{ replVersion }}</cds-tag>
        <cds-tag color="cyan">volar v{{ languageToolsVersion }}</cds-tag>
      </div>
      <div class="themes">
        <cds-menu width="100">
          <template #activator="{ props }">
            <cds-button
              :text="store.theme"
              prepend-icon="fill"
              size="sm"
              appearance="tertiary"
              style="width:100px"
              v-bind="props"
            />
          </template>
          <cds-list>
            <cds-list-item
              v-for="theme in themesList"
              :active="theme === store.theme"
              :value="theme"
              @click="handleChangeTheme(theme)"
            >
              {{ theme }}
            </cds-list-item>
          </cds-list>
        </cds-menu>
      </div>
    </div>
    <div class="cds-flex cds-items-center cds-gap-6">
      <div class="versions">
        <div class="control">
          <span class="cds-text-xs">CDS:</span>
          <cds-dropdown
            v-model="versions.cds.active"
            :items="versions.cds.published"
            placeholder="CDS version"
            hide-messages
            @update:model-value="(value) => handleSetVersion('cds', value)"
          />
        </div>

        <div class="control">
          <span class="cds-text-xs">Vue:</span>
          <cds-dropdown
            v-model="versions.vue.active"
            :items="versions.vue.published"
            placeholder="Vue version"
            hide-messages
            @update:model-value="(value) => handleSetVersion('vue', value)"
          />
        </div>

        <div class="control">
          <span class="cds-text-xs">TypeScript:</span>
          <cds-dropdown
            v-model="versions.typescript.active"
            :items="versions.typescript.published"
            placeholder="Vue version"
            hide-messages
            @update:model-value="(value) => handleSetVersion('typescript', value)"
          />
        </div>
      </div>
      <div class="actions">
        <share-link />
        <cds-functional-button title="Change Sandbox Theme" :icon="dark ? 'star-fill' : 'star'" @click="handleToggleTheme" />

        <cds-menu :close-on-content-click="false" width="190" transition="scale-transition">
          <template #activator="{ props }">
            <cds-functional-button icon="settings" appearance="tertiary" v-bind="props" />
          </template>
          <div class="cds-flex cds-pa-xs">
            <div class="cds-w-full">
              <cds-dropdown label="CDN" v-model="cdn" :items="cdnList" hide-messages />
            </div>
          </div>
        </cds-menu>
      </div>
    </div>

    <cds-notification-alert
      v-for="notification in notifications"
      :key="notification.id"
      v-bind="notification"
    />
  </header>
</template>

<style lang="scss">
@import './AppHeader';
</style>
