<script setup lang="ts">
import { ref, version as vueVersion } from 'vue';

const msg = ref('Hello World!');
</script>

<template>
  <h1>{{ msg }}</h1>

  <p>Cds Components 3.0 + Vue {{ vueVersion }}</p>
  <cds-button>Button</cds-button>
</template>
