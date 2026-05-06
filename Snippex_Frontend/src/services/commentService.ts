import api from "./api";

import type { Comment } from "../types/comment";

export type CreateCommentInput = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'user_id'>;
export type UpdateCommentInput = Pick<Comment, 'content'>;

export const commentService = {
    getById: async (id:string) => {
        const response = await api.get(`/api/comments/${id}`);
        return response.data;
    },

    getBySnippetId: async (snippet_id:string) => {
        const response = await api.get(`/api/comments/snippet/${snippet_id}`);
        return response.data;
    },

    getByUserId: async (user_id:string) => {
        const response = await api.get(`/api/comments/user/${user_id}`);
        return response.data;
    },

    postComment: async (comment:CreateCommentInput) => {
        const response = await api.post(`/api/comments`, comment);
        return response.data;
    },

    putComment: async (comment:UpdateCommentInput, id:string) => {
        const response = await api.put(`/api/comments/${id}`, comment);
        return response.data;
    },

    deleteComment: async (id:string) => {
        const response = await api.delete(`/api/comments/${id}`);
        return response.data;
    }
}