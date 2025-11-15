'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType === 'ul' ? 'ul' : 'ol';
      elements.push(
        <ListTag key={`list-${i}`} className="list-disc list-inside space-y-1 my-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[var(--text)]/90">
              {renderInlineMarkdown(item.trim())}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      const codeText = codeBlockContent.join('\n');
      elements.push(
        <pre key={`code-${i}`} className="bg-[var(--background)]/70 border border-[var(--primary)]/20 rounded-lg p-4 my-3 overflow-x-auto">
          <code className="text-sm font-mono text-[var(--text)]/90 whitespace-pre">{codeText}</code>
        </pre>
      );
      codeBlockContent = [];
      inCodeBlock = false;
    }
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Handle bold (**text** or __text__)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Handle italic (*text* or _text_)
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code class="bg-[var(--background)]/70 px-1.5 py-0.5 rounded text-xs font-mono text-[var(--primary)]">$1</code>');
    
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  while (i < lines.length) {
    const line = lines[i];
    
    // Check for code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      i++;
      continue;
    }

    // Check for headers
    if (line.match(/^#{1,6}\s+/)) {
      flushList();
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const Tag = `h${Math.min(level + 2, 6)}` as 'h3' | 'h4' | 'h5' | 'h6';
        elements.push(
          <Tag key={`h-${i}`} className={`font-bold text-[var(--text)] mt-4 mb-2 ${
            level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'
          }`}>
            {renderInlineMarkdown(text)}
          </Tag>
        );
      }
      i++;
      continue;
    }

    // Check for list items
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    
    if (ulMatch || olMatch) {
      const isOl = !!olMatch;
      const content = ulMatch?.[1] || olMatch?.[1] || '';
      
      if (listType && listType !== (isOl ? 'ol' : 'ul')) {
        flushList();
      }
      
      if (!listType) {
        listType = isOl ? 'ol' : 'ul';
      }
      
      listItems.push(content);
      i++;
      continue;
    }

    // If we have accumulated list items and hit a non-list line, flush them
    if (listItems.length > 0) {
      flushList();
    }

    // Check for horizontal rule
    if (line.match(/^---$/)) {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-[var(--primary)]/20" />);
      i++;
      continue;
    }

    // Check for blockquote
    if (line.match(/^>\s+(.+)$/)) {
      const match = line.match(/^>\s+(.+)$/);
      if (match) {
        elements.push(
          <blockquote key={`blockquote-${i}`} className="border-l-4 border-[var(--primary)]/40 pl-4 my-2 italic text-[var(--text)]/80">
            {renderInlineMarkdown(match[1])}
          </blockquote>
        );
      }
      i++;
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="text-[var(--text)]/90 leading-relaxed my-2">
          {renderInlineMarkdown(line.trim())}
        </p>
      );
    } else {
      // Empty line - add spacing
      if (elements.length > 0 && elements[elements.length - 1]) {
        // Only add spacing if previous element isn't already a spacing element
        const lastKey = (elements[elements.length - 1] as any)?.key;
        if (!lastKey?.includes('spacer')) {
          elements.push(<div key={`spacer-${i}`} className="h-2" />);
        }
      }
    }

    i++;
  }

  // Flush any remaining lists or code blocks
  flushList();
  flushCodeBlock();

  return (
    <div className={`markdown-content ${className}`}>
      {elements}
    </div>
  );
}

