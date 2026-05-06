export interface Comment {
  id: string; 
  snippet_id: string; 
  user_id: string; 
  content: string;
  created_at: string; // ISO date (timestamptz)
  updated_at?: string | null; 
  deleted_at?: string | null; 
}