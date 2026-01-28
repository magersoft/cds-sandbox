type AdminFlag = boolean;

function parseTruthy(value: string | null | undefined): boolean {
  if (value == null) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'y' || v === 'on';
}

function safeGetLocalStorageItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeGetCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const [k, ...rest] = cookie.trim().split('=');
      if (k === name) return decodeURIComponent(rest.join('='));
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Админ-флаг читается из:
 *  - localStorage['cds-is-admin'] (приоритет)
 *  - cookie 'isAdmin'
 *
 * Значения, считающиеся true: 1/true/yes/y/on (в любом регистре).
 */
export function getIsAdmin(): AdminFlag {
  const fromLs = safeGetLocalStorageItem('cds-is-admin');
  if (fromLs != null) return parseTruthy(fromLs);

  const fromCookie = safeGetCookie('isAdmin');
  return parseTruthy(fromCookie);
}

export function useIsAdmin() {
  const isAdmin = computed(() => getIsAdmin());
  return { isAdmin };
}
