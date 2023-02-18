<script setup lang="ts">
import { usePrettier } from '@/composable/prettier';

import type { ReplStore } from '@vue/repl';
import type { ComputedRef } from 'vue';

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

const onPrettier = () => {
  usePrettier(store);
};
</script>

<template>
  <header class="app-header cds-flex">
    <h1>CDS Sandbox</h1>
    {{ appVersion }}
    {{ replVersion }}
    <button @click="onPrettier">prettier</button>
  </header>
</template>

<style lang="scss">
@import './AppHeader';
</style>
