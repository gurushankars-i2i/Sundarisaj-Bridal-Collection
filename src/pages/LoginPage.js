import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const LoginPage = () => {
    const { login } = useAuthSystem();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Check for redirect message from checkout
    const checkoutMessage = location.state?.message;
    const fromCheckout = location.state?.from === 'checkout';

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                // Redirect based on user role and previous location
                if (result.user.role === 'admin') {
                    navigate('/admin');
                } else if (fromCheckout) {
                    navigate('/cart'); // Redirect to cart if coming from checkout
                } else {
                    navigate('/catalog');
                }
            } else {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: theme.colors.background,
    };

    const formContainerStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '3rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.accent}`,
        maxWidth: '500px',
        width: '100%',
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '2rem',
    };

    const titleStyle = {
        color: theme.colors.primary,
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    };

    const subtitleStyle = {
        color: theme.colors.textLight,
        fontSize: '1.1rem',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    };

    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    };

    const labelStyle = {
        fontWeight: 'bold',
        color: theme.colors.text,
        fontSize: '1rem',
    };

    const inputContainerStyle = {
        position: 'relative',
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1rem 1rem 3rem',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box',
    };

    const errorInputStyle = {
        ...inputStyle,
        borderColor: theme.colors.error,
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: theme.colors.textLight,
        zIndex: 1,
    };

    const passwordToggleStyle = {
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: theme.colors.textLight,
        zIndex: 1,
    };

    const errorStyle = {
        color: theme.colors.error,
        fontSize: '0.9rem',
        marginTop: '0.25rem',
    };

    const submitButtonStyle = {
        ...componentStyles.buttons.primary,
        padding: '1rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    };

    const demoAccountsStyle = {
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: theme.colors.light_gold,
        borderRadius: '8px',
        border: `1px solid ${theme.colors.accent}`,
    };

    const demoTitleStyle = {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: '1rem',
        textAlign: 'center',
    };

    const demoAccountStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
        borderBottom: `1px solid ${theme.colors.accent}`,
    };

    const demoAccountLabelStyle = {
        fontWeight: 'bold',
        color: theme.colors.text,
    };

    const demoAccountValueStyle = {
        color: theme.colors.textLight,
        fontSize: '0.9rem',
    };

    const signupLinkStyle = {
        textAlign: 'center',
        marginTop: '2rem',
        color: theme.colors.textLight,
    };

    const linkStyle = {
        color: theme.colors.primary,
        textDecoration: 'none',
        fontWeight: 'bold',
    };

    return (
        <div style={containerStyle}>
            <div style={formContainerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Sign In</h1>
                    <p style={subtitleStyle}>Welcome back to SundariSaj Bridal Collection</p>
                    
                    {/* Show checkout message if coming from checkout */}
                    {checkoutMessage && (
                        <div style={{
                            backgroundColor: theme.colors.warning + '20',
                            border: `1px solid ${theme.colors.warning}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            marginTop: '1rem',
                            color: theme.colors.warning,
                            fontSize: '0.9rem'
                        }}>
                            {checkoutMessage}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputContainerStyle}>
                            <FaEnvelope style={iconStyle} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={errors.email ? errorInputStyle : inputStyle}
                            />
                        </div>
                        {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Password</label>
                        <div style={inputContainerStyle}>
                            <FaLock style={iconStyle} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                style={errors.password ? errorInputStyle : inputStyle}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={passwordToggleStyle}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <div style={errorStyle}>{errors.password}</div>}
                    </div>

                    {errors.general && (
                        <div style={{ ...errorStyle, textAlign: 'center', padding: '1rem', backgroundColor: theme.colors.error + '20', borderRadius: '8px' }}>
                            {errors.general}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={submitButtonStyle}
                    >
                        {isLoading ? 'Signing In...' : (
                            <>
                                <FaUser />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div style={demoAccountsStyle}>
                    <h3 style={demoTitleStyle}>Demo Accounts</h3>
                    <div style={demoAccountStyle}>
                        <span style={demoAccountLabelStyle}>User Account:</span>
                        <span style={demoAccountValueStyle}>user@example.com / password123</span>
                    </div>
                    <div style={demoAccountStyle}>
                        <span style={demoAccountLabelStyle}>Admin Account:</span>
                        <span style={demoAccountValueStyle}>admin@example.com / admin123</span>
                    </div>
                    <div style={demoAccountStyle}>
                        <span style={demoAccountLabelStyle}>Staff Account:</span>
                        <span style={demoAccountValueStyle}>staff@example.com / staff123</span>
                    </div>
                    
                    <button 
                        onClick={() => {
                            localStorage.removeItem('ssbc-users');
                            localStorage.removeItem('ssbc-current-user');
                            window.location.reload();
                        }}
                        style={{
                            ...componentStyles.buttons.secondary,
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        🔄 Refresh Demo Users
                    </button>
                </div>

                <div style={signupLinkStyle}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={linkStyle}>
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 