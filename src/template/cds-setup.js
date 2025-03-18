import { getCurrentInstance } from 'vue';
import { createCds, components, directives } from '@central-design-system/components';
import { icons } from '@central-design-system/icons';
import { illustrations } from '@central-design-system/illustrations';

let installed = false;
await loadStyle();

export function setupCds() {
  if (installed) return;
  const cds = createCds({
    components,
    directives,
    icons,
    illustrations,
    theme: {
      defaultTheme: '#THEME#'
    }
  });
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

    const illustrationLink = document.createElement('link');
    illustrationLink.rel = 'stylesheet';
    illustrationLink.href = '#ILLUSTRATIONS_STYLE#';
    illustrationLink.addEventListener('load', resolve);
    illustrationLink.addEventListener('error', reject);
    document.body.append(illustrationLink);
  });
}
