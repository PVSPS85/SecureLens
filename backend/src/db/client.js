import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

/**
 * Initializes and exports the authoritative Supabase client.
 * Uses the service role key to act as a system service.
 */
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default supabase;
