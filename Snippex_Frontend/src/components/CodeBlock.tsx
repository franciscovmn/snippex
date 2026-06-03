import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface Props {
  code: string;
  language?: string | null;
}

const CodeBlock: React.FC<Props> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'texto'}</span>
        <button className="code-copy-btn" onClick={handleCopy} aria-label="Copiar código">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <SyntaxHighlighter
        language={(language || 'text').toLowerCase()}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'transparent',
          fontSize: '13px',
          padding: '16px',
        }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
