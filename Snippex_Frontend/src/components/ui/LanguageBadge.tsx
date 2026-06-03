import React from 'react';
import { getLanguageColor } from '../../lib/languageColors';

interface LanguageBadgeProps {
  language?: string | null;
}

const LanguageBadge: React.FC<LanguageBadgeProps> = ({ language }) => {
  if (!language) return null;
  const color = getLanguageColor(language);
  return (
    <span className="lang-badge">
      <span className="lang-dot" style={{ backgroundColor: color }} aria-hidden="true" />
      {language}
    </span>
  );
};

export default LanguageBadge;
