import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeDatabase() {
  console.log("Starting full database wipe for hackathon presentation...");
  
  // Wipe reports first due to foreign key constraints
  const res1 = await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Wiped reports:", res1.error || "Success");

  // Wipe scans
  const res2 = await supabase.from('scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Wiped scans:", res2.error || "Success");

  // Wipe lookalikes
  const res3 = await supabase.from('lookalike_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Wiped lookalike_alerts:", res3.error || "Success");

  console.log("Database wipe complete. Dashboard should now start at 0.");
}

wipeDatabase();
