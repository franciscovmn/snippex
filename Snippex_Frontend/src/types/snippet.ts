export interface Snippet {
  id: string | null; // UUID vira string
  user_id: string;
  title: string;
  type: string;
  language: string | null; 
  code: string;
  is_public: boolean;
  explanation: string | null;
  tags: string[] | null;
  suggestions: string[] | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  deleted_at: string | Date | null;
}