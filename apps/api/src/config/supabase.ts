import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Hanya buat Supabase Client jika URL dan Key valid (diawali dengan http)
export const supabase =
  supabaseUrl.startsWith('http') && supabaseKey.length > 0
    ? createClient(supabaseUrl, supabaseKey)
    : null;
