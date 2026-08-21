import { executeWithRotation } from './src/utils/aiRotator.util.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ans = await executeWithRotation("You are a helpful AI.", "Tell me a joke.");
  console.log("ANSWER:");
  console.log(ans);
}
run();
