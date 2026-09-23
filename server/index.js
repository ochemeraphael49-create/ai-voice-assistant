* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  width: 100%;
  font-family: Inter, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f172a, #111827 40%, #1f2937);
  color: #e5e7eb;
}

button, input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.app-card {
  width: min(900px, 100%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.45);
  padding: 22px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  color: #7dd3fc;
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
}

.mic-button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: white;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.mic-button:hover {
  transform: translateY(-1px);
}

.mic-button.live {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  padding: 8px 4px 18px;
}

.bubble {
  max-width: 80%;
  border-radius: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.bubble.user {
  align-self: flex-end;
  background: rgba(59, 130, 246, 0.15);
}

.bubble.assistant {
  align-self: flex-start;
  background: rgba(15, 118, 110, 0.18);
}

.label {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.bubble p {
  margin: 0;
  line-height: 1.6;
}

.composer {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.composer input {
  flex: 1;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  padding: 14px 16px;
  outline: none;
}

.composer button {
  border: none;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  color: white;
  border-radius: 14px;
  padding: 14px 18px;
  font-weight: 700;
  cursor: pointer;
}

.composer button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  margin-top: 16px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
}

@media (max-width: 640px) {
  .topbar,
  .composer {
    flex-direction: column;
  }

  .bubble {
    max-width: 100%;
  }
}
