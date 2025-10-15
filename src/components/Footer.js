import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import { LanguageContext } from '../context/LanguageContext';
import { FaFacebook, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import ContactUsModal from './ContactUsModal';

const Footer = () => {
    const { t } = useContext(LanguageContext);
    const [showContactModal, setShowContactModal] = useState(false);

    // Main footer container
    const footerStyle = {
        backgroundColor: '#2d2d2d', // A darker, near-black for richness
        color: theme.colors.accent,
        padding: '3rem 2rem',
        borderTop: `4px solid ${theme.colors.primary}`,
    };

    // Grid layout for the columns
    const gridContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'left'
    };

    const columnStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    const titleStyle = {
        color: theme.colors.secondary,
        fontSize: '1.2rem',
        marginBottom: '1rem',
        fontWeight: 'bold',
    };

    const linkStyle = {
        color: theme.colors.accent,
        textDecoration: 'none',
        marginBottom: '0.75rem',
        transition: 'color 0.3s ease',
    };

    const socialIconsStyle = {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
    };
    
    const socialLinkStyle = { ...linkStyle, fontSize: '1.5rem' };

    const copyrightStyle = {
        textAlign: 'center',
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: `1px solid ${theme.colors.accent_dark}`,
        color: theme.colors.accent,
        fontSize: '0.9rem',
    };

    return (
        <footer style={footerStyle}>
            <div style={gridContainerStyle}>
                <div style={columnStyle}>
                    <h3 style={titleStyle}>{t('appName')}</h3>
                    <p style={{ color: theme.colors.accent, lineHeight: 1.6 }}>
                        {t('footerDescription')}
                    </p>
                </div>
                
                <div style={columnStyle}>
                    <h3 style={titleStyle}>{t('quickLinks')}</h3>
                    <Link to="/" style={linkStyle}>{t('home')}</Link>
                    <Link to="/catalog" style={linkStyle}>{t('allJewelry')}</Link>
                    <Link to="/dashboard" style={linkStyle}>{t('myAccount')}</Link>
                    <Link to="/cart" style={linkStyle}>{t('cart')}</Link>
                </div>

                <div style={columnStyle}>
                    <h3 style={titleStyle}>Contact Us</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: theme.colors.accent}}>
                        <FaPhone />
                        <a href="tel:+919876543210" style={linkStyle}>+91 98765 43210</a>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: theme.colors.accent}}>
                        <FaEnvelope />
                        <a href="mailto:admin@sundarisaj.com" style={linkStyle}>admin@sundarisaj.com</a>
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', color: theme.colors.accent}}>
                        <FaMapMarkerAlt style={{marginTop: '0.25rem'}} />
                        <span style={{color: theme.colors.accent, fontSize: '0.9rem'}}>
                            123 Temple Street<br />Chennai, TN 600017
                        </span>
                    </div>
                    <button
                        onClick={() => setShowContactModal(true)}
                        style={{
                            backgroundColor: theme.colors.primary,
                            color: theme.colors.white,
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            marginTop: '0.5rem',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.secondary}
                        onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
                    >
                        Get in Touch
                    </button>
                </div>

                <div style={columnStyle}>
                    <h3 style={titleStyle}>{t('followUs')}</h3>
                    <div style={socialIconsStyle}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle} title="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={socialLinkStyle} title="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={socialLinkStyle} title="WhatsApp">
                            <FaWhatsapp />
                        </a>
                    </div>
                    <div style={{marginTop: '1.5rem'}}>
                        <h4 style={{...titleStyle, fontSize: '1rem', marginBottom: '0.5rem'}}>{t('policies')}</h4>
                        <Link to="/rental-policy" style={linkStyle}>{t('rentalPolicy')}</Link>
                        <Link to="/privacy-policy" style={linkStyle}>{t('privacyPolicy')}</Link>
                        <Link to="/terms-conditions" style={linkStyle}>{t('termsConditions')}</Link>
                    </div>
                </div>
            </div>
            <div style={copyrightStyle}>
                {t('footerRights')}
            </div>
            
            {/* Contact Us Modal */}
            <ContactUsModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </footer>
    );
};

export default Footer; 