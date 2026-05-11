import React, { useEffect, useState } from 'react';
import { commentService } from '../services/commentService';

interface Props {
  commentId: string;
  initialContent: string;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCommentModal: React.FC<Props> = ({
  commentId,
  initialContent,
  onClose,
  onUpdated
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await commentService.putComment( 
        {content: content}, commentId
      );

      onUpdated();
      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999}}
    >
      
    <div
      onClick={(e) => e.stopPropagation()}
      style={{width: '100%', maxWidth: '500px', background: '#1b1b1b', borderRadius: '12px', padding: '1rem'}}
    >
        
        <h3>Editar comentário</h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{width: '100%', resize: 'none', marginBottom: '1rem'
          }}
        />

        <div
          style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem'
          }}
        >
          <button 
            onClick={onClose}
            style={{background: '#e74c3c',border: 'none',color: '#fff',padding: '0.3rem 0.6rem',borderRadius: '6px',cursor: 'pointer',fontSize: '0.75rem'}}
            >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={!content.trim() || loading}
            style={{background: '#2d6cdf',border: 'none',color: '#fff',padding: '0.3rem 0.6rem',borderRadius: '6px',cursor: 'pointer',fontSize: '0.75rem'}}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentModal;