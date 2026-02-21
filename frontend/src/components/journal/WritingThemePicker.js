import React, { useState, useEffect, useCallback } from 'react';

/**
 * WritingThemePicker
 * 
 * A theme selector component for the journal entry form.
 * Each theme transforms the writing environment with
 * colors, textures, and subtle animations.
 * 
 * 🕊️ Serenity      – Peace, clarity, stillness of mind
 * 🌿 Sacred Grove   – Growth, healing, spiritual renewal
 * 🌌 Midnight Cosmos – Deep reflection, mystery, infinite possibility
 * 🌅 Golden Hour    – Gratitude, warmth, living in the moment
 * 🌸 Rose Quartz    – Self-love, compassion, emotional healing
 * 🌊 Ocean Deep     – Courage, depth of emotion, letting go
 */

const WRITING_THEMES = [
  {
    id: 'serenity',
    name: 'Serenity',
    emoji: '🕊️',
    meaning: 'Peace & Clarity',
    description: 'Like writing on a cloud at dawn. For moments of quiet reflection.',
    className: 'writing-theme-serenity',
  },
  {
    id: 'sacred-grove',
    name: 'Sacred Grove',
    emoji: '🌿',
    meaning: 'Growth & Healing',
    description: 'A sunlit forest clearing. For journaling about personal growth.',
    className: 'writing-theme-sacred-grove',
  },
  {
    id: 'midnight-cosmos',
    name: 'Midnight Cosmos',
    emoji: '🌌',
    meaning: 'Deep Reflection',
    description: 'Beneath a canopy of stars. For your deepest thoughts and dreams.',
    className: 'writing-theme-midnight-cosmos',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    emoji: '🌅',
    meaning: 'Gratitude & Warmth',
    description: 'Warm sunset light. For writing about gratitude and cherished moments.',
    className: 'writing-theme-golden-hour',
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    emoji: '🌸',
    meaning: 'Self-Love & Compassion',
    description: 'A gentle embrace. For self-care journaling and emotional healing.',
    className: 'writing-theme-rose-quartz',
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    emoji: '🌊',
    meaning: 'Courage & Letting Go',
    description: 'Moonlit ocean waves. For processing deep emotions and finding release.',
    className: 'writing-theme-ocean-deep',
  },
];

const STORAGE_KEY = 'journalite-writing-theme';

const WritingThemePicker = ({ onThemeChange }) => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });
  const [transitioning, setTransitioning] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState(null);

  // Notify parent of initial theme
  useEffect(() => {
    if (onThemeChange) {
      const theme = WRITING_THEMES.find(t => t.id === activeTheme);
      onThemeChange(theme?.className || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeSelect = useCallback((themeId) => {
    // If tapping the same theme, deselect it (back to default)
    const newThemeId = activeTheme === themeId ? null : themeId;

    setActiveTheme(newThemeId);

    // Store preference
    if (newThemeId) {
      localStorage.setItem(STORAGE_KEY, newThemeId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Trigger transition animation
    setTransitioning(true);
    setTimeout(() => setTransitioning(false), 600);

    // Notify parent
    if (onThemeChange) {
      const theme = WRITING_THEMES.find(t => t.id === newThemeId);
      onThemeChange(theme?.className || null);
    }
  }, [activeTheme, onThemeChange]);

  const activeThemeData = WRITING_THEMES.find(t => t.id === activeTheme);

  return (
    <div className="writing-theme-picker-container">
      <div className="writing-theme-picker">
        <span className="writing-theme-picker-label">
          <i className="bi bi-palette2"></i>
          Vibe
        </span>

        {WRITING_THEMES.map((theme) => (
          <div
            key={theme.id}
            className="theme-swatch-wrapper"
            onMouseEnter={() => setHoveredTheme(theme.id)}
            onMouseLeave={() => setHoveredTheme(null)}
          >
            <button
              type="button"
              className={`theme-swatch theme-swatch--${theme.id} ${activeTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
              aria-label={`${theme.name} theme — ${theme.meaning}`}
              title={`${theme.emoji} ${theme.name} — ${theme.meaning}`}
            >
              {theme.emoji}
            </button>
            <span className="theme-swatch-name">{theme.name}</span>
          </div>
        ))}
      </div>

      {/* Theme info tooltip on hover */}
      {hoveredTheme && (
        <div className="writing-theme-tooltip" style={{
          marginTop: '0.4rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--wt-card-bg, rgba(255,255,255,0.9))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid var(--wt-card-border, rgba(0,0,0,0.08))',
          fontSize: '0.8rem',
          color: 'var(--wt-text, var(--text-secondary, #435257))',
          animation: 'fadeIn 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '1.2rem' }}>
            {WRITING_THEMES.find(t => t.id === hoveredTheme)?.emoji}
          </span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--wt-heading, var(--text-primary, #1f2a2e))' }}>
              {WRITING_THEMES.find(t => t.id === hoveredTheme)?.name}
              <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                — {WRITING_THEMES.find(t => t.id === hoveredTheme)?.meaning}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.1rem' }}>
              {WRITING_THEMES.find(t => t.id === hoveredTheme)?.description}
            </div>
          </div>
        </div>
      )}

      {/* Currently active indicator */}
      {activeThemeData && !hoveredTheme && (
        <div style={{
          marginTop: '0.3rem',
          fontSize: '0.75rem',
          color: 'var(--wt-text-muted, var(--text-muted, #96a1a7))',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          Writing in <strong style={{ color: 'var(--wt-accent, var(--primary, #0f766e))' }}>
            {activeThemeData.emoji} {activeThemeData.name}
          </strong> mode
          <span style={{ opacity: 0.6, marginLeft: '0.2rem' }}>• tap again to reset</span>
        </div>
      )}
    </div>
  );
};

export { WRITING_THEMES };
export default WritingThemePicker;
