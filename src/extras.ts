/**
 * Attempts to extract URLs from `data`
 * @param data The `data` property from `NotificationInfo.NotificationData`
 * @returns
 */
export function getUrlsFromData(data: string) {
  const regex =
    /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;
  return data.match(regex);
}
