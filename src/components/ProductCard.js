import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import { FaFire, FaNewspaper } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const cardStyle = {
        background: theme.colors.white,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease-in-out',
        textDecoration: 'none',
        color: theme.colors.text,
        height: '100%',
        border: `1px solid ${theme.colors.accent}`,
        position: 'relative',
    };

    const imageContainerStyle = {
        position: 'relative',
        overflow: 'hidden',
    };

    const imageStyle = {
        width: '100%',
        height: '280px',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    };

    const badgeContainerStyle = {
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        zIndex: 2,
    };

    const badgeStyle = (type) => ({
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        color: 'white',
        backgroundColor: type === 'bestseller' ? theme.colors.error : 
                       type === 'new' ? theme.colors.success : theme.colors.warning,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    });

    const contentStyle = {
        padding: '1.5rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    };

    const categoryStyle = {
        fontSize: '0.8rem',
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '0.5rem',
    };

    const nameStyle = {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '0.5rem',
        minHeight: '50px',
        lineHeight: '1.3',
    };

    const descriptionStyle = {
        fontSize: '0.9rem',
        flexGrow: 1,
        marginBottom: '1rem',
        textAlign: 'justify',
        lineHeight: '1.5',
        color: theme.colors.textLight,
    };

    const priceContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    };

    const priceStyle = {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: theme.colors.secondary,
    };

    const stockStyle = {
        fontSize: '0.8rem',
        color: theme.colors.textLight,
        fontWeight: 'bold',
    };

    const buttonStyle = {
        backgroundColor: theme.colors.primary,
        color: 'white',
        padding: '1rem',
        border: 'none',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
        cursor: 'pointer',
        alignSelf: 'stretch',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
    };

    const handleMouseEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1.05)';
        }
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1)';
        }
    };

    return (
        <Link 
            to={`/product/${product.id}`} 
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={imageContainerStyle}>
                <img 
                    src={(product.images && product.images[0]) || product.image} 
                    alt={product.name} 
                    style={imageStyle} 
                />
                <div style={badgeContainerStyle}>
                    {product.isBestSeller && (
                        <div style={badgeStyle('bestseller')}>
                            <FaFire />
                            Best Seller
                        </div>
                    )}
                    {product.isNew && (
                        <div style={badgeStyle('new')}>
                            <FaNewspaper />
                            New
                        </div>
                    )}
                </div>
            </div>
            <div style={contentStyle}>
                <div>
                    <div style={categoryStyle}>{product.category}</div>
                    <h3 style={nameStyle}>{product.name}</h3>
                    <p style={descriptionStyle}>
                        {product.description.length > 100 
                            ? `${product.description.substring(0, 100)}...` 
                            : product.description
                        }
                    </p>
                </div>
                <div>
                    <div style={priceContainerStyle}>
                        <div style={priceStyle}>₹{product.price.toLocaleString()}</div>
                        <div style={stockStyle}>
                            {product.stock > 10 ? 'In Stock' : 
                             product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </div>
                    </div>
                    <div style={buttonStyle}>View Details</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard; 