import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorageAuth } from '../context/LocalStorageAuthContext';
import { CartContext } from '../context/CartContext';
import { GuestCartContext } from '../context/GuestCartContext';
import { FaLock, FaUserPlus, FaSignInAlt, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { theme } from '../theme/theme';

const CheckoutFlow = ({ onProceedToCheckout }) => {
    const { isAuthenticated, user } = useLocalStorageAuth();
    const { getCartCount, getCartTotal } = useContext(CartContext);
    const { getGuestCartCount, getGuestCartTotal } = useContext(GuestCartContext);
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const cartCount = isAuthenticated() ? getCartCount() : getGuestCartCount();
    const cartTotal = isAuthenticated() ? getCartTotal() : getGuestCartTotal();

    const containerStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.accent}`,
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '2rem',
    };

    const titleStyle = {
        color: theme.colors.primary,
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    };

    const subtitleStyle = {
        color: theme.colors.textLight,
        fontSize: '1.1rem',
    };

    const cartSummaryStyle = {
        backgroundColor: theme.colors.light_gold,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: `1px solid ${theme.colors.accent}`,
    };

    const summaryRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    };

    const totalStyle = {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        borderTop: `2px solid ${theme.colors.accent}`,
        paddingTop: '1rem',
        marginTop: '1rem',
    };

    const buttonContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    };

    const buttonStyle = {
        padding: '1rem',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
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

    const warningButtonStyle = {
        ...buttonStyle,
        backgroundColor: theme.colors.warning,
        color: theme.colors.white,
    };

    const handleProceedToCheckout = () => {
        if (isAuthenticated()) {
            if (onProceedToCheckout) {
                onProceedToCheckout();
            } else {
                navigate('/checkout');
            }
        } else {
            // Guest user - redirect to login with cart preservation
            navigate('/login', { 
                state: { 
                    from: 'checkout',
                    message: 'Please sign in or create an account to complete your purchase'
                }
            });
        }
    };

    const handleCreateAccount = () => {
        navigate('/signup', { 
            state: { 
                from: 'checkout',
                message: 'Create an account to save your cart and complete your purchase'
            }
        });
    };

    const handleSignIn = () => {
        navigate('/login', { 
            state: { 
                from: 'checkout',
                message: 'Sign in to access your saved cart and complete your purchase'
            }
        });
    };

    if (cartCount === 0) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <FaShoppingCart style={{ fontSize: '3rem', color: theme.colors.textLight, marginBottom: '1rem' }} />
                    <h2 style={titleStyle}>Your Cart is Empty</h2>
                    <p style={subtitleStyle}>Add some beautiful bridal jewelry to get started!</p>
                </div>
                <button 
                    style={primaryButtonStyle}
                    onClick={() => navigate('/catalog')}
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <FaCreditCard style={{ fontSize: '3rem', color: theme.colors.primary, marginBottom: '1rem' }} />
                <h2 style={titleStyle}>Checkout</h2>
                <p style={subtitleStyle}>
                    {isAuthenticated() 
                        ? `Complete your purchase, ${user?.name || 'User'}!` 
                        : 'Sign in or create an account to complete your purchase'
                    }
                </p>
            </div>

            {/* Cart Summary */}
            <div style={cartSummaryStyle}>
                <h3 style={{ marginBottom: '1rem', color: theme.colors.text }}>Order Summary</h3>
                <div style={summaryRowStyle}>
                    <span>Items in Cart:</span>
                    <span>{cartCount}</span>
                </div>
                <div style={summaryRowStyle}>
                    <span>Subtotal:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div style={summaryRowStyle}>
                    <span>Shipping:</span>
                    <span>Free</span>
                </div>
                <div style={summaryRowStyle} style={totalStyle}>
                    <span>Total:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={buttonContainerStyle}>
                {isAuthenticated() ? (
                    // Authenticated user - proceed to checkout
                    <button 
                        style={primaryButtonStyle}
                        onClick={handleProceedToCheckout}
                        disabled={isProcessing}
                    >
                        <FaCreditCard />
                        {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                ) : (
                    // Guest user - show authentication options
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <FaLock style={{ color: theme.colors.warning, marginRight: '0.5rem' }} />
                            <span style={{ color: theme.colors.textLight }}>
                                Authentication required to complete purchase
                            </span>
                        </div>
                        
                        <button 
                            style={primaryButtonStyle}
                            onClick={handleSignIn}
                        >
                            <FaSignInAlt />
                            Sign In to Continue
                        </button>
                        
                        <button 
                            style={secondaryButtonStyle}
                            onClick={handleCreateAccount}
                        >
                            <FaUserPlus />
                            Create New Account
                        </button>
                        
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <small style={{ color: theme.colors.textLight }}>
                                Your cart items will be saved and transferred to your account
                            </small>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutFlow; 