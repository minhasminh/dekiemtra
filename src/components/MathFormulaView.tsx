import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaViewProps {
  text: string;
  className?: string;
}

/**
 * Hiển thị văn bản tiếng Việt Unicode có nhúng công thức toán học LaTeX ($...$ hoặc $$...$$)
 * sử dụng KaTeX chuẩn xác.
 */
export const MathFormulaView: React.FC<MathFormulaViewProps> = ({ text, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // Tách theo $$...$$ (display math) và $...$ (inline math)
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const parts = text.split(tokenRegex);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return `<code>${formula}</code>`;
          }
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return `<code>${formula}</code>`;
          }
        }
        // Escape HTML an toàn cho phần văn bản thường
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
      })
      .join('');
  }, [text]);

  return (
    <span
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
