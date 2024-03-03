type Long = {
  low: number;
  high: number;
  unsigned: boolean;
};

export type NotificationAction = {
  action?: string;
  icon?: string;
  placeholder?: string;
  title?: string;
  type?: 0 | 1;
};

/**
 * Actual data payload of the notification
 */
export type NotificationData = {
  direction?: 0 | 1 | 2;
  title?: string;
  lang?: string;
  body?: string;
  tag?: string;
  image?: string;
  icon?: string;
  badge?: string;
  vibrationPattern?: number[];
  timestamp?: Long;
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  data?: string;
  actions?: NotificationAction[];
  /**
   * Stored as offset from the windows epoch in microseconds
   */
  showTriggerTimestamp?: Long;
};

/**
 * Stores information about a Web Notification
 */
export type NotificationInfo = {
  key: string;
  closedReason?: 0 | 1 | 2;
  notificationId: string;
  origin?: string;
  serviceWorkerRegistrationId?: Long;
  replacedExistingNotification?: boolean;
  numClicks?: number;
  numActionButtonClicks?: number;
  creationTimeMillis?: Long;
  timeUntilFirstClickMillis?: Long;
  timeUntilLastClickMillis?: Long;
  timeUntilCloseMillis?: Long;
  notificationData?: NotificationData;
  /**
   * Keeps track if a notification with a `showTriggerTimestamp` has been displayed
   * already
   */
  hasTriggered?: boolean;
  /**
   * Flag for notifications shown by the browser that should not be visible to
   * the origin when requesting a list of notifications
   */
  isShownByBrowser?: boolean;
};
