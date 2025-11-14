/**
 * Converts markdown text to plain text by removing markdown syntax
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // Remove code blocks (```code```)
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove headers (# ## ###)
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');
  
  // Remove bold (**text** or __text__)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  
  // Remove italic (*text* or _text_)
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  
  // Remove links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  
  // Convert markdown lists to plain text
  // Remove list markers but keep content
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Remove horizontal rules
  text = text.replace(/^---$/gm, '');
  text = text.replace(/^\*\*\*$/gm, '');
  
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  
  // Clean up multiple newlines (max 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

