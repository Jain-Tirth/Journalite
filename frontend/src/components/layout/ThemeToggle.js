import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Button 
      variant={isDarkMode ? 'light' : 'dark'} 
      size="sm" 
      onClick={toggleTheme}
      className="d-flex align-items-center"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <>
          <i className="bi bi-sun-fill me-2"></i>
          <span className="d-none d-md-inline">Light</span>
        </>
      ) : (
        <>
          <i className="bi bi-moon-fill me-2"></i>
          <span className="d-none d-md-inline">Dark</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
