import React from 'react';
import { Link } from 'react-router-dom';
import HomeCarousel from '../components/HomeCarousel';
import FeaturedCategories from '../components/FeaturedCategories';
import BestSellersCarousel from '../components/BestSellersCarousel';
import TestimonialsSection from '../components/TestimonialsSection';
import { theme } from '../theme/theme';
import { FaStar, FaShippingFast, FaUndo, FaCertificate, FaHeadset } from 'react-icons/fa';

const HomePage = () => {
    const features = [
        {
            icon: <FaShippingFast />,
            title: "Free Shipping",
            description: "On orders above ₹50,000"
        },
        {
            icon: <FaCertificate />,
            title: "Certified Quality",
            description: "100% authentic jewelry"
        },
        {
            icon: <FaUndo />,
            title: "Easy Returns",
            description: "7-day return policy"
        },
        {
            icon: <FaHeadset />,
            title: "24/7 Support",
            description: "Expert assistance anytime"
        }
    ];

    const containerStyle = {
        backgroundColor: theme.colors.background,
    };

    const heroSectionStyle = {
        position: 'relative',
        marginBottom: '3rem',
    };

    const featuresContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        padding: '3rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: theme.colors.white,
    };

    const featureCardStyle = {
        textAlign: 'center',
        padding: '1.5rem',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
    };

    const featureIconStyle = {
        fontSize: '3rem',
        color: theme.colors.primary,
        marginBottom: '1rem',
    };

    const featureTitleStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: '0.5rem',
    };

    const featureDescStyle = {
        fontSize: '0.9rem',
        color: theme.colors.textLight,
    };

    const sectionTitleStyle = {
        textAlign: 'center',
        fontSize: '2.5rem',
        color: theme.colors.primary,
        marginBottom: '1rem',
        fontWeight: 'bold',
    };

    const sectionSubtitleStyle = {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: theme.colors.textLight,
        marginBottom: '3rem',
        maxWidth: '600px',
        margin: '0 auto 3rem',
    };

    const sectionContainerStyle = {
        padding: '4rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    };

    const ctaSectionStyle = {
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
        padding: '4rem 2rem',
        textAlign: 'center',
        color: theme.colors.white,
        marginTop: '4rem',
    };

    const ctaTitleStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    };

    const ctaButtonStyle = {
        display: 'inline-block',
        padding: '1rem 3rem',
        backgroundColor: theme.colors.white,
        color: theme.colors.primary,
        textDecoration: 'none',
        borderRadius: '50px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        marginTop: '2rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    };

    return (
        <>
            <style>{`
                .feature-card:hover {
                    transform: translateY(-10px);
                }
                .cta-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                @media (max-width: 768px) {
                    .section-title {
                        font-size: 2rem !important;
                    }
                    .cta-title {
                        font-size: 1.8rem !important;
                    }
                }
            `}</style>
            <div style={containerStyle}>
                {/* Hero Section */}
                <div style={heroSectionStyle}>
                    <HomeCarousel />
                </div>

                {/* Features Section */}
                <div style={featuresContainerStyle}>
                    {features.map((feature, index) => (
                        <div key={index} style={featureCardStyle} className="feature-card">
                            <div style={featureIconStyle}>{feature.icon}</div>
                            <h3 style={featureTitleStyle}>{feature.title}</h3>
                            <p style={featureDescStyle}>{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Featured Categories Section */}
                <div style={sectionContainerStyle}>
                    <h2 style={sectionTitleStyle} className="section-title">
                        ✨ Explore Our Collections
                    </h2>
                    <p style={sectionSubtitleStyle}>
                        Discover exquisite jewelry crafted with tradition and elegance
                    </p>
                    <FeaturedCategories />
                </div>

                {/* Best Sellers Section */}
                <div style={{...sectionContainerStyle, backgroundColor: theme.colors.light_gold}}>
                    <h2 style={sectionTitleStyle} className="section-title">
                        <FaStar style={{color: theme.colors.accent, marginRight: '0.5rem'}} />
                        Trending Now
                    </h2>
                    <p style={sectionSubtitleStyle}>
                        Our most loved pieces by brides across India
                    </p>
                    <BestSellersCarousel />
                </div>

                {/* Testimonials Section */}
                <TestimonialsSection />

                {/* Call to Action Section */}
                <div style={ctaSectionStyle}>
                    <h2 style={ctaTitleStyle} className="cta-title">
                        Ready to Find Your Perfect Jewelry?
                    </h2>
                    <p style={{fontSize: '1.2rem', marginBottom: '1rem'}}>
                        Explore our complete collection or book a personalized consultation
                    </p>
                    <Link to="/catalog" style={ctaButtonStyle} className="cta-button">
                        Browse Full Collection →
                    </Link>
                </div>
            </div>
        </>
    );
};

export default HomePage; 