import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Since this file resides in src/config, we go up two directories to look for .env in the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['PORT', 'NODE_ENV', 'CORS_ORIGIN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'];
const missingVars = [];

// Check for missing variables
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    missingVars.push(key);
  }
});

if (missingVars.length > 0) {
  console.error(`[FATAL] Configuration error: Missing required environment variable(s): ${missingVars.join(', ')}`);
  process.exit(1);
}

// Port Validation
const port = parseInt(process.env.PORT, 10);
if (isNaN(port) || port <= 0 || port > 65535) {
  console.error(`[FATAL] Configuration error: PORT "${process.env.PORT}" is not a valid port number.`);
  process.exit(1);
}

// Environment Validation
const validEnvironments = ['development', 'production', 'test'];
if (!validEnvironments.includes(process.env.NODE_ENV)) {
  console.error(`[FATAL] Configuration error: NODE_ENV must be one of [${validEnvironments.join(', ')}]. Received: "${process.env.NODE_ENV}"`);
  process.exit(1);
}

export const config = {
  port,
  env: process.env.NODE_ENV,
  corsOrigin: process.env.CORS_ORIGIN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY
};

export default config;
