import express from 'express';
import cors from 'cors';
import { Gradient } from 'gradient';

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gradient client
const getGradientClient = () => {
  const apiKey = process.env.MODEL_ACCESS_KEY;
  if (!apiKey) {
    throw new Error('MODEL_ACCESS_KEY environment variable is not set');
  }
  return new Gradient({ model_access_key: apiKey });
};

// FundingNEMO system message
const FUNDINGNEMO_SYSTEM = `You are FundingNEMO, an expert startup fundraising advisor. You help early-stage founders prepare investor-ready materials. You are concise, practical, and opinionated. Avoid hype and unrealistic claims. Produce copy-paste ready outputs. If JSON is requested, return ONLY valid JSON.`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Main generate endpoint
app.post('/generate', async (req, res) => {
  try {
    const { messages, model = 'openai-gpt-oss-120b', max_tokens = 900 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const client = getGradientClient();

    // Prepend system message if not already present
    const allMessages = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: FUNDINGNEMO_SYSTEM }, ...messages];

    console.log(`[Gradient] Calling model ${model} with ${allMessages.length} messages`);

    const response = await client.chat.completions.create({
      model,
      messages: allMessages,
      max_tokens,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content generated' });
    }

    // Try to detect if response should be JSON
    const trimmedContent = content.trim();
    if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
      try {
        // Clean markdown code blocks if present
        const cleanContent = trimmedContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const jsonData = JSON.parse(cleanContent);
        return res.json({ json: jsonData, text: null });
      } catch (e) {
        // Not valid JSON, return as text
      }
    }

    res.json({ text: content, json: null });
  } catch (error) {
    console.error('[Gradient] Error:', error);
    
    if (error.message?.includes('MODEL_ACCESS_KEY')) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    if (error.status === 401 || error.status === 403) {
      return res.status(401).json({ error: 'Authentication error. Check API key.' });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to generate content',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 FundingNEMO API server running at http://${HOST}:${PORT}`);
  console.log(`   Health check: GET /health`);
  console.log(`   Generate: POST /generate`);
  console.log(`   MODEL_ACCESS_KEY: ${process.env.MODEL_ACCESS_KEY ? 'configured' : 'NOT SET'}`);
});
