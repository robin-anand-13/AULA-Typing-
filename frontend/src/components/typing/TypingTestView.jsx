import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/apiClient.js';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TypingTestView({ onTestComplete }) {
  const [passages, setPassages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [duration, setDuration] = useState(60);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('ready'); // ready, active, submitting, completed, error
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live client-side preview metrics (authoritative calculated by backend)
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const startTimeRef = useRef(null);
  const eventsRef = useRef([]);

  // Tactile audio click synthesizer (no external audio files required)
  const playMechanicalClick = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Fetch passages (automatically queries Gemini for a fresh, unique AI sentence on load/refresh)
  useEffect(() => {
    let url = '/api/v1/passages?ai=true';
    if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
    if (selectedDifficulty !== 'all') url += `&difficulty=${selectedDifficulty}`;

    apiRequest(url)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPassages(res.data);
          setSelectedPassage(res.data[0]);
        }
      })
      .catch(err => {
        setErrorMsg('Failed to fetch passages from server: ' + err.message);
      });
  }, [selectedCategory, selectedDifficulty]);

  // Method to request another fresh Gemini passage on-the-fly
  const loadNewGeminiPassage = async () => {
    try {
      setErrorMsg('');
      const res = await apiRequest(`/api/v1/passages/random-gemini?category=${selectedCategory}`);
      if (res.data) {
        setSelectedPassage(res.data);
        setTypedText('');
        setTimeLeft(duration);
        setStatus('ready');
      }
    } catch (err) {
      setErrorMsg('Failed to generate Gemini sentence: ' + err.message);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (status === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status, timeLeft]);

  // Compute live client indicators
  useEffect(() => {
    if (status !== 'active' || !startTimeRef.current) return;
    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
    if (elapsedMinutes > 0) {
      const words = typedText.length / 5;
      setLiveWpm(Math.round(words / elapsedMinutes));
    }

    if (typedText.length > 0 && selectedPassage) {
      let correct = 0;
      for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === selectedPassage.text[i]) correct++;
      }
      setLiveAccuracy(Math.round((correct / typedText.length) * 100));
    }
  }, [typedText, status]);

  const startTest = async () => {
    try {
      setErrorMsg('');
      setStatus('ready');
      setTypedText('');
      setTimeLeft(duration);
      setLiveWpm(0);
      setLiveAccuracy(100);
      eventsRef.current = [];

      // Create session with current selected passage (including Gemini dynamically generated ones)
      const createRes = await apiRequest('/api/v1/typing/sessions', {
        method: 'POST',
        body: JSON.stringify({
          passageId: selectedPassage?.id,
          customPassage: selectedPassage,
          duration
        })
      });

      const currentSession = createRes.data;
      setSession(currentSession);

      // Authoritative start
      await apiRequest(`/api/v1/typing/sessions/${currentSession.sessionId}/start`, {
        method: 'POST'
      });

      startTimeRef.current = Date.now();
      setStatus('active');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      setErrorMsg(err.message || 'Error starting session');
      setStatus('error');
    }
  };

  const finishTest = async () => {
    if (status === 'submitting' || !session) return;
    setStatus('submitting');
    clearInterval(timerRef.current);

    try {
      const res = await apiRequest(`/api/v1/typing/sessions/${session.sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          typedText,
          events: eventsRef.current
        })
      });

      setStatus('completed');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onTestComplete) {
        onTestComplete(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to submit results: ' + err.message);
      setStatus('error');
    }
  };

  const handleInputChange = (e) => {
    if (status !== 'active') return;
    const val = e.target.value;
    playMechanicalClick();

    eventsRef.current.push({
      timeMs: Date.now() - (startTimeRef.current || Date.now()),
      type: val.length > typedText.length ? 'insert' : 'delete',
      char: val.slice(-1)
    });

    setTypedText(val);

    if (selectedPassage && val.length >= selectedPassage.text.length) {
      finishTest();
    }
  };

  const targetText = selectedPassage ? selectedPassage.text : '';
  const progressPercent = targetText ? Math.min(100, Math.round((typedText.length / targetText.length) * 100)) : 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Glass Configuration Bar */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Category:</span>
            {['all', 'general', 'code', 'punctuation', 'numbers'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                disabled={status === 'active'}
                className="glass-btn"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                  background: selectedCategory === cat ? 'var(--color-surface)' : 'transparent',
                  borderColor: selectedCategory === cat ? 'var(--color-accent)' : 'var(--glass-border)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Duration Selector */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration:</span>
            {[30, 60, 120].map(sec => (
              <button
                key={sec}
                onClick={() => { if (status !== 'active') { setDuration(sec); setTimeLeft(sec); } }}
                disabled={status === 'active'}
                className="glass-btn"
                style={{
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  background: duration === sec ? 'var(--color-accent)' : 'transparent',
                  color: duration === sec ? 'var(--color-bg-deep)' : 'var(--color-text-primary)',
                  fontWeight: 700
                }}
              >
                {sec}s
              </button>
            ))}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="glass-btn"
              style={{ padding: '6px 10px', marginLeft: '6px' }}
              title={soundEnabled ? 'Mute Mechanical Switch Clicks' : 'Enable Switch Clicks'}
            >
              {soundEnabled ? <Volume2 size={15} color="var(--color-accent)" /> : <VolumeX size={15} />}
            </button>

            <button
              onClick={loadNewGeminiPassage}
              disabled={status === 'active'}
              className="glass-btn"
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(212, 196, 168, 0.15)', borderColor: 'var(--color-accent)' }}
              title="Generate a brand new random sentence using Gemini AI"
            >
              <Sparkles size={14} color="var(--color-accent)" /> New AI Sentence
            </button>
          </div>
        </div>

        {/* Live HUD Dashboard during Test */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>TIME REMAINING</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: timeLeft <= 10 ? '#f87171' : 'var(--color-accent)' }}>
              {timeLeft}s
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CURRENT WPM</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{liveWpm}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>LIVE ACCURACY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>{liveAccuracy}%</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PROGRESS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{progressPercent}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'rgba(65, 90, 119, 0.3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--color-accent)',
            transition: 'width 0.15s ease'
          }} />
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {/* Main Typing Passage Display */}
      <div 
        className="glass-panel"
        onClick={() => inputRef.current?.focus()}
        style={{
          padding: '36px',
          minHeight: '220px',
          cursor: 'text',
          position: 'relative',
          userSelect: 'none',
          lineHeight: 1.9,
          fontSize: '1.3rem',
          letterSpacing: '0.015em',
          fontFamily: "'JetBrains Mono', monospace",
          border: status === 'active' ? '1px solid var(--glass-border-focus)' : '1px solid var(--glass-border)'
        }}
      >
        {targetText ? (
          <div>
            {targetText.split('').map((char, index) => {
              let color = 'rgba(244, 241, 222, 0.32)'; // Untyped
              let bg = 'transparent';
              let isCurrent = index === typedText.length;

              if (index < typedText.length) {
                if (typedText[index] === char) {
                  color = 'var(--color-success)'; // Correct
                } else {
                  color = '#f87171'; // Incorrect
                  bg = 'rgba(239, 68, 68, 0.25)';
                }
              }

              return (
                <span
                  key={index}
                  style={{
                    color,
                    backgroundColor: bg,
                    borderBottom: isCurrent ? '2px solid var(--color-accent)' : 'none',
                    borderRadius: '2px',
                    transition: 'color 0.08s ease'
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted)' }}>Loading passage from backend...</div>
        )}

        {/* Hidden keyboard input capturing keystrokes */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          disabled={status !== 'active'}
          style={{
            position: 'absolute',
            opacity: 0,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            cursor: 'default'
          }}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      {/* Bottom Start / Finish Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--color-success)" />
          {status === 'active' ? 'Keyboard captured · Press Backspace to correct' : 'Click "Start Benchmark" or press any key to initiate authoritative test'}
        </div>

        <div>
          {status !== 'active' ? (
            <button className="glass-btn primary" onClick={startTest} style={{ padding: '12px 28px', fontSize: '1rem' }}>
              <Play size={18} /> Start Benchmark
            </button>
          ) : (
            <button className="glass-btn" onClick={finishTest} style={{ padding: '12px 24px' }}>
              <CheckCircle2 size={18} /> Complete Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
