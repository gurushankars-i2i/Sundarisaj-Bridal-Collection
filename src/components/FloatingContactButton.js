import React, { useState } from 'react';
import { theme } from '../theme/theme';
import { FaPhone, FaWhatsapp, FaEnvelope, FaTimes } from 'react-icons/fa';
import ContactUsModal from './ContactUsModal';

const FloatingContactButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const containerStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.8rem',
    };

    const mainButtonStyle = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: '0 4px 20px rgba(107, 15, 15, 0.4)',
        transition: 'all 0.3s ease',
        animation: 'pulse 2s infinite',
    };

    const actionButtonStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        animation: 'slideIn 0.3s ease',
    };

    const labelStyle = {
        backgroundColor: theme.colors.white,
        color: theme.colors.text,
        padding: '0.4rem 0.8rem',
        borderRadius: '5px',
        fontSize: '0.85rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        whiteSpace: 'nowrap',
        marginRight: '0.5rem',
        fontWeight: '500',
    };

    const handleWhatsApp = () => {
        const phoneNumber = '919876543210';
        const message = encodeURIComponent('Hello! I would like to inquire about your bridal jewelry collection.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const handlePhone = () => {
        window.location.href = 'tel:+919876543210';
    };

    const handleEmail = () => {
        window.location.href = 'mailto:admin@sundarisaj.com';
    };

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 4px 20px rgba(107, 15, 15, 0.4);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 6px 25px rgba(107, 15, 15, 0.6);
                    }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .floating-main-btn:hover {
                    transform: scale(1.1) rotate(10deg);
                }
                .floating-action-btn:hover {
                    transform: scale(1.1);
                }
                @media (max-width: 768px) {
                    .floating-contact-container {
                        bottom: 1rem !important;
                        right: 1rem !important;
                    }
                }
            `}</style>
            <div style={containerStyle} className="floating-contact-container">
                {isExpanded && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={labelStyle}>Contact Us</span>
                            <button
                                onClick={() => setShowContactModal(true)}
                                style={{
                                    ...actionButtonStyle,
                                    backgroundColor: theme.colors.info,
                                    color: theme.colors.white,
                                }}
                                className="floating-action-btn"
                                title="View all contact options"
                            >
                                <FaPhone />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={labelStyle}>WhatsApp</span>
                            <button
                                onClick={handleWhatsApp}
                                style={{
                                    ...actionButtonStyle,
                                    backgroundColor: '#25D366',
                                    color: theme.colors.white,
                                }}
                                className="floating-action-btn"
                                title="Chat on WhatsApp"
                            >
                                <FaWhatsapp />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={labelStyle}>Call Now</span>
                            <button
                                onClick={handlePhone}
                                style={{
                                    ...actionButtonStyle,
                                    backgroundColor: theme.colors.success,
                                    color: theme.colors.white,
                                }}
                                className="floating-action-btn"
                                title="Call us"
                            >
                                <FaPhone />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={labelStyle}>Email Us</span>
                            <button
                                onClick={handleEmail}
                                style={{
                                    ...actionButtonStyle,
                                    backgroundColor: theme.colors.secondary,
                                    color: theme.colors.white,
                                }}
                                className="floating-action-btn"
                                title="Send email"
                            >
                                <FaEnvelope />
                            </button>
                        </div>
                    </>
                )}
                
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={mainButtonStyle}
                    className="floating-main-btn"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.secondary;
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary;
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title={isExpanded ? 'Close' : 'Contact Us'}
                >
                    {isExpanded ? <FaTimes /> : <FaPhone />}
                </button>
            </div>
            
            <ContactUsModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </>
    );
};

export default FloatingContactButton;

