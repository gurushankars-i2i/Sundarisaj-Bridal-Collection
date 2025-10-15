import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendar, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupPage = () => {
    const { register } = useAuthSystem();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }



        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.zipCode.trim()) {
            newErrors.zipCode = 'ZIP code is required';
        } else if (!/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                streetAddress: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            if (success) {
                alert('Account created successfully! Welcome to SundariSaj Bridal Collection.');
                navigate('/catalog');
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred during registration. Please try again.');
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
        maxWidth: '600px',
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

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    };

    const fullWidthStyle = {
        gridColumn: '1 / -1',
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

    const loginLinkStyle = {
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
                    <h1 style={titleStyle}>Create Account</h1>
                    <p style={subtitleStyle}>Join SundariSaj Bridal Collection</p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    {/* Personal Information */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Full Name *</label>
                        <div style={inputContainerStyle}>
                            <FaUser style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                style={errors.name ? errorInputStyle : inputStyle}
                            />
                        </div>
                        {errors.name && <div style={errorStyle}>{errors.name}</div>}
                    </div>

                    <div style={gridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Email Address *</label>
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
                            <label style={labelStyle}>Phone Number *</label>
                            <div style={inputContainerStyle}>
                                <FaPhone style={iconStyle} />
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    style={errors.phone ? errorInputStyle : inputStyle}
                                />
                            </div>
                            {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                        </div>
                    </div>

                    <div style={gridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Password *</label>
                            <div style={inputContainerStyle}>
                                <FaLock style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
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

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Confirm Password *</label>
                            <div style={inputContainerStyle}>
                                <FaLock style={iconStyle} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    style={errors.confirmPassword ? errorInputStyle : inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={passwordToggleStyle}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
                        </div>
                    </div>



                    {/* Address Information */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Street Address *</label>
                        <div style={inputContainerStyle}>
                            <FaMapMarkerAlt style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Enter your street address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                style={errors.address ? errorInputStyle : inputStyle}
                            />
                        </div>
                        {errors.address && <div style={errorStyle}>{errors.address}</div>}
                    </div>

                    <div style={gridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>City *</label>
                            <input
                                type="text"
                                placeholder="Enter your city"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                style={errors.city ? errorInputStyle : inputStyle}
                            />
                            {errors.city && <div style={errorStyle}>{errors.city}</div>}
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>State *</label>
                            <input
                                type="text"
                                placeholder="Enter your state"
                                value={formData.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                                style={errors.state ? errorInputStyle : inputStyle}
                            />
                            {errors.state && <div style={errorStyle}>{errors.state}</div>}
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>ZIP Code *</label>
                        <input
                            type="text"
                            placeholder="Enter your ZIP code"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            style={errors.zipCode ? errorInputStyle : inputStyle}
                        />
                        {errors.zipCode && <div style={errorStyle}>{errors.zipCode}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={submitButtonStyle}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={loginLinkStyle}>
                    Already have an account?{' '}
                    <Link to="/login" style={linkStyle}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage; 