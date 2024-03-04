/**
 * Attempts to extract URLs from `data`
 * @param data The `data` property from `NotificationInfo.NotificationData`
 */
export function getUrlsFromData(data: string) {
  const regex =
    /(?<url>(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/;
  return data.match(regex)?.groups?.url;
}
