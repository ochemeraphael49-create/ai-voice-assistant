import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3001);
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.post('/api/chat', async (req, res) => {
  if (!openai) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Message is required.' });
  try {
    const completion = await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are Auralis, a warm and concise personal AI assistant.' }, { role: 'user', content: message }] });
    res.json({ reply: completion.choices?.[0]?.message?.content?.trim() || 'I am ready to help.' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'The AI service is unavailable. Check your API key and billing.' }); }
});

app.post('/api/realtime-token', async (_req, res) => {
  if (!openai) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview', voice: process.env.OPENAI_VOICE || 'alloy' }) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Could not create realtime session.' });
    res.json({ client_secret: data.client_secret?.value, model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Realtime service unavailable.' }); }
});

if (process.env.NODE_ENV === 'production') {
  const root = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(root, '../dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(root, '../dist/index.html')));
}
app.listen(port, () => console.log(`Auralis server listening on ${port}`));
