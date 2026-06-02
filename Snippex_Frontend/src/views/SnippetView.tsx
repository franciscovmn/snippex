import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { snippetService } from '../services/snippetService';
import { commentService } from '../services/commentService';
import type { CreateCommentInput } from '../services/commentService';
import type { Snippet } from '../types/snippet';
import type { Comment } from '../types/comment';
import EditCommentModal from '../components/EditCommentModal';

const SnippetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const loadComments = async () => { 
    try {
      if (id) {
        const comments = await commentService.getBySnippetId(id);
        console.log(comments);
        setComments(comments);
      }
    } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os comentários');
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadSnippet = async () => {
      try {
        if (id) {
          const data = await snippetService.getSnippetsById(id);
          setSnippet(data);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o snippet.');
      } finally {
        setIsLoading(false);
      }
    };
    loadComments();
    loadSnippet();
  }, [id]);

  const handleAddComment = async (comment:string) => {
    console.log(comment);

    if (!id) {
      console.error("id não pode ser vazio");
      return;
    }

    let newComment:CreateCommentInput = {
      snippet_id: id,
      content: comment
    };
    
    await commentService.postComment(newComment);
    loadComments();
  }

  const handleUpdateComment = (comment: Comment) => {
    setEditingComment(comment);
  };

  const handleDeleteComment = async(id:string) =>  {
    if (!id) {
      console.error("id não pode ser vazio");
      return;
    }

    console.log(id);

    if (!window.confirm("Deseja mesmo excluir o comentário")) return;
    await commentService.deleteComment(id);

    loadComments();
  }

  //isso vai ser usado no comentario
  const userStorage = localStorage.getItem("user");
  let loggedUserId:string

  if(userStorage) {
    loggedUserId = JSON.parse(userStorage).id;
  }

  if (isLoading) {
    return (
      <main className="main-content">
        <section className="content-area">
          <p>A carregar snippet...</p>
        </section>
      </main>
    );
  }

  if (error || !snippet) {
    return (
      <main className="main-content">
        <section className="content-area">
          <p>{error || 'Snippet não encontrado.'}</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>Voltar</button>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-header">
        <h1>{snippet.title}</h1>
        <button className="btn-ghost" onClick={() => navigate(-1)}>Voltar</button>
      </div>

      <section className="content-area">
        <div className="snippet-detail-header" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="author">por {(snippet as any).user_name || "Anônimo"}</span>
          <span className="language">{snippet.language}</span>
          <span className="type-label">{snippet.type === 'code' ? '💻' : '🤖'} {snippet.type}</span>
          <span className={`badge-visibility ${snippet.visibility?.toLowerCase()}`}>
              {snippet.visibility === 'PUBLIC' && '🌐 Público'}
              {snippet.visibility === 'PRIVATE' && '🔒 Privado'}
              {snippet.visibility === 'TEAM' && '👥 Time'}
          </span>
        </div>

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="tags" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            {snippet.tags.map(tag => (
              <span key={tag} style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="code-container" style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
          <pre>
            <code>{snippet.code}</code>
          </pre>
        </div>

        {snippet.explanation && (
          <div className="ai-box" style={{ marginTop: '2rem' }}>
            <span className="ai-emoji">✨</span>
            <div className="ai-text">
              <strong>Explicação da IA</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{snippet.explanation}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>💬 Comentários</h2>

          {editingComment && (
            <EditCommentModal
              commentId={editingComment.id}
              initialContent={editingComment.content}
              onClose={() => setEditingComment(null)}
              onUpdated={loadComments}
            />
          )}

          {/* ABA DE NOVO COMENTÁRIO */}
          <div style={{marginBottom: '1.5rem',padding: '1rem',background: '#1a1a1a',borderRadius: '10px',border: '1px solid #2c2c2c'}}>
            <textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              style={{width: '100%', resize: 'none', padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: '#121212', color: '#fff', marginBottom: '0.5rem'}}
            />

            <button
              onClick={() => handleAddComment(newComment)}
              style={{background: '#2ecc71',border: 'none',color: '#fff',padding: '0.4rem 0.8rem',borderRadius: '6px',cursor: 'pointer',fontSize: '0.85rem'}}
            >
              Comentar
            </button>
          </div> 
        </div>



          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>💬 Comentários da comunidade</h3>

            {comments.length === 0 ? (
              <p style={{ opacity: 0.6 }}>Nenhum comentário ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      background: '#1f1f1f',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid #2c2c2c'
                    }}
                  >
                    {/* header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.9rem' }}>
                          {(comment as any).user_name || 'anônimo'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* botões */}
                      {comment.user_id === loggedUserId && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateComment(comment)}
                            style={{background: '#2d6cdf',border: 'none',color: '#fff',padding: '0.3rem 0.6rem',borderRadius: '6px',cursor: 'pointer',fontSize: '0.75rem'}}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{background: '#e74c3c',border: 'none',color: '#fff',padding: '0.3rem 0.6rem',borderRadius: '6px',cursor: 'pointer',fontSize: '0.75rem'}}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* conteúdo */}
                    <p style={{ margin: 0, lineHeight: 1.4 }}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        
      </section>
    </main>
  );
};

export default SnippetView;
