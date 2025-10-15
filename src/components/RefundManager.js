import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { theme } from '../theme/theme';

const RefundManager = ({ order, onRefundUpdate }) => {
    const [refundStatus, setRefundStatus] = useState(order.refund?.status || 'pending');
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [refundDestination, setRefundDestination] = useState(order.refund?.destination || '');
    const [showDestinationForm, setShowDestinationForm] = useState(false);
    const [bankAccount, setBankAccount] = useState(order.refund?.bankAccount || '');
    const [upiId, setUpiId] = useState(order.refund?.upiId || '');
    const [walletType, setWalletType] = useState(order.refund?.walletType || '');

    useEffect(() => {
        if (refundStatus === 'refund_initiated' && !isTimerActive) {
            startRefundTimer();
        }
    }, [refundStatus]);

    const startRefundTimer = () => {
        setIsTimerActive(true);
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimerActive(false);
                    // Auto-progress to next status
                    progressRefundStatus();
                    return 120; // Reset timer
                }
                return prev - 1;
            });
        }, 1000);
    };

    const progressRefundStatus = () => {
        const statusFlow = ['refund_initiated', 'refund_processed'];
        const currentIndex = statusFlow.indexOf(refundStatus);
        
        if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            setRefundStatus(nextStatus);
            
            // Randomly decide if refund should fail (30% chance for testing)
            if (nextStatus === 'refund_processed') {
                setTimeout(() => {
                    const shouldFail = Math.random() < 0.3; // 30% chance of failure
                    const finalStatus = shouldFail ? 'refund_failed' : 'refunded';
                    setRefundStatus(finalStatus);
                    
                    // Update order with new refund status
                    if (onRefundUpdate) {
                        onRefundUpdate({
                            ...order.refund,
                            status: finalStatus,
                            processedAt: new Date().toISOString(),
                            failedReason: shouldFail ? 'Bank processing error' : null
                        });
                    }
                }, 2000); // Wait 2 seconds before final status
            }
        }
    };

    const initiateRefund = () => {
        const newRefund = {
            id: `refund-${Date.now()}`,
            orderId: order.id,
            amount: order.total,
            reason: 'Customer request',
            destination: refundDestination,
            bankAccount: refundDestination === 'bank_transfer' ? bankAccount : null,
            upiId: refundDestination === 'upi' ? upiId : null,
            walletType: refundDestination === 'wallet' ? walletType : null,
            status: 'refund_initiated',
            initiatedAt: new Date().toISOString(),
            processedAt: null,
            failedReason: null
        };
        
        setRefundStatus('refund_initiated');
        if (onRefundUpdate) {
            onRefundUpdate(newRefund);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'refund_initiated': return '#ffc107';
            case 'refund_processed': return '#17a2b8';
            case 'refunded': return '#28a745';
            case 'refund_failed': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusBackground = (status) => {
        switch (status) {
            case 'refund_initiated': return '#fff8e1';
            case 'refund_processed': return '#e3f2fd';
            case 'refunded': return '#e8f5e8';
            case 'refund_failed': return '#ffebee';
            default: return '#f5f5f5';
        }
    };

    const formatStatus = (status) => {
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!order) return null;

    return (
        <>
            {/* Refund Destination Form Modal */}
            {showDestinationForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2001,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <h3 style={{
                            margin: '0 0 1.5rem 0',
                            color: theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FaMoneyBillWave />
                            Refund Destination
                        </h3>
                        
                        <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
                            Please provide the details where you'd like to receive your refund:
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                color: theme.colors.text
                            }}>
                                Refund Method *
                            </label>
                            <select
                                value={refundDestination}
                                onChange={(e) => setRefundDestination(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Select refund method</option>
                                <option value="original_payment">Original Payment Method</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="upi">UPI Transfer</option>
                                <option value="wallet">Digital Wallet</option>
                            </select>
                        </div>

                        {refundDestination === 'bank_transfer' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold',
                                    color: theme.colors.text
                                }}>
                                    Bank Account Number *
                                </label>
                                <input
                                    type="text"
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    placeholder="Enter bank account number"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        )}

                        {refundDestination === 'upi' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold',
                                    color: theme.colors.text
                                }}>
                                    UPI ID *
                                </label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="Enter UPI ID (e.g., user@upi)"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        )}

                        {refundDestination === 'wallet' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold',
                                    color: theme.colors.text
                                }}>
                                    Wallet Type *
                                </label>
                                <select
                                    value={walletType}
                                    onChange={(e) => setWalletType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="">Select wallet type</option>
                                    <option value="paytm">Paytm</option>
                                    <option value="phonepe">PhonePe</option>
                                    <option value="gpay">Google Pay</option>
                                    <option value="amazonpay">Amazon Pay</option>
                                </select>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowDestinationForm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #ccc',
                                    background: 'white',
                                    color: '#6c757d',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (refundDestination) {
                                        setShowDestinationForm(false);
                                        initiateRefund();
                                    } else {
                                        alert('Please select a refund method.');
                                    }
                                }}
                                disabled={!refundDestination}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    background: refundDestination ? theme.colors.primary : '#ccc',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: refundDestination ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Proceed with Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Refund Manager */}
            <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '1rem'
            }}>
                <h3 style={{
                    margin: '0 0 1rem 0',
                    color: theme.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <FaMoneyBillWave />
                    Refund Management
                </h3>

                {/* Prevent duplicate refunds for already refunded orders */}
                {order.status === 'refunded' || refundStatus === 'refunded' ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem',
                        backgroundColor: '#d4edda',
                        borderRadius: '8px',
                        border: '2px solid #28a745'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: '#155724', marginBottom: '0.5rem' }}>Refund Already Completed</h3>
                        <p style={{ color: '#155724', marginBottom: 0 }}>
                            This order has already been refunded. You cannot initiate another refund for this order.
                        </p>
                    </div>
                ) : !refundStatus || refundStatus === 'pending' ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
                            No refund has been initiated for this order.
                        </p>
                        <button
                            onClick={() => setShowDestinationForm(true)}
                            disabled={order.status === 'refunded' || refundStatus === 'refunded'}
                            style={{
                                background: (order.status === 'refunded' || refundStatus === 'refunded') ? '#ccc' : theme.colors.primary,
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                cursor: (order.status === 'refunded' || refundStatus === 'refunded') ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Initiate Refund
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Current Status */}
                        <div style={{
                            background: getStatusBackground(refundStatus),
                            padding: '1rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            borderLeft: `4px solid ${getStatusColor(refundStatus)}`
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <strong>Status: {formatStatus(refundStatus)}</strong>
                                {refundStatus === 'refund_initiated' && isTimerActive && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#ffc107'
                                    }}>
                                        <FaClock />
                                        <span>{formatTime(timeRemaining)}</span>
                                    </div>
                                )}
                            </div>
                            
                            {refundStatus === 'refund_initiated' && (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                                    Refund has been initiated. Processing will begin automatically in {formatTime(timeRemaining)}.
                                </p>
                            )}
                            
                            {refundStatus === 'refund_processed' && (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c5460' }}>
                                    Refund is being processed by the bank. Final status will be determined shortly.
                                </p>
                            )}
                            
                            {refundStatus === 'refunded' && (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>
                                    ✅ Refund has been successfully processed and credited to your account.
                                </p>
                            )}
                            
                            {refundStatus === 'refund_failed' && (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#721c24' }}>
                                    ❌ Refund processing failed. Please contact support for assistance.
                                </p>
                            )}
                        </div>

                        {/* Refund Details */}
                        {order.refund && (
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Refund Details</h4>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div><strong>Amount:</strong> ₹{order.refund.amount?.toLocaleString() || order.total.toLocaleString()}</div>
                                    <div><strong>Reason:</strong> {order.refund.reason || 'Customer request'}</div>
                                    <div><strong>Destination:</strong> {order.refund.destination || 'Not specified'}</div>
                                    {order.refund.bankAccount && (
                                        <div><strong>Bank Account:</strong> {order.refund.bankAccount}</div>
                                    )}
                                    {order.refund.upiId && (
                                        <div><strong>UPI ID:</strong> {order.refund.upiId}</div>
                                    )}
                                    {order.refund.walletType && (
                                        <div><strong>Wallet:</strong> {order.refund.walletType}</div>
                                    )}
                                    <div><strong>Initiated:</strong> {new Date(order.refund.initiatedAt).toLocaleString()}</div>
                                    {order.refund.processedAt && (
                                        <div><strong>Processed:</strong> {new Date(order.refund.processedAt).toLocaleString()}</div>
                                    )}
                                    {order.refund.failedReason && (
                                        <div><strong>Failure Reason:</strong> {order.refund.failedReason}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Admin Actions for Failed Refunds */}
                        {refundStatus === 'refund_failed' && (
                            <div style={{
                                background: '#fff3cd',
                                padding: '1rem',
                                borderRadius: '4px',
                                marginTop: '1rem',
                                border: '1px solid #ffeaa7'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#856404' }}>
                                    <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                                    Admin Action Required
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                                    This refund has failed. Admin should investigate and take appropriate action:
                                </p>
                                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#856404' }}>
                                    <li>Check bank processing logs</li>
                                    <li>Verify account details</li>
                                    <li>Contact payment gateway support</li>
                                    <li>Initiate manual refund if needed</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default RefundManager; 