import React, { useEffect, useState } from 'react';
import { commentService } from '../services/commentService';
import Button from './ui/Button';

interface Props {
  commentId: string;
  initialContent: string;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCommentModal: React.FC<Props> = ({ commentId, initialContent, onClose, onUpdated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await commentService.putComment({ content }, commentId);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Editar comentário">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Editar comentário</h3>
        <textarea
          className="comment-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          aria-label="Conteúdo do comentário"
        />
        <div className="modal-actions">
          <Button variant="secondary" size="md" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!content.trim() || loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentModal;
