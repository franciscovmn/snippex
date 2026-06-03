import React from 'react';
import { FileCode, Sparkles, Globe, Lock, Users, Pencil, Trash2 } from 'lucide-react';
import type { Snippet } from '../types/snippet';
import Card from './ui/Card';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import LanguageBadge from './ui/LanguageBadge';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  snippet: Snippet;
  onOpen: () => void;
  /** Mostra ações de editar/excluir no hover (tela "Meus Snippets"). */
  showActions?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

function VisibilityTag({ visibility }: { visibility?: string }) {
  if (visibility === 'PRIVATE') return <span className="snippet-card-footer"><Lock size={12} /> Privado</span>;
  if (visibility === 'TEAM') return <span className="snippet-card-footer"><Users size={12} /> Time</span>;
  return <span className="snippet-card-footer"><Globe size={12} /> Público</span>;
}

const SnippetCard: React.FC<Props> = ({ snippet, onOpen, showActions, onEdit, onDelete }) => {
  const author = (snippet as unknown as { user_name?: string }).user_name;
  const TypeIcon = snippet.type === 'prompt' ? Sparkles : FileCode;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <Card
      interactive
      className="snippet-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKey}
      aria-label={`Abrir snippet ${snippet.title}`}
    >
      <div className="snippet-card-top">
        <span className="snippet-card-title">
          <TypeIcon size={16} />
          <span className="title-text">{snippet.title}</span>
        </span>
        <LanguageBadge language={snippet.language} />
      </div>

      <pre className="snippet-card-code">
        <code>{snippet.code?.slice(0, 180)}</code>
      </pre>

      <div className="snippet-card-footer">
        {author ? (
          <>
            <Avatar name={author} size={18} />
            <span>{author}</span>
          </>
        ) : (
          <VisibilityTag visibility={snippet.visibility} />
        )}
        <span className="sep">•</span>
        <span>{timeAgo(snippet.created_at)}</span>

        {showActions && (
          <div className="snippet-card-actions">
            <Button size="sm" variant="ghost" leftIcon={<Pencil size={14} />} onClick={onEdit} aria-label="Editar">
              Editar
            </Button>
            <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={onDelete} aria-label="Excluir">
              Excluir
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SnippetCard;
