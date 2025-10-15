import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';

import { LanguageContext } from '../context/LanguageContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { ProductContext } from '../context/ProductContext';
import { NotificationContext } from '../context/NotificationContext';
import { FaUserCircle, FaUserCog, FaSearch, FaBell, FaSignOutAlt, FaChevronDown, FaPhoneAlt } from 'react-icons/fa';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import SmartCartButton from './SmartCartButton';
import UserNotifications from './UserNotifications';
import ContactUsModal from './ContactUsModal';

const HEADER_FONT = theme.fonts.main;
const HEADER_TEXT_COLOR = theme.colors.text;
const HEADER_BG = theme.colors.background;
const HEADER_ACCENT = theme.colors.secondary;

const Header = ({ userRole, setMenuVisible, onToggleMenu, isMenuVisible }) => {
  // Cart count is now handled by SmartCartButton component
  const { toggleLanguage, t } = useContext(LanguageContext);
  const { increaseFontSize, decreaseFontSize } = useContext(AccessibilityContext);
  const { products } = useContext(ProductContext);
  const { user, logout, isAuthenticated } = useAuthSystem();
  const { notifications, markAsRead, getUnreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchContainerRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const unreadCount = getUnreadCount();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const results = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef, userMenuRef]);

  const headerStyle = {
    backgroundColor: HEADER_BG,
    color: HEADER_TEXT_COLOR,
    fontFamily: HEADER_FONT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '80px',
    minHeight: '80px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1100,
    borderBottom: `1px solid #eee`,
    gap: 0
  };

  const logoStyle = {
    fontFamily: HEADER_FONT,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: HEADER_ACCENT,
    flex: '0 0 auto',
    marginRight: '2rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textDecoration: 'none',
    lineHeight: 1,
  };

  const searchContainerStyle = {
    position: 'relative',
    flex: '1 1 auto',
    maxWidth: '500px',
    margin: '0 2rem',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.5rem',
    border: `2px solid ${theme.colors.accent}`,
    borderRadius: '25px',
    fontSize: '1rem',
    backgroundColor: theme.colors.white,
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.textLight,
    fontSize: '1rem',
  };

  const searchResultsStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto',
    marginTop: '0.5rem',
  };

  const searchResultItemStyle = {
    display: 'block',
    padding: '0.8rem 1rem',
    textDecoration: 'none',
    color: theme.colors.text,
    borderBottom: `1px solid ${theme.colors.accent}`,
    transition: 'background-color 0.2s ease',
  };

  const navBarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flex: '0 0 auto',
  };

  const linkStyleUnified = {
    textDecoration: 'none',
    color: HEADER_TEXT_COLOR,
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  };

  const iconStyle = {
    fontSize: '1.1rem',
  };



  const notificationIconContainerStyle = {
    position: 'relative',
    cursor: 'pointer',
    padding: '0.5rem',
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: theme.colors.error,
    color: theme.colors.white,
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  const notificationDropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '250px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
  };

  const notificationItemStyle = (isRead) => ({
    padding: '0.8rem',
    borderBottom: `1px solid ${theme.colors.accent}`,
    cursor: 'pointer',
    backgroundColor: isRead ? theme.colors.white : theme.colors.light_gold,
    transition: 'background-color 0.2s ease',
  });

  const langSwitcherStyle = {
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  };

  const userMenuContainerStyle = {
    position: 'relative',
    cursor: 'pointer',
  };

  const userMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '200px',
    zIndex: 1200,
    marginTop: '0.5rem',
  };

  const userMenuItemStyle = {
    padding: '0.8rem 1rem',
    borderBottom: `1px solid ${theme.colors.accent}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const userMenuHeaderStyle = {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.accent}`,
    backgroundColor: theme.colors.light_gold,
    fontWeight: 'bold',
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .ssbc-header-nav {
            gap: 0.5rem !important;
          }
          .ssbc-header-nav > * {
            font-size: 0.92rem !important;
            padding: 0 !important;
          }
          .ssbc-header-logo {
            font-size: 1.1rem !important;
            margin-right: 0.5rem !important;
          }
          .ssbc-header-search {
            margin: 0 0.5rem !important;
            min-width: 100px !important;
            max-width: 180px !important;
          }
        }
      `}</style>
      <header style={headerStyle}>
        <div style={logoStyle} className="ssbc-header-logo">
          <Link to="/" style={{...logoStyle, textDecoration: 'none'}}>{t('appName')}</Link>
        </div>
        
        <div style={{flex: 1}}></div>
        
        <nav style={navBarStyle} className="ssbc-header-nav">
          {/* Accessibility Controls */}
          <span style={linkStyleUnified} onClick={decreaseFontSize} title="Decrease font size">A-</span>
          <span style={linkStyleUnified} onClick={increaseFontSize} title="Increase font size">A+</span>
          
          {/* Language Switcher */}
          <span onClick={toggleLanguage} style={{...langSwitcherStyle, fontFamily: HEADER_FONT, color: HEADER_TEXT_COLOR, fontWeight: 500}} title="Toggle language">
            {t('langSwitch')}
          </span>
          
          {/* Contact Us Button */}
          <span 
            style={linkStyleUnified} 
            onClick={() => setShowContactModal(true)} 
            title="Contact Us"
          >
            <FaPhoneAlt style={iconStyle} />
          </span>
          
          {/* Smart Cart Button - Shows guest cart for unauthenticated users, user cart for authenticated users */}
          <SmartCartButton />
          
          {/* Notifications - Only show for authenticated users */}
          {isAuthenticated() && (
            <UserNotifications userEmail={user?.email} />
          )}
          
          {/* User Menu */}
          {isAuthenticated() ? (
            <div style={userMenuContainerStyle} ref={userMenuRef}>
              <div style={linkStyleUnified} onClick={handleUserMenuToggle} title="User menu">
                <FaUserCircle style={iconStyle} />
                <span>{user?.name || user?.email}</span>
                <FaChevronDown style={{fontSize: '0.8rem'}} />
              </div>
              {showUserMenu && (
                <div style={userMenuStyle}>
                  <div style={userMenuHeaderStyle}>
                    {user?.name || user?.email}
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" style={userMenuItemStyle} onClick={() => setShowUserMenu(false)}>
                      <FaUserCog style={iconStyle} />
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'user' && (
                    <>
                      <Link to="/dashboard" style={userMenuItemStyle} onClick={() => setShowUserMenu(false)}>
                        <FaUserCircle style={iconStyle} />
                        My Dashboard
                      </Link>
                      <Link to="/cart" style={userMenuItemStyle} onClick={() => setShowUserMenu(false)}>
                        <FaUserCircle style={iconStyle} />
                        Shopping Cart
                      </Link>
                    </>
                  )}

                  <div style={userMenuItemStyle} onClick={handleLogout}>
                    <FaSignOutAlt style={iconStyle} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={linkStyleUnified}>Login</Link>
          )}
        </nav>
      </header>
      
      {/* Contact Us Modal */}
      <ContactUsModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </>
  );
};

export default Header; 