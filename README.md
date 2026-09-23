# Auralis AI assistant

A premium React voice assistant with OpenAI Realtime voice streaming, Supabase authentication, and a production Express server.

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

Add `OPENAI_API_KEY` for AI and realtime voice. Add a Supabase project URL and anon key for real email/password accounts. Enable Email auth in Supabase Authentication settings.

## Deploy to Render

1. Create a new Web Service from this repository.
2. Render can use the included `render.yaml`, or use build command `npm install && npm run build` and start command `npm start`.
3. Add the environment variables shown in `.env.example` in Render. Never expose `OPENAI_API_KEY` in `VITE_*` variables.
4. In Supabase Authentication > URL Configuration, set the deployed URL as the site URL.

Realtime voice uses WebRTC. The server creates a short-lived OpenAI client secret, so the permanent API key never reaches the browser.
