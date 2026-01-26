<script setup lang="ts">
import { useStore } from '@/composable';
import Monaco from '@vue/repl/monaco-editor'
import { Repl } from '@vue/repl';
import { ref } from 'vue';
import config from '@/config';
import { AppHeader } from '@/components';
import { useShortLink } from '@/composable/shortLink';

const loading = ref(true);
const shortId = new URLSearchParams(location.search).get('s') || undefined;

const serializedState = ref<string>(location.hash.slice(1));

const store = useStore({
  serializedState: unref(serializedState),
  initialized() {
    if (!shortId) {
      loading.value = false;
    }
  },
});

console.log('Store:', store);

const { getShortLink } = useShortLink();

onMounted(async () => {
  if (!shortId) return;

  loading.value = true;
  try {
    const serializedStateFromServer = await getShortLink(shortId);

    if (typeof serializedStateFromServer === 'string' && serializedStateFromServer.length > 0) {
      serializedState.value = serializedStateFromServer;
      history.replaceState({}, '', `${location.origin}${location.pathname}#${serializedStateFromServer}`);

      window.location.reload();
    } else {
      loading.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch short link:', error);
  }
})

const autoSave = ref(getAutoSaveState());
watch(autoSave, setAutoSaveState);

const dark = useDark();
const theme = new URLSearchParams(location.search).get('theme');
if (theme === 'dark') {
  dark.value = true;
}

// persist state
watchEffect(() =>
  history.replaceState(
    {},
    '',
    `${location.origin}${location.pathname}#${store.serialize()}`,
  ),
);

const replRef = ref<InstanceType<typeof Repl>>();

const refreshPreview = () => {
  replRef.value?.reload();
};

const handleKeydown = (evt: KeyboardEvent) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyS') {
    evt.preventDefault()
    return
  }
}

function getAutoSaveState() {
  return JSON.parse(localStorage.getItem(config.AUTO_SAVE_KEY) || 'true')
}

function setAutoSaveState(value: boolean) {
  localStorage.setItem(config.AUTO_SAVE_KEY, JSON.stringify(value))
}
</script>

<template>
  <div v-if="!loading" antialiased>
    <AppHeader :store="store" @refresh="refreshPreview" />
    <Repl
      ref="replRef"
      v-model="autoSave"
      :theme="dark ? 'dark' : 'light'"
      :preview-theme="true"
      :store="store"
      :editor="Monaco"
      :clear-console="false"
      @keydown="handleKeydown"
    />
  </div>

  <template v-else>
    <cds-loader class="cds-flex cds-items-center cds-justify-center cds-h-full" />
  </template>
</template>

<style lang="scss">
body {
  --nav-height: 50px;
  background-color: rgb(var(--cds-color-page-primary)) !important;
}

.vue-repl {
  height: calc(100vh - var(--nav-height)) !important;
  --color-branding: rgb(var(--cds-color-brand-primary)) !important;
}
</style>
