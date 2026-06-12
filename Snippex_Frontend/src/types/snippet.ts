export type Visibility = 'PUBLIC' | 'TEAM' | 'PRIVATE'

export interface Snippet {
  id: string | null; // UUID vira string
  user_id: number | string;
  title: string;
  type: string;
  language: string | null; 
  code: string;
  isPublic: boolean;
  visibility:  Visibility // novo campo para mostrar o tipo de coumunidade
  explanation: string | null;
  tags: string[] | null;
  suggestions: string[] | null;
  is_saved?: boolean;
  saved_at?: string | Date | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  deleted_at: string | Date | null;
}
