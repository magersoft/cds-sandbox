<script setup lang="ts">
import { ref, version as vueVersion } from 'vue';
import { useTheme } from '@central-design-system/components';

const msg = ref('Central Design System 3.0');
const { name: currentThemeName } = useTheme();
</script>

<template>
  <cds-container>
    <cds-container-item>
      <h1>{{ msg }}</h1>
      <p>A Vue.js 3 Design System Library</p>

      <p class="cds-my-m">CDS v3.0 + Vue v{{ vueVersion }}</p>
      <p class="cds-my-m">Current theme: {{ currentThemeName }}</p>

      <cds-button
        class="cds-mr-xs"
        href="https://storybook.b2b-center.ru/"
        target="_blank"
      >
        Getting started
      </cds-button>
      <cds-button
        appearance="secondary"
        href="https://storybook.b2b-center.ru/"
        target="_blank"
      >
        Storybook
      </cds-button>
    </cds-container-item>
  </cds-container>
</template>
