import { useEffect, useMemo, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hi! I am your AI assistant. Ask me anything, or use the mic to speak.',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognition = useMemo(() => {
    const win = window;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prev) => prev ? `${prev} ${transcript}`.trim() : transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setError('Microphone recognition failed. Please try again.');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [SpeechRecognition]);

  const addMessage = (sender, text) => {
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
      },
    ]);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride) => {
    const content = (textOverride ?? message).trim();
    if (!content || isSending) return;

    setError('');
    setIsSending(true);
    setMessage('');
    addMessage('user', content);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();
      const assistantReply = data.reply || 'I am here to help.';
      addMessage('assistant', assistantReply);
      speak(assistantReply);
    } catch (err) {
      const fallback = 'Sorry, I could not reach the assistant service. Please try again.';
      addMessage('assistant', fallback);
      speak(fallback);
      setError('There was a problem contacting the AI service.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setError('');
    recognitionRef.current.start();
    setIsListening(true);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">Voice AI</p>
            <h1>Real-Time Assistant</h1>
          </div>
          <button
            className={`mic-button ${isListening ? 'live' : ''}`}
            onClick={toggleListening}
            disabled={isSending}
            type="button"
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </header>

        <div className="chat-panel">
          {history.map((entry) => (
            <div key={entry.id} className={`bubble ${entry.sender}`}>
              <span className="label">{entry.sender === 'user' ? 'You' : 'Assistant'}</span>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="composer">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message here..."
            aria-label="Message input"
          />
          <button onClick={() => handleSend()} disabled={isSending || !message.trim()}>
            {isSending ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
