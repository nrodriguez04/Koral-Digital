import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Minimal, XSS-safe markdown renderer for editorial content. Produces React
 * elements (never raw HTML). Supports: ## / ### headings, paragraphs, "- "
 * bullets, "1. " ordered lists, "> " blockquotes, **bold**, *italic* and
 * [text](href) links (relative paths or http(s) only).
 */
export function renderMarkdown(src: string): ReactNode[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      const text = h[2]!.trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      out.push(
        h[1] === '##' ? (
          <h2 key={key++} id={id}>
            {inline(text)}
          </h2>
        ) : (
          <h3 key={key++} id={id}>
            {inline(text)}
          </h3>
        ),
      );
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^[-*]\s+/, ''));
      out.push(
        <ul key={key++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!))
        items.push(lines[i++]!.replace(/^\d+\.\s+/, ''));
      out.push(
        <ol key={key++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) quote.push(lines[i++]!.replace(/^>\s?/, ''));
      out.push(<blockquote key={key++}>{inline(quote.join(' '))}</blockquote>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{2,3}\s|[-*]\s|\d+\.\s|>\s?)/.test(lines[i]!)) {
      para.push(lines[i++]!.trim());
    }
    out.push(<p key={key++}>{inline(para.join(' '))}</p>);
  }
  return out;
}

function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('#')) return href;
  return null;
}

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) nodes.push(<strong key={k++}>{m[2]}</strong>);
    else if (m[3]) nodes.push(<em key={k++}>{m[4]}</em>);
    else if (m[5]) {
      const href = safeHref(m[7]!);
      if (!href) nodes.push(m[6]);
      else if (href.startsWith('/'))
        nodes.push(
          <Link key={k++} href={href}>
            {m[6]}
          </Link>,
        );
      else
        nodes.push(
          <a key={k++} href={href} target="_blank" rel="noopener noreferrer">
            {m[6]}
          </a>,
        );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
