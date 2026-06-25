/**
 * @param topic The topic string template
 * @param params The parameters to interpolate into the topic
 */
export const generateMqttTopic = (
  topic: string,
  params: Record<string, string>
) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, value);
  }, topic);
};
