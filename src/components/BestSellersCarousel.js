import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import { theme } from '../theme/theme';
import ProductCard from './ProductCard';
import { FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const BestSellersCarousel = () => {
    const { products } = useContext(ProductContext);
    const bestSellers = products.filter(p => p.isBestSeller);

    const containerStyle = {
        marginBottom: '3rem',
        position: 'relative',
    };

    const headerStyle = {
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    };

    const carouselContainerStyle = {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: theme.colors.white,
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const carouselTrackStyle = {
        display: 'flex',
        gap: '1.5rem',
        transition: 'transform 0.3s ease',
        padding: '0.5rem',
    };

    const productCardStyle = {
        minWidth: '280px',
        flexShrink: 0,
    };

    const navButtonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: theme.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
    };

    const leftButtonStyle = {
        ...navButtonStyle,
        left: '10px',
    };

    const rightButtonStyle = {
        ...navButtonStyle,
        right: '10px',
    };

    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextSlide = () => {
        setCurrentIndex(prev => 
            prev + 3 >= bestSellers.length ? 0 : prev + 3
        );
    };

    const prevSlide = () => {
        setCurrentIndex(prev => 
            prev - 3 < 0 ? Math.max(0, bestSellers.length - 3) : prev - 3
        );
    };

    const visibleProducts = bestSellers.slice(currentIndex, currentIndex + 3);

    if (bestSellers.length === 0) {
        return null;
    }

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}>
                <FaFire style={{ color: theme.colors.error }} />
                Best Sellers
            </h2>
            
            <div style={carouselContainerStyle}>
                {bestSellers.length > 3 && (
                    <>
                        <button 
                            style={leftButtonStyle}
                            onClick={prevSlide}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = theme.colors.accent_dark;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = theme.colors.primary;
                            }}
                        >
                            <FaChevronLeft />
                        </button>
                        <button 
                            style={rightButtonStyle}
                            onClick={nextSlide}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = theme.colors.accent_dark;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = theme.colors.primary;
                            }}
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}
                
                <div style={carouselTrackStyle}>
                    {visibleProducts.map(product => (
                        <div key={product.id} style={productCardStyle}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
                
                {bestSellers.length > 3 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '1rem'
                    }}>
                        {Array.from({ length: Math.ceil(bestSellers.length / 3) }, (_, i) => (
                            <button
                                key={i}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: i === Math.floor(currentIndex / 3) 
                                        ? theme.colors.primary 
                                        : theme.colors.accent,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onClick={() => setCurrentIndex(i * 3)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BestSellersCarousel; 