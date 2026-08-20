const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function wipe() {
  const { data, error } = await supabase.from('scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Wiped scans:', data, error);
}
wipe();
