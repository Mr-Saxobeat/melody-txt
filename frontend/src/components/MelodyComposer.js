import React, { useEffect, useRef, useCallback } from 'react';
import { classifyLines } from '../utils/validation';
import './MelodyComposer.css';

function MelodyComposer({ notation, onChange, onValidationChange }) {
  const textareaRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!notation || !notation.trim()) {
      onValidationChange?.(true);
      return;
    }

    const lines = classifyLines(notation);
    const hasNoteLines = lines.some((l) => l.type === 'notes');
    onValidationChange?.(hasNoteLines || lines.every((l) => l.type === 'lyrics' || l.type === 'empty'));
  }, [notation, onValidationChange]);

  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      const scrollY = window.scrollY;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      window.scrollTo(0, scrollY);
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [notation, autoResize]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlightedContent = () => {
    if (!notation) return '';
    const lines = classifyLines(notation);
    return lines.map((line, i) => {
      const className = line.type === 'notes' ? 'highlight-notes' : line.type === 'lyrics' ? 'highlight-lyrics' : '';
      return `<span class="${className}">${escapeHtml(line.text)}</span>`;
    }).join('\n');
  };

  return (
    <div className="melody-composer">
      <div className="editor-container">
        <div
          ref={backdropRef}
          className="editor-backdrop"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: renderHighlightedContent() + '\n' }}
        />
        <textarea
          ref={textareaRef}
          id="notation-input"
          className="notation-input"
          value={notation}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder={"do re mi fa sol\nHappy birthday to you\ndo re mi fa sol"}
          rows={3}
          aria-label="Enter your melody"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default MelodyComposer;
