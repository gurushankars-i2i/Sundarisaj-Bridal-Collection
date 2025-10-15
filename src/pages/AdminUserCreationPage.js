import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaUserCog, FaEnvelope, FaLock, FaPhone, FaUser, FaEye, FaEyeSlash, FaSave, FaArrowLeft } from 'react-icons/fa';

const AdminUserCreationPage = () => {
    const { register } = useAuthSystem();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        role: 'user' // Default role
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

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
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
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                role: formData.role
            };

            const result = await register(userData);
            
            if (result.success) {
                alert(`User created successfully! Role: ${formData.role}`);
                navigate('/admin');
            } else {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: 'User creation failed. Please try again.' });
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

    const rowStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
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
        color: theme.colors.text,
        backgroundColor: theme.colors.white,
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

    const backButtonStyle = {
        ...componentStyles.buttons.secondary,
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
    };

    return (
        <div style={containerStyle}>
            <div style={formContainerStyle}>
                <button
                    onClick={() => navigate('/admin')}
                    style={backButtonStyle}
                >
                    <FaArrowLeft />
                    Back to Admin Dashboard
                </button>

                <div style={headerStyle}>
                    <h1 style={titleStyle}>Create User</h1>
                    <p style={subtitleStyle}>Create a new user account with specific role</p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>First Name</label>
                            <div style={inputContainerStyle}>
                                <FaUser style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    style={errors.firstName ? errorInputStyle : inputStyle}
                                />
                            </div>
                            {errors.firstName && <div style={errorStyle}>{errors.firstName}</div>}
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Last Name</label>
                            <div style={inputContainerStyle}>
                                <FaUser style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    style={errors.lastName ? errorInputStyle : inputStyle}
                                />
                            </div>
                            {errors.lastName && <div style={errorStyle}>{errors.lastName}</div>}
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputContainerStyle}>
                            <FaEnvelope style={iconStyle} />
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={errors.email ? errorInputStyle : inputStyle}
                            />
                        </div>
                        {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>

                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Password</label>
                            <div style={inputContainerStyle}>
                                <FaLock style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
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
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={inputContainerStyle}>
                                <FaLock style={iconStyle} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm password"
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

                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Phone Number</label>
                            <div style={inputContainerStyle}>
                                <FaPhone style={iconStyle} />
                                <input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    style={errors.phone ? errorInputStyle : inputStyle}
                                />
                            </div>
                            {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Date of Birth</label>
                            <div style={inputContainerStyle}>
                                <FaUser style={iconStyle} />
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    style={errors.dateOfBirth ? errorInputStyle : inputStyle}
                                />
                            </div>
                            {errors.dateOfBirth && <div style={errorStyle}>{errors.dateOfBirth}</div>}
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>User Role</label>
                        <div style={inputContainerStyle}>
                            <FaUserCog style={iconStyle} />
                            <select
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                style={inputStyle}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
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
                        {isLoading ? 'Creating User...' : (
                            <>
                                <FaSave />
                                Create User
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminUserCreationPage; 