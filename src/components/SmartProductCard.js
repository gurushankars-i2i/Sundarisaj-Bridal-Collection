import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { CartContext } from '../context/CartContext';
import { GuestCartContext } from '../context/GuestCartContext';
import { theme } from '../theme/theme';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { useState } from 'react';

const SmartProductCard = ({ product }) => {
    const { isAuthenticated } = useAuthSystem();
    const { addToCart } = useContext(CartContext);
    const { addToGuestCart } = useContext(GuestCartContext);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = async (purchaseType = 'sale', rentalDays = 1) => {
        setIsAddingToCart(true);
        
        try {
            if (isAuthenticated()) {
                addToCart(product, 1, purchaseType, rentalDays);
            } else {
                addToGuestCart(product, 1, purchaseType, rentalDays);
            }
            
            // Show success message or notification
            setTimeout(() => setIsAddingToCart(false), 1000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsAddingToCart(false);
        }
    };

    const cardStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.accent}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
    };

    const imageStyle = {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '1rem',
    };

    const titleStyle = {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: '0.5rem',
        lineHeight: 1.3,
    };

    const priceStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '0.5rem',
    };

    const rentalPriceStyle = {
        fontSize: '0.9rem',
        color: theme.colors.textLight,
        marginBottom: '0.5rem',
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    };

    const buttonStyle = {
        flex: 1,
        padding: '0.5rem',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.3rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: theme.colors.accent,
        color: theme.colors.text,
    };

    const badgeStyle = {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: theme.colors.white,
    };

    const newBadgeStyle = {
        ...badgeStyle,
        backgroundColor: theme.colors.success,
    };

    const bestSellerBadgeStyle = {
        ...badgeStyle,
        backgroundColor: theme.colors.warning,
    };

    const stockStyle = {
        fontSize: '0.8rem',
        color: theme.colors.textLight,
        marginBottom: '0.5rem',
    };

    return (
        <div style={cardStyle} className="product-card">
            {/* Badges */}
            {product.isNew && (
                <div style={newBadgeStyle}>NEW</div>
            )}
            {product.isBestSeller && (
                <div style={bestSellerBadgeStyle}>BEST SELLER</div>
            )}

            {/* Product Image */}
            <img 
                src={product.image} 
                alt={product.name} 
                style={imageStyle}
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                }}
            />

            {/* Product Info */}
            <h3 style={titleStyle}>{product.name}</h3>
            
            <div style={stockStyle}>
                Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </div>

            {/* Pricing */}
            <div style={priceStyle}>
                ₹{product.price.toLocaleString()}
            </div>
            
            {product.isForRent && (
                <div style={rentalPriceStyle}>
                    Rent: ₹{product.rentalPricePerDay.toLocaleString()}/day
                </div>
            )}

            {/* Action Buttons */}
            <div style={buttonContainerStyle}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                    <button style={secondaryButtonStyle}>
                        <FaEye />
                        View
                    </button>
                </Link>
                
                {product.stock > 0 && (
                    <button 
                        style={primaryButtonStyle}
                        onClick={() => handleAddToCart('sale')}
                        disabled={isAddingToCart}
                    >
                        <FaShoppingCart />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                )}
            </div>

            {/* Rental Button if Available */}
            {product.isForRent && product.stock > 0 && (
                <button 
                    style={{
                        ...buttonStyle,
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.white,
                        marginTop: '0.5rem',
                        width: '100%'
                    }}
                    onClick={() => handleAddToCart('rent', 1)}
                    disabled={isAddingToCart}
                >
                    <FaHeart />
                    Rent Now
                </button>
            )}
        </div>
    );
};

export default SmartProductCard; 