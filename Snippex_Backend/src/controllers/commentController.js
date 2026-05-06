const commentRepository = require('../repositories/commentRepository')

async function createComment(req, res) {
    try {
        const {snippet_id, content} = req.body;
        const user_id = req.user.id;

        validateComment({snippet_id, user_id, content});

        const comment = await commentRepository.createComment({snippet_id, user_id, content});

        return res.status(201).json(comment)
    } catch (error) {
        console.error('[create comment]', error)
        return res.status(400).json({ error: error.message })
    }
}

async function updateComment(req, res) {
    try {
        const id = req.params.id;
        const user_id = req.user.id;
        const {content} = req.body;

        const comment = await commentRepository.updateComment(id, user_id, {content});

        if(!comment) {
            return res.status(404).json({ error: 'comentário não encontrado ou sem permissão.' })
        }

        return res.status(200).json(comment);

    } catch (error) {
        console.error('[create comment]', error)
        return res.status(500).json({ error: 'Erro interno ao criar comentário.' })
    }
}

async function getCommentsById(req, res) {
    try {
        const id = req.params.id;
        const comment = await commentRepository.getCommentById(id);
        return res.status(200).json(comment);
    } catch (error) {
        console.error('[create comment]', error)
        return res.status(500).json({ error: 'Erro interno ao criar comentário.' })
    }
}

async function getCommentsBySnippet(req, res) {
    try {
        const snippet_id = req.params.snippet_id;
        const comments = await commentRepository.getCommentsBySnippet(snippet_id);
        return res.status(200).json(comments);
    } catch (error) {
        console.error('[create comment]', error)
        return res.status(500).json({ error: 'Erro interno ao criar comentário.' })
    }
}

async function getCommentsByUser(req, res) {
    try {
        const user_id = req.params.user_id;
        const comments = await commentRepository.getCommentsByUser(user_id);
        return res.status(200).json(comments);
    } catch (error) {
        console.error('[create comment]', error)
        return res.status(500).json({ error: 'Erro interno ao criar comentário.' })
    }
}

async function deleteComment(req, res) {
    try {
        const { id } = req.params
        const userId = req.user.id

        const deletedComment = await commentRepository.deleteComment(id, userId);

        if(!deletedComment) {
            return res.status(404).json({ error: 'comentário não encontrado ou sem permissão.' })
        }

        return res.status(200).json(deletedComment);
    } catch (error) {
        console.error('[create comment]', error)
        return res.status(500).json({ error: 'Erro interno ao criar comentário.' })
    }
}

function validateComment({snippet_id, user_id, content}) {
    if (!snippet_id) throw new Error('Id do Snippet é obrigatório!')
    if (!user_id) throw new Error('Id do usuário é obrigatório!')
    if (!content || content.trim() === '') throw new Error('Conteúdo é obrigatório!')
}

module.exports = {createComment, updateComment, getCommentsById, getCommentsBySnippet, getCommentsByUser, deleteComment}