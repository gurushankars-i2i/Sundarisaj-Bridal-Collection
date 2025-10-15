import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { theme } from '../theme/theme';
import sharedDataService from '../services/sharedDataService';

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = () => {
        // Get approved reviews with 4+ stars
        const allReviews = sharedDataService.getAllReviews();
        const topReviews = allReviews
            .filter(review => review.status === 'approved' && review.rating >= 4)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10); // Get top 10 testimonials
        setTestimonials(topReviews);
    };

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                        key={star}
                        style={{
                            color: star <= rating ? '#ffc107' : '#e0e0e0',
                            fontSize: '1.2rem'
                        }}
                    />
                ))}
            </div>
        );
    };

    if (testimonials.length === 0) {
        return null; // Don't show section if no testimonials
    }

    const currentTestimonial = testimonials[currentIndex];

    const sectionStyle = {
        padding: '4rem 2rem',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        color: theme.colors.primary,
        marginBottom: '1rem',
        fontWeight: 'bold'
    };

    const subtitleStyle = {
        fontSize: '1.2rem',
        color: theme.colors.textLight,
        marginBottom: '3rem'
    };

    const testimonialCardStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '3rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative'
    };

    const quoteIconStyle = {
        fontSize: '3rem',
        color: theme.colors.light_gold,
        marginBottom: '1rem'
    };

    const commentStyle = {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: theme.colors.text,
        marginBottom: '2rem',
        fontStyle: 'italic'
    };

    const customerInfoStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    };

    const customerNameStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: theme.colors.primary
    };

    const productNameStyle = {
        fontSize: '0.9rem',
        color: theme.colors.textLight
    };

    const verifiedBadgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    };

    const navigationStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        marginTop: '2rem'
    };

    const navButtonStyle = {
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    };

    const dotsContainerStyle = {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center'
    };

    const dotStyle = (isActive) => ({
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: isActive ? theme.colors.primary : '#ccc',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    });

    const imageGalleryStyle = {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        marginTop: '1.5rem',
        flexWrap: 'wrap'
    };

    const thumbnailStyle = {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        border: `2px solid ${theme.colors.accent}`
    };

    return (
        <section style={sectionStyle}>
            <div style={containerStyle}>
                <h2 style={titleStyle}>What Our Customers Say</h2>
                <p style={subtitleStyle}>
                    Real experiences from our valued customers
                </p>

                <div style={testimonialCardStyle} className="animate-fade-in">
                    <FaQuoteLeft style={quoteIconStyle} />
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        {renderStars(currentTestimonial.rating)}
                    </div>

                    <p style={commentStyle}>"{currentTestimonial.comment}"</p>

                    {/* Customer Image Gallery */}
                    {currentTestimonial.images && currentTestimonial.images.length > 0 && (
                        <div style={imageGalleryStyle}>
                            {currentTestimonial.images.slice(0, 4).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Customer photo ${idx + 1}`}
                                    style={thumbnailStyle}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>
                    )}

                    <div style={customerInfoStyle}>
                        <div style={customerNameStyle}>{currentTestimonial.userName}</div>
                        <div style={productNameStyle}>Purchased: {currentTestimonial.productName}</div>
                        {currentTestimonial.isVerifiedPurchase && (
                            <div style={verifiedBadgeStyle}>
                                ✓ Verified Purchase
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                {testimonials.length > 1 && (
                    <div style={navigationStyle}>
                        <button
                            style={navButtonStyle}
                            onClick={prevTestimonial}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.secondary}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
                            aria-label="Previous testimonial"
                        >
                            <FaChevronLeft />
                        </button>

                        <div style={dotsContainerStyle}>
                            {testimonials.map((_, idx) => (
                                <div
                                    key={idx}
                                    style={dotStyle(idx === currentIndex)}
                                    onClick={() => setCurrentIndex(idx)}
                                />
                            ))}
                        </div>

                        <button
                            style={navButtonStyle}
                            onClick={nextTestimonial}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.secondary}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
                            aria-label="Next testimonial"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;

