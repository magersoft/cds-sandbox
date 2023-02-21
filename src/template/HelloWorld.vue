<script setup lang="ts">
import { ref, version as vueVersion } from 'vue';

const msg = ref('Central Design System 3.0');
</script>

<template>
  <div class="cds-pa-m">
    <h1>{{ msg }}</h1>
    <p>A Vue.js 3 Design System Library</p>

    <p class="cds-my-m">CDS v3.0 + Vue v{{ vueVersion }}</p>
    <cds-button class="cds-mr-xs">Getting started</cds-button>
    <cds-button appearance="secondary">Documentation</cds-button>
  </div>
</template>
