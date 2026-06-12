import api from "./api";

import type { Snippet } from "../types/snippet";

export const snippetService = {
    //rotas públicas
    getAllSnippets: async () => {
        const response = await api.get('/api/snippets/');
        return response.data;
    },

    getSnippetsByTag: async (tag:string) => {
        const response = await api.get(`/api/snippets/tag/${tag}`);
        return response.data;
    },

    getSnippetsById: async (id:string) => {
        const response = await api.get(`/api/snippets/${id}`)
        return response.data;
    },
    
    //rotas protegidas (o interceptor adiciona o "Bearer token" aqui automaticamente)
    getMySnippets: async () => {
        const response = await api.get('/api/snippets/me');
        return response.data;
    },

    getSavedSnippets: async () => {
        const response = await api.get('/api/snippets/saved');
        return response.data;
    },

    postSnippet: async (snippet:Snippet) => {
        const response = await api.post('/api/snippets/', snippet);
        return response.data;
    },

    updateSnippet: async (id: string, snippet:Snippet) => {
        const response = await api.patch(`/api/snippets/${id}`, snippet);
        return response.data;
    },

    deleteSnippet: async (id: string) => {
        const response = await api.delete(`/api/snippets/${id}`);
        return response.data;
    },

    saveSnippet: async (id: string) => {
        const response = await api.post(`/api/snippets/${id}/save`);
        return response.data;
    },

    unsaveSnippet: async (id: string) => {
        const response = await api.delete(`/api/snippets/${id}/save`);
        return response.data;
    }
}
