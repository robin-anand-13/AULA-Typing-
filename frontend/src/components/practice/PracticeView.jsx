import React, { useState } from 'react';
import { Target, Zap, Hash, Code, BookOpen, CheckCircle, RotateCcw } from 'lucide-react';

const PRACTICE_DRILLS = [
  {
    id: 'drill_common',
    title: 'Top 100 Common Words',
    category: 'Speed Rhythm',
    icon: Zap,
    difficulty: 'Easy',
    text: 'the of and a to in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find'
  },
  {
    id: 'drill_bigrams',
    title: 'High-Frequency English Bigrams',
    category: 'Muscle Memory',
    icon: Target,
    difficulty: 'Medium',
    text: 'th he in er an re nd at on nt ha es st en ed to it ou ea hi is or ti as te et ng of al de se sa si ar'
  },
  {
    id: 'drill_punctuation',
    title: 'Complex Syntax & Punctuation',
    category: 'Precision',
    icon: BookOpen,
    difficulty: 'Medium',
    text: '"Wait!" she exclaimed, pausing briefly; "Could it be that simple?" Yes—undoubtedly, it was: precision (not haste) defines true speed.'
  },
  {
    id: 'drill_numbers',
    title: 'Numeric Keypad & Alphanumerics',
    category: 'Data Entry',
    icon: Hash,
    difficulty: 'Hard',
    text: 'Invoice #84920: Item A-102 costs $45.90, Item B-204 costs $128.50, and Item C-509 costs $99.10. Total billed: $273.50 with 18% tax.'
  },
  {
    id: 'drill_code',
    title: 'JavaScript Modern Idioms',
    category: 'Code Syntax',
    icon: Code,
    difficulty: 'Hard',
    text: 'const filterEven = (arr) => arr.filter((x) => x % 2 === 0).map((n) => n ** 2);\nexport default filterEven;'
  }
];

export default function PracticeView() {
  const [activeDrill, setActiveDrill] = useState(PRACTICE_DRILLS[0]);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setTypedText(val);

    if (val.length >= activeDrill.text.length) {
      setCompleted(true);
    }
  };

  const resetDrill = (drill = activeDrill) => {
    setActiveDrill(drill);
    setTypedText('');
    setStartTime(null);
    setCompleted(false);
  };

  const elapsedSeconds = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 0;
  const currentWpm = elapsedSeconds > 0 ? Math.round((typedText.length / 5) / (elapsedSeconds / 60)) : 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Targeted Practice Drills</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Reinforce muscle memory, conquer challenging symbols, and calibrate finger pacing in a zero-pressure environment.
        </p>

        {/* Drill Selector Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {PRACTICE_DRILLS.map((d) => {
            const Icon = d.icon;
            const isSelected = activeDrill.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => resetDrill(d)}
                className="glass-panel-subtle"
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--glass-border)',
                  background: isSelected ? 'var(--glass-bg-hover)' : 'var(--glass-bg-subtle)',
                  color: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Icon size={18} color="var(--color-accent)" />
                  <span className="badge" style={{ fontSize: '0.65rem' }}>{d.difficulty}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{d.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Drill Practice Screen */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeDrill.title}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{activeDrill.category}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              {currentWpm} WPM
            </div>
            <button className="glass-btn" onClick={() => resetDrill()} style={{ padding: '6px 12px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Passage Display */}
        <div style={{
          padding: '24px',
          background: 'rgba(13, 27, 42, 0.4)',
          borderRadius: '12px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1.15rem',
          lineHeight: 1.8,
          marginBottom: '20px',
          userSelect: 'none'
        }}>
          {activeDrill.text.split('').map((char, index) => {
            let color = 'rgba(244, 241, 222, 0.35)';
            let bg = 'transparent';
            if (index < typedText.length) {
              if (typedText[index] === char) {
                color = 'var(--color-success)';
              } else {
                color = '#f87171';
                bg = 'rgba(239, 68, 68, 0.2)';
              }
            }
            return (
              <span key={index} style={{ color, backgroundColor: bg }}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input Textarea */}
        <textarea
          value={typedText}
          onChange={handleInputChange}
          placeholder="Start typing here to practice..."
          rows={3}
          style={{
            width: '100%',
            padding: '16px',
            background: 'var(--glass-bg-subtle)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            color: 'var(--color-text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '1.05rem',
            resize: 'none',
            outline: 'none'
          }}
        />

        {completed && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(119, 141, 122, 0.2)',
            border: '1px solid var(--color-success)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={24} color="var(--color-success)" />
            <div>
              <strong style={{ color: 'var(--color-success)' }}>Drill Completed!</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Finished at {currentWpm} WPM in {elapsedSeconds} seconds.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
