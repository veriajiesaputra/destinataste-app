import React from 'react';

/**
 * Helper untuk mem-parsing format inline:
 * - **teks tebal** -> <strong>teks tebal</strong> (bintang dihilangkan)
 * - *teks miring* -> <em>teks miring</em> (bintang dihilangkan)
 * - `kode` -> <code>kode</code>
 */
function parseInline(text, isUser) {
  if (!text) return '';

  // Regex mencari token **bold**, *italic*, atau `code`
  const tokenRegex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    // 1. Bold: **teks**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={isUser ? 'font-black text-white' : 'font-bold text-slate-900'}
        >
          {inner}
        </strong>
      );
    }

    // 2. Italic: *teks*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic font-medium">
          {inner}
        </em>
      );
    }

    // 3. Inline code: `teks`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            isUser ? 'bg-white/25 text-white' : 'bg-slate-100 text-emerald-800'
          }`}
        >
          {inner}
        </code>
      );
    }

    return part;
  });
}

/**
 * Komponen MarkdownView untuk merender pesan AI dengan rapi
 * tanpa memunculkan karakter markdown mentah seperti ** atau *.
 */
export default function MarkdownView({ content = '', isUser = false, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let currentListType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList.length > 0) {
      if (currentListType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-1.5 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item, isUser)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-1.5 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item, isUser)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      currentListType = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Baris kosong
    if (!trimmed) {
      flushList();
      elements.push(<div key={`empty-${idx}`} className="h-1.5" />);
      return;
    }

    // Heading: ### Judul, ## Judul, # Judul
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      elements.push(
        <div
          key={`h-${idx}`}
          className={`font-black mt-2 mb-1 tracking-tight ${
            level === 1 ? 'text-[13px]' : level === 2 ? 'text-xs' : 'text-[11px]'
          } ${isUser ? 'text-white' : 'text-slate-900'}`}
        >
          {parseInline(headingText, isUser)}
        </div>
      );
      return;
    }

    // Daftar Berurutan: 1. Item, 2. Item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType && currentListType !== 'ol') flushList();
      currentListType = 'ol';
      currentList.push(olMatch[2]);
      return;
    }

    // Daftar Peluru: * Item, - Item, • Item
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType && currentListType !== 'ul') flushList();
      currentListType = 'ul';
      currentList.push(ulMatch[1]);
      return;
    }

    // Paragraf biasa
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {parseInline(line, isUser)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 text-xs ${className}`}>{elements}</div>;
}
