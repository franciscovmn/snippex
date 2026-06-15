import React from 'react';
import { Bookmark, Check, Copy, FileCode, Globe, Lock, Pencil, Sparkles, Trash2, Users } from 'lucide-react';
import type { Snippet } from '../types/snippet';
import Card from './ui/Card';
import IconButton from './ui/IconButton';
import Avatar from './ui/Avatar';
import LanguageBadge from './ui/LanguageBadge';
import TagChip from './ui/TagChip';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  snippet: Snippet;
  onOpen: () => void;
  /** Mostra ações de editar/excluir no hover (tela "Meus Snippets"). */
  showActions?: boolean;
  canSave?: boolean;
  copied?: boolean;
  saving?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onCopy?: (e: React.MouseEvent) => void;
  onToggleSave?: (e: React.MouseEvent) => void;
  onTagClick?: (tag: string, e: React.MouseEvent) => void;
}

function VisibilityTag({ visibility }: { visibility?: string }) {
  if (visibility === 'PRIVATE') return <span className="snippet-card-footer"><Lock size={12} /> Privado</span>;
  if (visibility === 'TEAM') return <span className="snippet-card-footer"><Users size={12} /> Time</span>;
  return <span className="snippet-card-footer"><Globe size={12} /> Público</span>;
}

const SnippetCard: React.FC<Props> = ({
  snippet,
  onOpen,
  showActions,
  canSave,
  copied,
  saving,
  onEdit,
  onDelete,
  onCopy,
  onToggleSave,
  onTagClick,
}) => {
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

      {snippet.tags && snippet.tags.length > 0 && (
        <div className="tag-list snippet-card-tags">
          {snippet.tags.slice(0, 4).map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag, e);
              }}
            />
          ))}
        </div>
      )}

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

        {(showActions || canSave || onCopy) && (
          <div className="snippet-card-actions">
            {onCopy && (
              <IconButton
                size="sm"
                label={copied ? 'Copiado' : 'Copiar código'}
                icon={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(e);
                }}
              />
            )}
            {canSave && onToggleSave && (
              <IconButton
                size="sm"
                label={snippet.is_saved ? 'Remover dos salvos' : 'Salvar snippet'}
                icon={<Bookmark size={14} fill={snippet.is_saved ? 'currentColor' : 'none'} />}
                disabled={saving}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(e);
                }}
              />
            )}
            {showActions && onEdit && (
              <IconButton
                size="sm"
                label="Editar"
                icon={<Pencil size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(e);
                }}
              />
            )}
            {showActions && onDelete && (
              <IconButton
                size="sm"
                variant="danger"
                label="Excluir"
                icon={<Trash2 size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SnippetCard;
