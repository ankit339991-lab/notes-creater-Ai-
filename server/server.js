/**
 * Server Entry Point
 */

import 'dotenv/config';
import app from './app.js';
import { initStorage } from './services/storageService.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize storage & seed notes
    await initStorage();

    const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 TubeNotes AI Server running at: http://localhost:${PORT}`);
      console.log(`📚 Frontend Dashboard:              http://localhost:${PORT}`);
      console.log(`⚡ API Health Check:                http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Engine:                       ${hasOpenRouter ? 'Live OpenRouter AI (' + (process.env.OPENROUTER_MODEL || 'openrouter/free') + ')' : 'Mock Mode'}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting TubeNotes AI server:', error);
    process.exit(1);
  }
}

startServer();

