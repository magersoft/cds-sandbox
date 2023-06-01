import { getCurrentInstance } from 'vue';
import { createCds, components, directives } from '@central-design-system/components';
import { icons } from '@central-design-system/icons';
import { illustrations } from '@central-design-system/illustrations';

let installed = false;
await loadStyle();

export function setupCds() {
  if (installed) return;
  const cds = createCds({ components, directives, icons, illustrations });
  const vm = getCurrentInstance();
  vm.appContext.app.use(cds);
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
