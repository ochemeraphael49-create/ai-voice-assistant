# AI Voice Assistant

A React starter app for a real-time AI assistant with:

- speech-to-text microphone support
- live chat interface
- AI replies via backend API
- text-to-speech feedback
- modern responsive UI

## Tech stack

- React + Vite
- Express backend
- OpenAI API integration ready

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your real OpenAI API key to `.env`:
   ```bash
   OPENAI_API_KEY=your_key_here
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

5. Open the app in your browser:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Important

This is not demo mode. It is production-ready for real AI when you provide a valid `OPENAI_API_KEY`.
Without a key, the app will refuse to generate responses and instead show a configuration error.

## Notes

- Browser voice recognition works best in Chrome or Edge.
- For true live spoken conversations, use the OpenAI Realtime API or a dedicated WebRTC voice pipeline.
