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
import { useShortLink } from '@/composable/shortLink';

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

async function handleSetVersion(key: TVersionKey, v: string) {
  versions[key].active = `loading...`;
  await store.setVersion(key, v);
  versions[key].active = v;
}

async function handleChangeTheme(theme: string) {
  await store.setTheme(theme);
}

const { createShortLink, updateShortLink } = useShortLink();

const showSharedLinkDialog = ref(false);
const sharedLink = ref<string>('');
const originalHash = ref('');
const isPermanentLink = ref(false);
const isLoadingShortLink = ref(false);

async function handleShareLink() {
  isLoadingShortLink.value = true;

  try {
    if (!unref(sharedLink)) {
      const shortId = await createShortLink(location.hash.slice(1));
      sharedLink.value = `${location.origin}${location.pathname}?s=${shortId}`

      originalHash.value = location.hash.slice(1);
    } else {
      // if the state has changed, create a new short link
      if (originalHash.value !== location.hash.slice(1)) {
        const shortId = await createShortLink(location.hash.slice(1));
        sharedLink.value = `${location.origin}${location.pathname}?s=${shortId}`

        originalHash.value = location.hash.slice(1);
      }
    }

    showSharedLinkDialog.value = true;

    await handleCopyLink(unref(sharedLink));
  } catch (err) {
    console.error('Failed to create short link:', err);
    addNotification('Failed to create short link. Full URL has been copied to clipboard instead.', 'error');
    await handleCopyLink(location.href);
  }

  isLoadingShortLink.value = false;
}

async function handleCopyLink(link: string) {
  await navigator.clipboard.writeText(link);
  addNotification('URL has been copied to clipboard.');
}

watch(() => unref(isPermanentLink), async (value) => {
  if (unref(sharedLink)) {
    isLoadingShortLink.value = true;
    const shortId = unref(sharedLink).split('s=')[1];

    await updateShortLink(shortId, value);

    addNotification('Link has been updated to ' + (value ? 'permanent' : 'temporary') + ' link.');

    isLoadingShortLink.value = false;
  }
})

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

const notifications = reactive([]);

function addNotification(text: string, status = 'success') {
  const id = Date.now();

  const newNotification = {
    id,
    modelValue: true,
    status,
    text,
    variant: 'compact',
    location: 'bottom',
    closable: true
  };

  notifications.push(newNotification);
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
        <cds-functional-button title="Share URL" icon="external" :loading="isLoadingShortLink" @click="handleShareLink" />
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

    <cds-modal v-model="showSharedLinkDialog" dismiss-btn>
      <div class="cds-flex cds-justify-between cds-item-center">
        <h5 class="cds-mb-m">
          Your shared link is ready and copied to clipboard!
        </h5>
        <cds-functional-button icon="remove" @click="showSharedLinkDialog = false" />
      </div>

      <cds-text-input
        v-model="sharedLink"
        placeholder="Shared Link"
        prepend-inner-icon="link"
        readonly
        :loading="isLoadingShortLink"
        description="That link will expire in 7 days."
      >
        <template #append-inner>
          <cds-functional-button icon="copy" @click="() => handleCopyLink(sharedLink)" />
        </template>
      </cds-text-input>
      <cds-toggle v-model="isPermanentLink" :readonly="isLoadingShortLink" label="Permanent link" />
    </cds-modal>

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
