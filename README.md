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

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI key to `.env`:
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

## Notes

- The app works in demo mode without an API key.
- Browser speech recognition works in supported browsers such as Chrome and Edge.
- To enable real AI responses, add your OpenAI key to `.env`.
