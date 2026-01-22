import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/journaling-theme.css'; 

/**
 * Modern Journal Card Component
 * Beautiful curved container with glass morphism effect
 */
export const JournalCard = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  ...props 
}) => {
  return (
    <div 
      className={`journal-card ${hover ? 'journal-card-hover' : ''} ${gradient ? 'journal-card-gradient' : ''} ${className}`}
      {...props}
    >
      <div className="journal-card-body">
        {children}
      </div>
    </div>
  );
};

/**
 * Journal Entry Editor Component
 */
export const JournalEditor = ({ 
  title, 
  content, 
  onTitleChange, 
  onContentChange,
  titlePlaceholder = "What's on your mind?",
  contentPlaceholder = "Start writing your thoughts...",
  className = '',
  ...props 
}) => {
  return (
    <div className={`journal-editor ${className}`} {...props}>
      <div className="journal-editor-header">
        <input
          type="text"
          className="journal-title-input"
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
        />
      </div>
      <div className="journal-editor-body">
        <textarea
          className="journal-content-textarea"
          placeholder={contentPlaceholder}
          value={content}
          onChange={(e) => onContentChange?.(e.target.value)}
        />
      </div>
    </div>
  );
};

/**
 * Mood Selector Component
 */
export const MoodSelector = ({ 
  selectedMood, 
  onMoodChange,
  moods = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'grateful', label: 'Grateful', emoji: '🙏' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'anxious', label: 'Anxious', emoji: '😟' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
  ],
  className = ''
}) => {
  return (
    <div className={`mood-selector ${className}`}>
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          className={`mood-option ${selectedMood === mood.value ? 'active' : ''}`}
          onClick={() => onMoodChange?.(mood.value)}
        >
          <span className="mood-emoji">{mood.emoji}</span>
          <span>{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Journal Button Component
 */
export const JournalButton = ({ 
  variant = 'primary', 
  children, 
  icon,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClass = `btn-journal${variant !== 'primary' ? `-${variant}` : ''}`;
  
  return (
    <button 
      className={`${baseClass} ${className}`} 
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

/**
 * Journal Search Component
 */
export const JournalSearch = ({ 
  value, 
  onChange,
  placeholder = "Search your thoughts...",
  className = '',
  ...props 
}) => {
  return (
    <div className={`journal-search ${className}`}>
      <svg className="journal-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        className="journal-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
};

/**
 * Journal Tag Component
 */
export const JournalTag = ({ 
  children, 
  onClick,
  removable = false,
  onRemove,
  className = '',
  ...props 
}) => {
  return (
    <span 
      className={`journal-tag ${onClick ? 'journal-tag-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          className="journal-tag-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

/**
 * Journal Date Display Component
 */
export const JournalDate = ({ 
  date, 
  relative = false,
  className = '',
  ...props 
}) => {
  const formatDate = (date) => {
    if (relative) {
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <span className={`journal-date ${className}`} {...props}>
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5 0zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
      </svg>
      {formatDate(date)}
    </span>
  );
};

/**
 * Journal Alert Component
 */
export const JournalAlert = ({ 
  type = 'info', 
  children, 
  dismissible = false,
  onDismiss,
  className = '',
  ...props 
}) => {
  return (
    <div className={`alert-journal alert-journal-${type} ${className}`} {...props}>
      {children}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

// PropTypes
JournalCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  gradient: PropTypes.bool,
};

JournalEditor.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  onTitleChange: PropTypes.func,
  onContentChange: PropTypes.func,
  titlePlaceholder: PropTypes.string,
  contentPlaceholder: PropTypes.string,
  className: PropTypes.string,
};

MoodSelector.propTypes = {
  selectedMood: PropTypes.string,
  onMoodChange: PropTypes.func,
  moods: PropTypes.array,
  className: PropTypes.string,
};

JournalButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

JournalSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

JournalTag.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};

JournalDate.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  relative: PropTypes.bool,
  className: PropTypes.string,
};

JournalAlert.propTypes = {
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  children: PropTypes.node.isRequired,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

export default {
  JournalCard,
  JournalEditor,
  MoodSelector,
  JournalButton,
  JournalSearch,
  JournalTag,
  JournalDate,
  JournalAlert,
};
