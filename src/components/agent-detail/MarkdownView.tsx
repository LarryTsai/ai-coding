import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export function MarkdownView({ content, isDark }: { content: string; isDark: boolean }) {
  const text1 = isDark ? '#E8EFF8' : '#1A2035';
  const text2 = isDark ? '#8B949E' : '#596179';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const codeBg = isDark ? '#0D1117' : '#F6F8FA';
  const codeColor = isDark ? '#F97583' : '#D03050';
  const inlineCodeBg = isDark ? 'rgba(249,117,131,0.12)' : 'rgba(208,48,80,0.08)';
  const checkDone = '#4ADE80';
  const checkDoneBg = isDark ? 'rgba(74,222,128,0.14)' : 'rgba(74,222,128,0.12)';
  const checkPendingBorder = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)';

  const components: Components = {
    h1: ({ children }) => (
      <h1 style={{ fontSize: 18, fontWeight: 700, color: text1, margin: '18px 0 8px', paddingBottom: 6, borderBottom: `1px solid ${border}` }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: 16, fontWeight: 700, color: text1, margin: '16px 0 6px', paddingBottom: 6, borderBottom: `1px solid ${border}` }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 13, fontWeight: 700, color: text1, margin: '12px 0 4px' }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ fontSize: 12, fontWeight: 700, color: text1, margin: '10px 0 4px' }}>
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p style={{ fontSize: 13, color: text2, lineHeight: 1.7, margin: '3px 0' }}>
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: text1 }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ color: text2, fontStyle: 'italic' }}>{children}</em>
    ),
    del: ({ children }) => (
      <del style={{ color: text2, opacity: 0.6 }}>{children}</del>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: `1px solid ${border}`, margin: '10px 0' }} />
    ),
    ul: ({ children }) => (
      <ul style={{ paddingLeft: 20, margin: '4px 0 8px', color: text2, fontSize: 12.5, lineHeight: 1.65, listStyle: 'disc' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: 20, margin: '4px 0 8px', color: text2, fontSize: 12.5, lineHeight: 1.65 }}>
        {children}
      </ol>
    ),
    li: ({ children, className }) => {
      const isTask = String(className ?? '').includes('task-list-item');
      if (isTask) {
        return (
          <li style={{ listStyle: 'none', marginLeft: -4, marginBottom: 5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {children}
          </li>
        );
      }
      return <li style={{ marginBottom: 3 }}>{children}</li>;
    },
    // GFM task-list checkboxes — render a custom visual checkbox
    input: ({ checked }) => (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 15,
          height: 15,
          marginTop: 2,
          flexShrink: 0,
          borderRadius: 4,
          border: checked ? 'none' : `1.5px solid ${checkPendingBorder}`,
          background: checked ? checkDoneBg : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 2.5" stroke={checkDone} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    ),
    code: ({ children, className }) => {
      const isBlock = Boolean(className?.startsWith('language-'));
      if (isBlock) {
        return (
          <code style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: 11, color: isDark ? '#E8EFF8' : '#1A2035' }}>
            {children}
          </code>
        );
      }
      return (
        <code style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: '0.88em', color: codeColor, background: inlineCodeBg, padding: '1px 5px', borderRadius: 4 }}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: 11, lineHeight: 1.7, background: codeBg, color: isDark ? '#E8EFF8' : '#1A2035', border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', margin: '6px 0 10px', overflowX: 'auto', whiteSpace: 'pre' }}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: `3px solid ${border}`, paddingLeft: 12, margin: '8px 0', color: text2, fontStyle: 'italic' }}>
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '6px 0 10px', fontSize: 12 }}>
        {children}
      </table>
    ),
    tr: ({ children }) => (
      <tr style={{ borderBottom: `1px solid ${border}` }}>{children}</tr>
    ),
    th: ({ children }) => (
      <th style={{ padding: '5px 10px', color: text1, fontWeight: 600, textAlign: 'left' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ padding: '5px 10px', color: text2 }}>{children}</td>
    ),
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#58A6FF' : '#0969DA', textDecoration: 'underline' }}>
        {children}
      </a>
    ),
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
