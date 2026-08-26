export function truncateText(text: string | undefined | null, wordCount = 2): string {
  if (!text) return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= wordCount) return text
  return `${words.slice(0, wordCount).join(' ')}...`
}
