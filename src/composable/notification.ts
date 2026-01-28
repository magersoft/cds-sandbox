import { reactive } from 'vue';
import { CdsNotificationAlert, utils } from '@central-design-system/components';
import { defineStore } from 'pinia';

export type TNotification = utils.ComponentProps<typeof CdsNotificationAlert> & {
  id: number;
};

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: reactive<TNotification[]>([])
  }),
  actions: {
    addNotification(text: string, status: TNotification['status'] = 'success') {
      const id = Date.now();

      this.notifications.push({
        id,
        modelValue: true,
        status,
        text,
        variant: 'compact',
        location: 'bottom',
        closable: true
      });
    }
  }
})
