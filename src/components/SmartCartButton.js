import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { CartContext } from '../context/CartContext';
import { GuestCartContext } from '../context/GuestCartContext';
import { FaShoppingCart } from 'react-icons/fa';
import { theme } from '../theme/theme';

const SmartCartButton = () => {
    const { isAuthenticated } = useAuthSystem();
    const { getCartCount } = useContext(CartContext);
    const { getGuestCartCount } = useContext(GuestCartContext);

    const cartCount = isAuthenticated() ? getCartCount() : getGuestCartCount();
    const cartLink = isAuthenticated() ? '/cart' : '/login';
    
    // Debug logging for cart count synchronization
    if (process.env.NODE_ENV === 'development') {
        console.log('SmartCartButton - Auth:', isAuthenticated(), 'Count:', cartCount);
    }

    const cartButtonStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.5rem',
        textDecoration: 'none',
        color: theme.colors.text,
        fontSize: '0.9rem',
        fontWeight: 500,
        borderRadius: '5px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    };

    const cartCountStyle = {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    };

    const iconStyle = {
        fontSize: '1.1rem',
    };

    return (
        <Link to={cartLink} style={cartButtonStyle} title={isAuthenticated() ? 'Shopping Cart' : 'Sign in to view cart'}>
            <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <FaShoppingCart style={iconStyle} />
                {cartCount > 0 && (
                    <span style={cartCountStyle}>{cartCount}</span>
                )}
            </span>
        </Link>
    );
};

export default SmartCartButton; 