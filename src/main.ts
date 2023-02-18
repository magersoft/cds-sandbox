import { createApp } from 'vue';
import App from './App.vue';
import CdsComponents from '@central-design-system/components';
import CdsIcon from '@central-design-system/components';

import './assets/main.scss';
import '@vue/repl/style.css';
import '@central-design-system/components/dist/cds.css';

const app = createApp(App);

app.use(CdsComponents);
app.use(CdsIcon);
app.mount('#app');
