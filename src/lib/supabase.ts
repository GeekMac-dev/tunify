import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://umhkkieidgbtdcmcrwhy.supabase.co';
const supabaseKey = 'sb_publishable_H6meNV3xHfQHLb_GlOCJxA_LGfvdsPC';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };