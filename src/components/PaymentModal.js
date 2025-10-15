import React, { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaTimes, FaQrcode, FaCheck, FaUpload, FaCopy } from 'react-icons/fa';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentComplete }) => {
    const { createPaymentRequest, submitPaymentProof } = usePayment();
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [step, setStep] = useState(1); // 1: QR Code, 2: Upload Proof, 3: Confirmation
    const [paymentProof, setPaymentProof] = useState({
        transactionId: '',
        screenshot: null,
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && orderData && !paymentRequest) {
            initializePayment();
        }
    }, [isOpen, orderData]);

    const initializePayment = async () => {
        try {
            setIsLoading(true);
            const request = await createPaymentRequest(orderData);
            setPaymentRequest(request);
        } catch (error) {
            console.error('Error creating payment request:', error);
            alert('Error creating payment request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyUPIUrl = () => {
        if (paymentRequest?.upiUrl) {
            navigator.clipboard.writeText(paymentRequest.upiUrl);
            alert('UPI URL copied to clipboard!');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setPaymentProof(prev => ({
                    ...prev,
                    screenshot: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProof = async () => {
        if (!paymentProof.transactionId.trim()) {
            alert('Please enter transaction ID');
            return;
        }

        if (!paymentProof.screenshot) {
            alert('Please upload payment screenshot');
            return;
        }

        try {
            setIsLoading(true);
            await submitPaymentProof(paymentRequest.id, paymentProof);
            setStep(3);
            
            // Show success message to user
            alert('✅ Payment proof submitted successfully! Your order is now pending admin approval. You will receive a confirmation once the payment is verified.');
            
            // Call onPaymentComplete after a short delay
            setTimeout(() => {
                onPaymentComplete(paymentRequest);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting payment proof:', error);
            alert('❌ Error submitting payment proof. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
    };

    const contentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: `2px solid ${theme.colors.accent}`
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: theme.colors.textLight,
        cursor: 'pointer',
        padding: '0.5rem'
    };

    const qrContainerStyle = {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: theme.colors.light_gold,
        borderRadius: '8px',
        marginBottom: '1.5rem'
    };

    const amountStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '1rem'
    };

    const instructionStyle = {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        lineHeight: '1.5'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '6px',
        fontSize: '1rem',
        marginBottom: '1rem'
    };

    const fileInputStyle = {
        display: 'none'
    };

    const fileButtonStyle = {
        ...componentStyles.buttons.secondary,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        cursor: 'pointer'
    };

    const successStyle = {
        textAlign: 'center',
        padding: '2rem',
        color: theme.colors.success || '#28a745'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, color: theme.colors.primary }}>
                        Complete Payment
                    </h2>
                    <button style={closeButtonStyle} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div>Processing...</div>
                    </div>
                )}

                {!isLoading && step === 1 && paymentRequest && (
                    <>
                        <div style={qrContainerStyle}>
                            <FaQrcode size={80} color={theme.colors.primary} />
                            <div style={amountStyle}>
                                ₹{paymentRequest.amount.toFixed(2)}
                            </div>
                            <p>Order ID: {paymentRequest.orderId}</p>
                        </div>

                        <div style={instructionStyle}>
                            <h4>Payment Instructions:</h4>
                            <ol>
                                <li>Open Google Pay or any UPI app</li>
                                <li>Scan the QR code above or use the UPI link below</li>
                                <li>Enter the exact amount: ₹{paymentRequest.amount.toFixed(2)}</li>
                                <li>Complete the payment</li>
                                <li>Take a screenshot of the payment confirmation</li>
                            </ol>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                UPI Payment Link:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={paymentRequest.upiUrl}
                                    readOnly
                                    style={{ ...inputStyle, marginBottom: 0, fontSize: '0.8rem' }}
                                />
                                <button
                                    onClick={copyUPIUrl}
                                    style={componentStyles.buttons.secondary}
                                >
                                    <FaCopy />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={onClose}
                                style={componentStyles.buttons.secondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                style={componentStyles.buttons.primary}
                            >
                                I've Made Payment
                            </button>
                        </div>
                    </>
                )}

                {!isLoading && step === 2 && (
                    <>
                        <h3 style={{ color: theme.colors.primary, marginBottom: '1.5rem' }}>
                            Upload Payment Proof
                        </h3>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Transaction ID *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter UPI Transaction ID"
                                value={paymentProof.transactionId}
                                onChange={(e) => setPaymentProof(prev => ({
                                    ...prev,
                                    transactionId: e.target.value
                                }))}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Payment Screenshot *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={fileInputStyle}
                                id="payment-screenshot"
                            />
                            <label htmlFor="payment-screenshot" style={fileButtonStyle}>
                                <FaUpload />
                                {paymentProof.screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
                            </label>
                            {paymentProof.screenshot && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <img
                                        src={paymentProof.screenshot}
                                        alt="Payment Screenshot"
                                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                placeholder="Any additional information..."
                                value={paymentProof.notes}
                                onChange={(e) => setPaymentProof(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={componentStyles.buttons.secondary}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitProof}
                                style={componentStyles.buttons.primary}
                                disabled={!paymentProof.transactionId.trim() || !paymentProof.screenshot}
                            >
                                Submit Proof
                            </button>
                        </div>
                    </>
                )}

                {!isLoading && step === 3 && (
                    <div style={successStyle}>
                        <FaCheck size={60} style={{ marginBottom: '1rem' }} />
                        <h3>🎉 Payment Submitted Successfully!</h3>
                        <p>✅ Your payment proof has been submitted for admin approval.</p>
                        <p>📧 You will receive a confirmation once the payment is verified.</p>
                        <p>📋 Order Status: <strong>Pending Payment Approval</strong></p>
                        <p style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                            Payment ID: {paymentRequest?.id}
                        </p>
                        <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            backgroundColor: '#e8f5e8', 
                            borderRadius: '6px',
                            border: '1px solid #4caf50'
                        }}>
                            <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
                                📱 Next Steps:
                            </p>
                            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                                <li>Admin will review your payment proof</li>
                                <li>You'll receive confirmation once approved</li>
                                <li>Order will proceed to processing</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;