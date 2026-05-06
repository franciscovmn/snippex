const pool = require('../config/database')

async function createComment({snippet_id, user_id, content}) {
    const query = `
        INSERT INTO comments(snippet_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, snippet_id, user_id, content, created_at ,updated_at, deleted_at
    `;

    const values = [snippet_id, user_id, content];
    const result = await pool.query(query, values);

    return result.rows[0];
};

async function updateComment(id, userId, {content}) {
    const query = `
        UPDATE comments
            SET content = $3
        WHERE 
            id = $1
            AND user_id = $2
            AND deleted_at IS NULL
        RETURNING *
    `;

    const values = [id, userId, content];
    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getCommentById(id) {
    const query = `
        SELECT * FROM comments
            WHERE id = $1
            AND deleted_at IS NULL
    `

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

async function getCommentsBySnippet(snippet_id) {
    const query = `
        SELECT 
            c.*,
            u.user_name 
        FROM comments c
        JOIN users u ON u.id = c.user_id
            WHERE snippet_id = $1
            AND deleted_at IS NULL
    `

    const result = await pool.query(query, [snippet_id]);
    return result.rows;
}

async function getCommentsByUser(user_id) {
    const query = `
        SELECT * FROM comments
            WHERE user_id = $1
            AND deleted_at IS NULL
    `

    const result = await pool.query(query, [user_id]);
    return result.rows;
}

async function deleteComment(id, user_id) {
    const query = `
        UPDATE comments
        SET deleted_at = NOW()
            WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL
        RETURNING id
    `;

    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
}

module.exports = {
    createComment,
    updateComment,
    getCommentById,
    getCommentsBySnippet,
    getCommentsByUser,
    deleteComment
}