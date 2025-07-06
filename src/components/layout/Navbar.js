import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Offcanvas, Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const isDarkMode = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  const isActive = (path) => location.pathname === path;

  // Check if user is admin (fallback if not available from useAuth)
  const checkIsAdmin = () => {
    if (typeof isAdmin === 'function') {
      return isAdmin();
    }
    return currentUser?.role === 'admin' || false;
  };

  // Mobile Menu Button (Hamburger) - Only visible on mobile
  const MobileMenuButton = () => (
    <Button
      variant="link"
      className="position-fixed d-lg-none"
      style={{
        top: '15px',
        right: '15px',
        zIndex: 1040,
        border: 'none',
        background: 'transparent',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: isDarkMode ? '0 2px 10px rgba(255,255,255,0.1)' : '0 2px 10px rgba(0,0,0,0.1)'
      }}
      onClick={handleShowSidebar}
    >
      <i className={`bi bi-list fs-4 ${isDarkMode ? 'text-white' : 'text-dark'}`}></i>
    </Button>
  );

  // Desktop/Tablet Horizontal Navbar
  const DesktopNavbar = () => (
    <BootstrapNavbar
      bg={isDarkMode ? "dark" : "light"}
      variant={isDarkMode ? "dark" : "light"}
      expand="lg"
      fixed="top"
      className="shadow-sm d-none d-lg-block"
    >
      <Container>
        <BootstrapNavbar.Brand className="d-flex align-items-center">
          <i className="bi bi-journal-bookmark navbar-brand-icon"></i>
          <span className="text-gradient fw-bold">Journalite</span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              <>
                <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
                  <i className="bi bi-house me-1"></i> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/journal" className={isActive('/journal') ? 'active' : ''}>
                  <i className="bi bi-journal-text me-1"></i> My Journal
                </Nav.Link>
                <Nav.Link as={Link} to="/insights" className={isActive('/insights') ? 'active' : ''}>
                  <i className="bi bi-graph-up me-1"></i> Insights
                </Nav.Link>
                {checkIsAdmin() && (
                  <Nav.Link as={Link} to="/admin" className={isActive('/admin') ? 'active' : ''}>
                    <i className="bi bi-shield-lock me-1"></i> Admin
                  </Nav.Link>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className={isActive('/login') ? 'active' : ''}>
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={isActive('/register') ? 'active' : ''}>
                  <i className="bi bi-person-plus me-1"></i> Register
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center">
            <div className="me-3">
              <ThemeToggle />
            </div>

            {currentUser && (
              <NavDropdown
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {currentUser.displayName || currentUser.email || 'User'}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-2"></i>Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );

  // Sidebar Content Component
  const SidebarContent = ({ onItemClick }) => (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div
              className="rounded-3 me-3 d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <i className="bi bi-journal-bookmark text-white fs-5"></i>
            </div>
            <span className="fw-bold fs-5">Journalite</span>
          </div>
          <Button
            variant="link"
            className="d-lg-none p-0 border-0"
            onClick={onItemClick}
            style={{ fontSize: '1.5rem' }}
          >
            <i className={`bi bi-x ${isDarkMode ? 'text-white' : 'text-dark'}`}></i>
          </Button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-grow-1 py-4">
        {currentUser ? (
          <div className="px-3">
            <NavItem
              to="/"
              icon="bi-house"
              label="Dashboard"
              isActive={isActive('/')}
              onClick={onItemClick}
            />
            <NavItem
              to="/journal"
              icon="bi-journal-text"
              label="Journal Entries"
              isActive={isActive('/journal')}
              onClick={onItemClick}
            />
            <NavItem
              to="/insights"
              icon="bi-graph-up"
              label="Insights"
              isActive={isActive('/insights')}
              onClick={onItemClick}
            />
            <NavItem
              to="/profile"
              icon="bi-person"
              label="Profile"
              isActive={isActive('/profile')}
              onClick={onItemClick}
            />
            {checkIsAdmin() && (
              <NavItem
                to="/admin"
                icon="bi-shield-lock"
                label="Admin"
                isActive={isActive('/admin')}
                onClick={onItemClick}
              />
            )}
          </div>
        ) : (
          <div className="px-3">
            <NavItem
              to="/login"
              icon="bi-box-arrow-in-right"
              label="Login"
              isActive={isActive('/login')}
              onClick={onItemClick}
            />
            <NavItem
              to="/register"
              icon="bi-person-plus"
              label="Register"
              isActive={isActive('/register')}
              onClick={onItemClick}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-top">
        <div className="d-flex align-items-center justify-content-between">
          <ThemeToggle />
          {currentUser && (
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#6c757d'
                    }}
                  >
                    <i className="bi bi-person text-white"></i>
                  </div>
                  <small className="text-muted">
                    {currentUser.displayName || currentUser.email || 'User'}
                  </small>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-1 text-muted"
                onClick={() => {
                  handleLogout();
                  if (onItemClick) onItemClick();
                }}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Individual Navigation Item Component
  const NavItem = ({ to, icon, label, isActive, onClick }) => (
    <Link
      to={to}
      className={`d-block text-decoration-none py-3 px-3 rounded-3 mb-2 transition-all ${
        isActive
          ? (isDarkMode ? 'bg-primary text-white' : 'bg-primary text-white')
          : (isDarkMode ? 'text-white hover-bg-dark' : 'text-dark hover-bg-light')
      }`}
      onClick={onClick}
      style={{
        transition: 'all 0.2s ease',
        fontSize: '1rem',
        fontWeight: isActive ? '600' : '400'
      }}
    >
      <div className="d-flex align-items-center">
        <i className={`${icon} me-3`} style={{ fontSize: '1.1rem', width: '20px' }}></i>
        <span>{label}</span>
      </div>
    </Link>
  );

  return (
    <>
      {/* Desktop/Tablet Horizontal Navbar */}
      <DesktopNavbar />

      {/* Mobile Menu Button - Only visible on mobile */}
      <MobileMenuButton />

      {/* Mobile Sidebar (Offcanvas) - Only visible on mobile */}
      <Offcanvas
        show={showSidebar}
        onHide={handleCloseSidebar}
        placement="start"
        className={`${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'} sidebar-offcanvas d-lg-none`}
        style={{ width: '300px' }}
      >
        <SidebarContent onItemClick={handleCloseSidebar} />
      </Offcanvas>
    </>
  );
};

export default Navbar;
