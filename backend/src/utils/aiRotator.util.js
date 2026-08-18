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

  // Loop 1: Iterate through the Gemini API keys
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    try {
      logger.info(`[AIRotator] Attempting generation using Gemini API key index ${i}`);
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: systemPrompt
      });
      
      const response = await result.response;
      const text = response.text();
      if (text) {
        return text.trim();
      }
    } catch (error) {
      logger.warn(`[AIRotator] Gemini API key index ${i} failed: ${error.message}`);
    }
  }

  // Loop 2: Fallback to Groq API keys if Gemini keys failed or are empty
  if (groqKeys.length > 0) {
    logger.info('[AIRotator] All Gemini keys exhausted or empty. Falling back to Groq API keys...');
    for (let i = 0; i < groqKeys.length; i++) {
      const key = groqKeys[i];
      try {
        logger.info(`[AIRotator] Attempting generation using Groq API key index ${i}`);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Groq API returned status: ${response.status}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          return text.trim();
        }
      } catch (error) {
        logger.warn(`[AIRotator] Groq API key index ${i} failed: ${error.message}`);
      }
    }
  }

  // Ultimate Fallback
  logger.error('[AIRotator] All API providers and keys failed to generate a response.');
  return 'SecureAI explanation is currently unavailable due to high demand. Please refer to the technical evidence below.';
};

export default {
  executeWithRotation
};
