import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

export const MODEL_FLASH = googleAI.model('gemini-2.5-flash');
export const MODEL_PRO = googleAI.model('gemini-2.5-pro');
