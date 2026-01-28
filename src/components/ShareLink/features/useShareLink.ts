import { useShortLink } from '@/composable/shortLink';
import { useNotificationStore } from '@/composable/notification';
import { getIsAdmin } from '@/composable/isAdmin';

export function useShareLink() {
  const { createShortLink, updateShortLink } = useShortLink();
  const { notifications, addNotification } = useNotificationStore();

  const showSharedLinkDialog = ref(false);
  const sharedLink = ref<string>('');
  const originalHash = ref('');
  const isPermanentLink = ref(false);
  const isLoadingShortLink = ref(false);

  async function handleShareLink() {
    isLoadingShortLink.value = true;

    try {
      if (!unref(sharedLink)) {
        const shortId = await createShortLink(location.hash.slice(1));
        sharedLink.value = `${location.origin}${location.pathname}?s=${shortId}`

        originalHash.value = location.hash.slice(1);
      } else {
        // if the state has changed, create a new short link
        if (originalHash.value !== location.hash.slice(1)) {
          const shortId = await createShortLink(location.hash.slice(1));
          sharedLink.value = `${location.origin}${location.pathname}?s=${shortId}`

          originalHash.value = location.hash.slice(1);
        }
      }

      showSharedLinkDialog.value = true;

      await handleCopyLink(unref(sharedLink));
    } catch (err) {
      console.error('Failed to create short link:', err);
      addNotification('Failed to create short link. Full URL has been copied to clipboard instead.', 'error');
      await handleCopyLink(location.href);
    }

    isLoadingShortLink.value = false;
  }

  async function handleCopyLink(link: string) {
    await navigator.clipboard.writeText(link);
    addNotification('URL has been copied to clipboard.');
  }

  watch(() => unref(isPermanentLink), async (value, oldValue) => {
    if (!unref(sharedLink)) {
      return;
    }

    // Защита на уровне логики: даже если UI-toggle как-то появился,
    // не-админ не должен отправлять PATCH на сервер.
    if (!getIsAdmin()) {
      isPermanentLink.value = oldValue ?? false;
      addNotification('You are not allowed to create permanent links.', 'error');
      return;
    }

    isLoadingShortLink.value = true;

    try {
      const url = new URL(unref(sharedLink), window.location.origin);
      const shortId = url.searchParams.get('s');

      if (!shortId) {
        throw new Error('ShortId is missing in shared link');
      }

      await updateShortLink(shortId, value);

      addNotification('Link has been updated to ' + (value ? 'permanent' : 'temporary') + ' link.');
    } catch (e) {
      // Откатываем UI, если запрос не прошёл
      isPermanentLink.value = oldValue ?? false;
      console.error(e);
      addNotification('Failed to update link.', 'error');
    } finally {
      isLoadingShortLink.value = false;
    }
  })

  return {
    showSharedLinkDialog,
    sharedLink,
    isPermanentLink,
    isLoadingShortLink,
    notifications,
    handleShareLink,
    handleCopyLink
  }
}
