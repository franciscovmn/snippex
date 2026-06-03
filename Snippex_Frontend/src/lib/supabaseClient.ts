import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null-safe: se as variáveis não estiverem configuradas, o app continua
// funcionando (sem Realtime). Quem usa deve checar `supabase` antes.
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;
