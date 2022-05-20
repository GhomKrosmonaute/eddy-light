/**
 * build response with dataset
 * @param channel
 * @param target
 * @param context
 */
export async function generateResponse(
  channel: string,
  target: string,
  context: string
): Promise<string> {
  return "Oui"
}

/**
 * check emotes, links, insults, mentions
 * @param content
 */
export function normalizeContent(content: string): string {
  return content
}
