import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-voice-assistant' });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const prompt = String(message).trim();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply:
          `Demo assistant reply: You asked, "${prompt}". This app is ready for live AI integration. Add your OpenAI API key in the .env file to enable real model responses.`,
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful, friendly AI assistant. Keep replies concise and natural.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    return res.json({
      reply: reply || 'I am here to help with your question.',
    });
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return res.status(500).json({
      reply:
        'The AI service is temporarily unavailable. Please try again later or use the demo mode.',
    });
  }
});

app.listen(port, () => {
  console.log(`AI assistant backend running on http://localhost:${port}`);
});
