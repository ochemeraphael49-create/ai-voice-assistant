import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Welcome to Auralis. I am ready when you are.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceState, setVoiceState] = useState('idle');
  const [error, setError] = useState('');
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const authenticate = async (event) => {
    event.preventDefault();
    if (!supabase) { setAuthError('Connect Supabase by adding VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'); return; }
    setAuthBusy(true); setAuthError('');
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) setAuthError(result.error.message);
    else if (authMode === 'signup') setAuthError('Check your email to confirm your account.');
    setAuthBusy(false);
  };

  const signOut = () => supabase?.auth.signOut();

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput(''); setBusy(true); setError(''); setMessages((old) => [...old, { role: 'user', text }]);
    try {
      const response = await fetch(`${API_URL}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setMessages((old) => [...old, { role: 'assistant', text: data.reply }]);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const stopVoice = () => {
    channelRef.current?.close(); peerRef.current?.close(); streamRef.current?.getTracks().forEach((track) => track.stop());
    channelRef.current = null; peerRef.current = null; streamRef.current = null; setVoiceState('idle');
  };

  const startVoice = async () => {
    if (voiceState !== 'idle') { stopVoice(); return; }
    try {
      setError(''); setVoiceState('connecting');
      const tokenResponse = await fetch(`${API_URL}/realtime-token`, { method: 'POST' });
      const token = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(token.error || 'Could not create voice session');
      const peer = new RTCPeerConnection();
      const audio = new Audio(); audio.autoplay = true;
      peer.ontrack = (event) => { audio.srcObject = event.streams[0]; };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      const channel = peer.createDataChannel('oai-events');
      channel.onopen = () => { setVoiceState('live'); channel.send(JSON.stringify({ type: 'session.update', session: { modalities: ['text', 'audio'], instructions: 'You are Auralis, a concise and warm personal assistant.' } })); };
      channel.onerror = () => setError('Voice connection failed.');
      peerRef.current = peer; streamRef.current = stream; channelRef.current = channel;
      const offer = await peer.createOffer(); await peer.setLocalDescription(offer);
      const answer = await fetch(`https://api.openai.com/v1/realtime?model=${token.model}`, { method: 'POST', headers: { Authorization: `Bearer ${token.client_secret}`, 'Content-Type': 'application/sdp' }, body: offer.sdp });
      if (!answer.ok) throw new Error('OpenAI voice connection failed');
      await peer.setRemoteDescription({ type: 'answer', sdp: await answer.text() });
    } catch (err) { stopVoice(); setError(err.message || 'Microphone permission is required.'); }
  };

  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} busy={authBusy} error={authError} onSubmit={authenticate} />;

  return <main className="app-shell"><div className="app-window"><aside className="sidebar"><div className="logo"><span>✦</span><strong>Auralis</strong></div><div className="profile"><div className="avatar">{session.user.email?.[0].toUpperCase()}</div><div><b>{session.user.email?.split('@')[0]}</b><small>Personal workspace</small></div></div><div className="side-note"><span className="pulse-dot" /> Voice ready<br /><small>Private and secure</small></div><button className="signout" onClick={signOut}>↪ Sign out</button></aside><section className="workspace"><header className="workspace-header"><div><span className="kicker">PERSONAL AI COMPANION</span><h1>Your thinking, amplified.</h1><p>Talk naturally, ask anything, and get things done.</p></div><div className="online"><i /> Online</div></header><div className="conversation">{messages.map((message, index) => <div key={index} className={`message ${message.role}`}><div className="message-icon">{message.role === 'assistant' ? '✦' : session.user.email?.[0].toUpperCase()}</div><div><span className="message-label">{message.role === 'assistant' ? 'Auralis' : 'You'}</span><p>{message.text}</p></div></div>)}{busy && <div className="typing"><i /><i /><i /> Thinking</div>}</div>{error && <div className="error-box">{error}</div>}<div className="composer"><form onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Auralis anything..." /><button className="send" disabled={busy || !input.trim()}>↑</button></form><button className={`voice ${voiceState}`} onClick={startVoice}>{voiceState === 'live' ? '■ End live conversation' : voiceState === 'connecting' ? 'Connecting…' : '◉ Start live conversation'}</button><small>Press the button to speak in real time. Your microphone stays private.</small></div></section></div></main>;
}

function AuthScreen({ mode, setMode, email, setEmail, password, setPassword, busy, error, onSubmit }) {
  return <main className="auth-shell"><div className="auth-card"><div className="auth-brand"><span>✦</span><strong>Auralis</strong></div><span className="kicker">PRIVATE AI COMPANION</span><h1>{mode === 'login' ? 'Welcome back.' : 'Create your space.'}</h1><p className="auth-subtitle">{mode === 'login' ? 'Continue your conversations, privately.' : 'A calmer, smarter way to get things done.'}</p><form onSubmit={onSubmit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="6" placeholder="••••••••" /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="switch-auth" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button><small>By continuing, you agree to use Auralis responsibly.</small></div></main>;
}
