import { getCurrentInstance } from 'vue';
import CdsComponents from '@central-design-system/components';

let installed = false;
await loadStyle();

export function createCds() {
  if (installed) return;
  const vm = getCurrentInstance();
  vm.appContext.app.use(CdsComponents);
  installed = true;
}

export function loadStyle() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '#STYLE#';
    link.addEventListener('load', resolve);
    link.addEventListener('error', reject);
    document.body.append(link);
  });
}
