import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import logger from './logger.js';

/**
 * Executes a text generation query across configured Gemini keys,
 * falling back to configured Groq keys if all Gemini attempts fail.
 *
 * @param {string} systemPrompt - Instructs model behavior and safety guidelines.
 * @param {string} userPrompt - Context and target variables.
 * @returns {Promise<string>} The generated response or fallback notice.
 */
export const executeWithRotation = async (systemPrompt, userPrompt) => {
  const geminiKeys = config.geminiApiKeys || [];
  const groqKeys = config.grokApiKeys || [];

  // Diagnostic: log key counts so misconfiguration is immediately visible
  logger.info(`[AIRotator] Loaded ${geminiKeys.length} Gemini key(s), ${groqKeys.length} Groq key(s)`);
  if (geminiKeys.length === 0 && groqKeys.length === 0) {
    console.error('[AIRotator] FATAL: No AI API keys configured. Check GEMINI_API_KEYS and GROQ_API_KEYS in .env');
  }

  // Loop 1: Iterate through the Gemini API keys
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    const geminiModels = ['gemini-3.6-flash'];
    for (const modelName of geminiModels) {
      try {
        logger.info(`[AIRotator] Attempting generation using Gemini model "${modelName}" with key index ${i}`);
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: systemPrompt
        });
        
        const response = result.response;
        const text = response.text();
        if (text) {
          return text.trim();
        }
      } catch (error) {
        logger.warn(`[AIRotator] Gemini (${modelName}) key[${i}] failed: ${error.message}`);
      }
    }
  }

  // Loop 2: Fallback to Groq API keys if Gemini keys failed or are empty
  if (groqKeys.length > 0) {
    logger.info('[AIRotator] Falling back to Groq API keys...');
    const groqModels = ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];
    
    for (let i = 0; i < groqKeys.length; i++) {
      const key = groqKeys[i];
      for (const modelName of groqModels) {
        try {
          logger.info(`[AIRotator] Attempting generation using Groq model "${modelName}" with key index ${i}`);
          
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              return text.trim();
            }
          } else {
            const errBody = await response.text().catch(() => '');
            logger.warn(`[AIRotator] Groq (${modelName}) key[${i}] HTTP ${response.status}: ${errBody.slice(0, 150)}`);
          }
        } catch (error) {
          logger.warn(`[AIRotator] Groq (${modelName}) key[${i}] error: ${error.message}`);
        }
      }
    }
  } else {
    console.error('[AIRotator] No Groq keys available (GROQ_API_KEYS env var missing or empty).');
  }

  // Ultimate Fallback
  console.error('[AIRotator] ALL providers exhausted. Returning hardcoded fallback. Check your API keys and quotas.');
  logger.error('[AIRotator] All API providers and keys failed to generate a response.');
  return 'SecureAI explanation is currently unavailable due to high demand. Please refer to the technical evidence below.';
};

export default {
  executeWithRotation
};
