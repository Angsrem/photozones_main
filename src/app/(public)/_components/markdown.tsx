'use client';

import ReactMarkdown from 'react-markdown';

/** Рендер markdown-контента статьи с премиальной стилизацией. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-muted-foreground leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-3xl sm:text-4xl text-foreground mt-10 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-xl sm:text-2xl text-foreground mt-6 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="text-base mb-4 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1.5 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1.5 mb-4">{children}</ol>,
          li: ({ children }) => <li className="text-base">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-foreground/90">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gold pl-4 italic text-foreground/90 my-4">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">{children}</code>
          ),
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
