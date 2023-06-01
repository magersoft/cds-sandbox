import { createApp } from 'vue';
import App from './App.vue';
import { createCds, components } from '@central-design-system/components';
import { icons } from '@central-design-system/icons';

import './assets/main.scss';
import '@vue/repl/style.css';
import '@central-design-system/components/dist/cds.css';

const app = createApp(App);
const cds = createCds({ components, icons });

app.use(cds);
app.mount('#app');
