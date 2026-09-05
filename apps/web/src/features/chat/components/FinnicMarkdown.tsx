'use client'
import ReactMarkdown from 'react-markdown'
const routes = new Set(['/dashboard', '/expenses', '/expenses/new', '/balance', '/finanzas', '/goals', '/fuel', '/settings', '/profile', '/chat'])
/** Only verified product routes become links; HTML, images and external URLs cannot execute. */
export default function FinnicMarkdown({ content }: { content: string }) {
  return <ReactMarkdown allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'del', 'a']} unwrapDisallowed skipHtml
    components={{ a: ({ href, children }) => href && routes.has(href) ? <a href={href} className="font-medium text-primary underline underline-offset-4">{children}</a> : <span>{children}</span> }}>
    {content}
  </ReactMarkdown>
}

