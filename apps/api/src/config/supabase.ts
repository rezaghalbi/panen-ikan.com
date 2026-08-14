import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn('⚠️ WARNING: SUPABASE_URL is missing or invalid in environment variables.');
}

if (!supabaseKey) {
  console.warn('⚠️ WARNING: SUPABASE_KEY is missing in environment variables.');
}

export const supabase =
  supabaseUrl.startsWith('http') && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : (null as any);
