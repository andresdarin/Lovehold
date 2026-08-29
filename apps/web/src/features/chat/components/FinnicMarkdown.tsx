'use client'

import ReactMarkdown from 'react-markdown'

interface FinnicMarkdownProps {
  content: string
}

/**
 * Renders Finnic's chat responses with sanitized Markdown.
 * Supports bold, italic, lists, and paragraphs only.
 * Strips headers, code blocks, images, and links for chat safety.
 */
export default function FinnicMarkdown({ content }: FinnicMarkdownProps) {
  return (
    <ReactMarkdown
      allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'del']}
      unwrapDisallowed
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="ml-3.5 mb-2 last:mb-0 space-y-0.5 list-disc marker:text-primary/40">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="ml-3.5 mb-2 last:mb-0 space-y-0.5 list-decimal marker:text-primary/40">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="pl-0.5">{children}</li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
