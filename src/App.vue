<script setup lang="ts">
import { AppHeader, AppSandbox } from '@/components';
import { useStore } from '@/composable';
import config from '@/config';

import type { IUserOptions } from '@/composable/store.d';

const serializedState = location.hash.slice(1);
const userOptions: IUserOptions = {};
const pr = new URLSearchParams(location.search).get('pr');

const store = useStore({ serializedState, userOptions, pr });

if (config.IS_DEV) {
  console.log('Store', store);
}
</script>

<template>
  <div class="cds-sandbox dark">
    <app-header :store="store" />
    <app-sandbox :store="store" />
  </div>
</template>

<style scoped lang="scss"></style>
