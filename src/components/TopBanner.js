import React, { useState, useEffect } from 'react';
import { theme } from '../theme/theme';
import { FaTimes, FaTruck, FaPhone, FaTag } from 'react-icons/fa';

const TopBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const announcements = [
        {
            icon: <FaTag />,
            text: "✨ New Collection Launch! Get 20% OFF on Temple Jewelry",
            color: theme.colors.primary
        },
        {
            icon: <FaTruck />,
            text: "🚚 Free Shipping on Orders Above ₹50,000",
            color: theme.colors.success
        },
        {
            icon: <FaPhone />,
            text: "📞 Book Your Personalized Consultation Today!",
            color: theme.colors.info
        }
    ];

    // Auto-rotate announcements
    useEffect(() => {
        if (isVisible) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % announcements.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [isVisible, announcements.length]);

    if (!isVisible) return null;

    const bannerStyle = {
        backgroundColor: announcements[currentSlide].color,
        color: theme.colors.white,
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.95rem',
        fontWeight: '500',
        position: 'relative',
        transition: 'all 0.3s ease',
        zIndex: 1200,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const contentStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'fadeIn 0.5s ease-in',
    };

    const closeButtonStyle = {
        position: 'absolute',
        right: '1rem',
        background: 'transparent',
        border: 'none',
        color: theme.colors.white,
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.25rem',
        opacity: 0.8,
        transition: 'opacity 0.2s ease',
    };

    const indicatorContainerStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginLeft: '1rem',
    };

    const indicatorStyle = (isActive) => ({
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: isActive ? theme.colors.white : 'rgba(255,255,255,0.4)',
        transition: 'all 0.3s ease',
    });

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @media (max-width: 768px) {
                    .top-banner-text {
                        font-size: 0.85rem !important;
                    }
                }
            `}</style>
            <div style={bannerStyle}>
                <div style={contentStyle}>
                    <span style={{ fontSize: '1.1rem' }}>{announcements[currentSlide].icon}</span>
                    <span className="top-banner-text">{announcements[currentSlide].text}</span>
                    <div style={indicatorContainerStyle}>
                        {announcements.map((_, index) => (
                            <div key={index} style={indicatorStyle(index === currentSlide)} />
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                    title="Close"
                >
                    <FaTimes />
                </button>
            </div>
        </>
    );
};

export default TopBanner;

