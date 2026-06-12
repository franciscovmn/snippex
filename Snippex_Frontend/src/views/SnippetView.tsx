import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Lightbulb, Loader, ArrowLeft,
  Globe, Lock, Users, MessageSquare, Pencil, Trash2, Bookmark,
} from 'lucide-react';
import { snippetService } from '../services/snippetService';
import { commentService } from '../services/commentService';
import type { CreateCommentInput } from '../services/commentService';
import type { Snippet } from '../types/snippet';
import type { Comment } from '../types/comment';
import EditCommentModal from '../components/EditCommentModal';
import { supabase } from '../lib/supabaseClient';
import CodeBlock from '../components/CodeBlock';
import LanguageBadge from '../components/ui/LanguageBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { timeAgo } from '../lib/timeAgo';
import '../css/snippet-view.css';

const SnippetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [savingSnippet, setSavingSnippet] = useState(false);
  const [slow, setSlow] = useState(false);

  const loadComments = async () => {
    try {
      if (id) {
        const data = await commentService.getBySnippetId(id);
        setComments(data);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os comentários');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Realtime: escuta UPDATEs daquela linha; quando a IA preenche explanation/
  // suggestions, o estado local é atualizado e o skeleton vira conteúdo real.
  useEffect(() => {
    if (!id || !supabase) return;
    const client = supabase;

    const channel = client
      .channel(`snippet-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'snippets', filter: `id=eq.${id}` },
        (payload) => {
          setSnippet((prev) => (prev ? { ...prev, ...(payload.new as Partial<Snippet>) } : prev));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [id]);

  const explanationText = snippet?.explanation?.trim() ?? '';
  const hasExplanation = explanationText.length > 0;

  // Aviso se a análise demorar mais que ~60s sem chegar explanation.
  useEffect(() => {
    setSlow(false);
    if (!snippet || hasExplanation) return;
    const timer = setTimeout(() => setSlow(true), 60000);
    return () => clearTimeout(timer);
  }, [snippet?.id, hasExplanation]);

  const handleAddComment = async (comment: string) => {
    if (!id || !comment.trim()) return;
    const payload: CreateCommentInput = { snippet_id: id, content: comment };
    await commentService.postComment(payload);
    setNewComment('');
    loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentId) return;
    if (!window.confirm('Deseja mesmo excluir o comentário?')) return;
    await commentService.deleteComment(commentId);
    loadComments();
  };

  const handleToggleSave = async () => {
    if (!id || !snippet || savingSnippet) return;

    try {
      setSavingSnippet(true);
      if (snippet.is_saved) {
        await snippetService.unsaveSnippet(id);
        setSnippet((prev) => (prev ? { ...prev, is_saved: false } : prev));
      } else {
        await snippetService.saveSnippet(id);
        setSnippet((prev) => (prev ? { ...prev, is_saved: true } : prev));
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar seus salvos.');
    } finally {
      setSavingSnippet(false);
    }
  };

  const userStorage = localStorage.getItem('user');
  let loggedUserId = '';
  if (userStorage) loggedUserId = JSON.parse(userStorage).id;

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="snippet-detail">
          <Skeleton width="40%" height={28} />
          <div style={{ marginTop: 20 }} className="detail-grid">
            <Skeleton height={320} />
            <Skeleton height={200} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !snippet) {
    return (
      <main className="main-content">
        <div className="snippet-detail">
          <p className="ai-muted">{error || 'Snippet não encontrado.'}</p>
          <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
            Voltar
          </Button>
        </div>
      </main>
    );
  }

  const isFallback = hasExplanation && explanationText.startsWith('Falha ao gerar explicação');
  const isGenerating = !hasExplanation;
  const author = (snippet as unknown as { user_name?: string }).user_name;

  const VisIcon = snippet.visibility === 'PRIVATE' ? Lock : snippet.visibility === 'TEAM' ? Users : Globe;
  const visLabel = snippet.visibility === 'PRIVATE' ? 'Privado' : snippet.visibility === 'TEAM' ? 'Time' : 'Público';

  return (
    <main className="main-content">
      <div className="snippet-detail">
        <div className="detail-back">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Voltar
          </Button>
          {loggedUserId && (
            <Button
              variant={snippet.is_saved ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<Bookmark size={16} fill={snippet.is_saved ? 'currentColor' : 'none'} />}
              onClick={handleToggleSave}
              disabled={savingSnippet}
            >
              {snippet.is_saved ? 'Salvo' : 'Salvar'}
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="detail-header">
          <h1>{snippet.title}</h1>
          <div className="detail-meta">
            {author && (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={author} size={18} /> {author}
                </span>
                <span className="sep">•</span>
              </>
            )}
            <LanguageBadge language={snippet.language} />
            <span className="sep">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <VisIcon size={13} /> {visLabel}
            </span>
            {snippet.created_at && (
              <>
                <span className="sep">•</span>
                <span>{timeAgo(snippet.created_at)}</span>
              </>
            )}
          </div>
        </div>

        {/* 2 colunas: código | análise */}
        <div className="detail-grid">
          <div className="detail-main">
            <CodeBlock code={snippet.code} language={snippet.language} />
          </div>

          <aside className="detail-aside">
            {/* Explicação */}
            <div className="card">
              <div className="ai-card-header">
                <span className="ai-card-title"><Sparkles size={16} /> Explicação</span>
              </div>

              {isFallback ? (
                <div>
                  <p className="ai-error-msg">Não foi possível gerar a análise desta vez.</p>
                </div>
              ) : isGenerating ? (
                <>
                  <p className="ai-generating">
                    <span className="ai-spin"><Loader size={14} /></span> Gerando análise...
                  </p>
                  <div className="skeleton-text">
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} width="60%" />
                  </div>
                  {slow && (
                    <p className="ai-warning">
                      A análise está demorando mais que o esperado. Recarregue em alguns instantes.
                    </p>
                  )}
                </>
              ) : (
                <p className="ai-explanation">{snippet.explanation}</p>
              )}
            </div>

            {/* Sugestões */}
            <div className="card">
              <div className="ai-card-header">
                <span className="ai-card-title"><Lightbulb size={16} /> Sugestões de melhoria</span>
              </div>

              {isFallback ? (
                <p className="ai-muted">Indisponível no momento.</p>
              ) : isGenerating ? (
                <div className="skeleton-text">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={12} width={i % 2 === 0 ? '100%' : '75%'} />
                  ))}
                </div>
              ) : snippet.suggestions && snippet.suggestions.length > 0 ? (
                <ul className="ai-suggestions">
                  {snippet.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="ai-muted">Nenhuma sugestão gerada.</p>
              )}
            </div>
          </aside>
        </div>

        {/* Comentários (largura total) */}
        <section className="comments-section">
          <h2><MessageSquare size={18} /> Comentários</h2>

          {editingComment && (
            <EditCommentModal
              commentId={editingComment.id}
              initialContent={editingComment.content}
              onClose={() => setEditingComment(null)}
              onUpdated={loadComments}
            />
          )}

          <div className="comment-composer">
            <textarea
              className="comment-input"
              placeholder="Escreva um comentário..."
              aria-label="Novo comentário"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button variant="primary" size="sm" onClick={() => handleAddComment(newComment)} disabled={!newComment.trim()}>
              Comentar
            </Button>
          </div>

          <h3>Comentários da comunidade</h3>
          {comments.length === 0 ? (
            <p className="ai-muted">Nenhum comentário ainda.</p>
          ) : (
            <div className="comment-list">
              {comments.map((comment) => (
                <div key={comment.id} className="card comment-item">
                  <div className="comment-head">
                    <div className="comment-author">
                      <Avatar name={(comment as unknown as { user_name?: string }).user_name || 'anônimo'} size={24} />
                      <div>
                        <div className="comment-author-name">
                          {(comment as unknown as { user_name?: string }).user_name || 'anônimo'}
                        </div>
                        <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {comment.user_id === loggedUserId && (
                      <div className="comment-actions">
                        <Button size="sm" variant="ghost" leftIcon={<Pencil size={14} />} onClick={() => setEditingComment(comment)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => handleDeleteComment(comment.id)}>
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="comment-body">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SnippetView;
