import React from 'react';
import './JournaliteLoader.css';

const JournaliteLoader = ({ message = 'Loading...', size = 'md' }) => (
  <div className={`jl-loader jl-loader--${size}`} role="status" aria-label={message}>
    {/* Animated open book with turning pages */}
    <div className="jl-book">
      <div className="jl-book__spine"></div>
      <div className="jl-book__page jl-book__page--left">
        <div className="jl-book__line"></div>
        <div className="jl-book__line"></div>
        <div className="jl-book__line jl-book__line--short"></div>
      </div>
      <div className="jl-book__page jl-book__page--right">
        <div className="jl-book__line jl-book__line--appearing"></div>
        <div className="jl-book__line jl-book__line--appearing" style={{ animationDelay: '0.3s' }}></div>
        <div className="jl-book__line jl-book__line--appearing jl-book__line--short" style={{ animationDelay: '0.6s' }}></div>
      </div>
      {/* Flipping page overlay */}
      <div className="jl-book__flip"></div>
      {/* Floating ink particles */}
      <div className="jl-particles">
        <span className="jl-particle" style={{ '--i': 0 }}></span>
        <span className="jl-particle" style={{ '--i': 1 }}></span>
        <span className="jl-particle" style={{ '--i': 2 }}></span>
        <span className="jl-particle" style={{ '--i': 3 }}></span>
        <span className="jl-particle" style={{ '--i': 4 }}></span>
      </div>
    </div>
    {/* Pen writing underneath */}
    <div className="jl-pen-track">
      <div className="jl-pen-trail"></div>
      <div className="jl-pen-nib">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
    {message && <p className="jl-loader__text">{message}</p>}
  </div>
);

export default JournaliteLoader;
