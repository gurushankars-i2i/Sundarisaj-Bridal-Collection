import React from 'react';
import { theme } from '../theme/theme';
import { FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';

const ContactUsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease',
    };

    const modalStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        animation: 'slideIn 0.3s ease',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${theme.colors.accent}`,
    };

    const titleStyle = {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        margin: 0,
    };

    const closeButtonStyle = {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: theme.colors.textLight,
        transition: 'color 0.2s ease',
    };

    const sectionStyle = {
        marginBottom: '1.5rem',
    };

    const contactItemStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: theme.colors.background,
        borderRadius: '8px',
        marginBottom: '0.8rem',
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
    };

    const iconContainerStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
    };

    const contactInfoStyle = {
        flex: 1,
    };

    const contactLabelStyle = {
        fontSize: '0.85rem',
        color: theme.colors.textLight,
        marginBottom: '0.25rem',
    };

    const contactValueStyle = {
        fontSize: '1.05rem',
        fontWeight: '600',
        color: theme.colors.text,
        wordBreak: 'break-word',
    };

    const descriptionStyle = {
        fontSize: '0.95rem',
        color: theme.colors.textLight,
        lineHeight: '1.6',
        marginBottom: '1.5rem',
    };

    const whatsappButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        backgroundColor: '#25D366',
        color: theme.colors.white,
        border: 'none',
        padding: '0.8rem 1.5rem',
        borderRadius: '25px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        marginTop: '1rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = '919876543210'; // Replace with actual admin phone number
        const message = encodeURIComponent('Hello! I would like to inquire about your bridal jewelry collection.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const handlePhoneClick = () => {
        window.location.href = 'tel:+919876543210';
    };

    const handleEmailClick = () => {
        window.location.href = 'mailto:admin@sundarisaj.com';
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .contact-item:hover {
                    transform: translateX(5px);
                }
                .whatsapp-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 15px rgba(37, 211, 102, 0.4);
                }
            `}</style>
            <div style={overlayStyle} onClick={onClose}>
                <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={headerStyle}>
                        <h2 style={titleStyle}>📞 Contact Us</h2>
                        <button
                            onClick={onClose}
                            style={closeButtonStyle}
                            onMouseEnter={(e) => e.target.style.color = theme.colors.primary}
                            onMouseLeave={(e) => e.target.style.color = theme.colors.textLight}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <p style={descriptionStyle}>
                        We'd love to hear from you! Whether you have questions about our jewelry collection, 
                        need styling advice, or want to schedule a personalized consultation, our team is here to help.
                    </p>

                    <div style={sectionStyle}>
                        <div 
                            style={contactItemStyle} 
                            className="contact-item"
                            onClick={handlePhoneClick}
                        >
                            <div style={iconContainerStyle}>
                                <FaPhone />
                            </div>
                            <div style={contactInfoStyle}>
                                <div style={contactLabelStyle}>Phone</div>
                                <div style={contactValueStyle}>+91 98765 43210</div>
                            </div>
                        </div>

                        <div 
                            style={contactItemStyle} 
                            className="contact-item"
                            onClick={handleEmailClick}
                        >
                            <div style={iconContainerStyle}>
                                <FaEnvelope />
                            </div>
                            <div style={contactInfoStyle}>
                                <div style={contactLabelStyle}>Email</div>
                                <div style={contactValueStyle}>admin@sundarisaj.com</div>
                            </div>
                        </div>

                        <div style={contactItemStyle} className="contact-item">
                            <div style={iconContainerStyle}>
                                <FaMapMarkerAlt />
                            </div>
                            <div style={contactInfoStyle}>
                                <div style={contactLabelStyle}>Address</div>
                                <div style={contactValueStyle}>
                                    Sundarisaj Bridal Collection<br />
                                    123 Temple Street, T. Nagar<br />
                                    Chennai, Tamil Nadu - 600017<br />
                                    India
                                </div>
                            </div>
                        </div>

                        <div style={contactItemStyle} className="contact-item">
                            <div style={iconContainerStyle}>
                                <FaClock />
                            </div>
                            <div style={contactInfoStyle}>
                                <div style={contactLabelStyle}>Business Hours</div>
                                <div style={contactValueStyle}>
                                    Mon - Sat: 10:00 AM - 8:00 PM<br />
                                    Sunday: 11:00 AM - 6:00 PM
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleWhatsAppClick}
                        style={whatsappButtonStyle}
                        className="whatsapp-button"
                    >
                        <FaWhatsapp style={{ fontSize: '1.3rem' }} />
                        Chat with us on WhatsApp
                    </button>
                </div>
            </div>
        </>
    );
};

export default ContactUsModal;

