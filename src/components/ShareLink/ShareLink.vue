<script setup lang="ts">
import { useShareLink } from '@/components/ShareLink/features/useShareLink';
import { useIsAdmin } from '@/composable/isAdmin';

const { isAdmin } = useIsAdmin();

const { sharedLink, showSharedLinkDialog, isLoadingShortLink, isPermanentLink, handleShareLink, handleCopyLink } = useShareLink();
</script>

<template>
  <cds-functional-button title="Share URL" icon="external" :loading="isLoadingShortLink" @click="handleShareLink" />
  <cds-modal v-model="showSharedLinkDialog" dismiss-btn>
    <div class="cds-flex cds-justify-between cds-item-center">
      <h5 class="cds-mb-m">
        Your shared link is ready and copied to clipboard!
      </h5>
      <cds-functional-button icon="remove" @click="showSharedLinkDialog = false" />
    </div>

    <cds-text-input
      v-model="sharedLink"
      placeholder="Shared Link"
      prepend-inner-icon="link"
      readonly
      :loading="isLoadingShortLink"
      description="That link will expire in 14 days."
    >
      <template #append-inner>
        <cds-functional-button icon="copy" @click="() => handleCopyLink(sharedLink)" />
      </template>
    </cds-text-input>

    <cds-toggle
      v-if="isAdmin"
      v-model="isPermanentLink"
      :readonly="isLoadingShortLink"
      label="Permanent link"
    />
  </cds-modal>
</template>
