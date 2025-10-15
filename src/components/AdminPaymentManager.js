import React, { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import sharedDataService from '../services/sharedDataService';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaCheck, FaTimes, FaEye, FaRupeeSign, FaClock, FaUser, FaCalendar, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress } from 'react-icons/fa';

const AdminPaymentManager = () => {
    const { user, hasRole } = useAuthSystem();
    const { 
        getPendingPayments, 
        approvePayment, 
        rejectPayment, 
        getPaymentStatistics,
        getPaymentById 
    } = usePayment();
    
    const [pendingPayments, setPendingPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (hasRole('admin')) {
            loadPayments();
            loadStatistics();
            
            // Make payment proof verification available globally
            window.showPaymentProofForOrder = showPaymentProofForOrder;
        }
        
        return () => {
            // Cleanup global function
            delete window.showPaymentProofForOrder;
        };
    }, [hasRole]);

    const loadPayments = () => {
        const payments = sharedDataService.getPendingPayments();
        console.log('Loaded payments:', payments); // Debug log
        setPendingPayments(payments);
    };

    const loadStatistics = () => {
        const stats = sharedDataService.getPaymentStatistics();
        setStatistics(stats);
    };

    // Find payment for a specific order
    const findPaymentForOrder = (orderId) => {
        return pendingPayments.find(payment => payment.orderId === orderId);
    };

    // Zoom control functions
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    const handleToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const resetZoomAndFullscreen = () => {
        setZoomLevel(1);
        setIsFullscreen(false);
    };

    // Show payment proof for a specific order
    const showPaymentProofForOrder = (orderId) => {
        const payment = findPaymentForOrder(orderId);
        if (payment && payment.paymentProof) {
            setSelectedPayment(payment);
            setZoomLevel(1);
            setIsFullscreen(false);
        } else {
            alert('No payment proof found for this order.');
        }
    };

    const handleApprovePayment = async (paymentId) => {
        try {
            setIsLoading(true);
            console.log('Attempting to approve payment:', paymentId);
            console.log('Available payments:', pendingPayments);
            console.log('Payment to approve:', pendingPayments.find(p => p.id === paymentId));
            
            await approvePayment(paymentId, adminNotes);
            loadPayments();
            loadStatistics();
            setSelectedPayment(null);
            setAdminNotes('');
            resetZoomAndFullscreen();
            alert('Payment approved successfully!');
        } catch (error) {
            console.error('Error approving payment:', error);
            alert('Error approving payment: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectPayment = async (paymentId) => {
        if (!adminNotes.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            setIsLoading(true);
            await rejectPayment(paymentId, adminNotes);
            loadPayments();
            loadStatistics();
            setSelectedPayment(null);
            setAdminNotes('');
            resetZoomAndFullscreen();
            alert('Payment rejected successfully!');
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Error rejecting payment: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPayments = pendingPayments.filter(payment => {
        if (filter === 'pending') return payment.status === 'pending';
        if (filter === 'confirmed') return payment.status === 'confirmed';
        return true;
    });

    if (!hasRole('admin')) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>Access Denied</h3>
                <p>You don't have permission to access payment management.</p>
            </div>
        );
    }

    const containerStyle = {
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
    };

    const headerStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    };

    const filterStyle = {
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
    };

    const paymentCardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        border: '1px solid #e0e0e0'
    };

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

    const modalContentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={{ margin: 0, color: theme.colors.primary, marginBottom: '1rem' }}>
                    Payment Management
                </h2>
                
                {statistics && (
                    <div style={statsGridStyle}>
                        <div style={statCardStyle}>
                            <FaClock size={24} color={theme.colors.primary} style={{ marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: 0, color: theme.colors.primary }}>
                                {statistics.pendingPayments}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Pending Approvals</p>
                        </div>
                        
                        <div style={statCardStyle}>
                            <FaCheck size={24} color="#28a745" style={{ marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: 0, color: '#28a745' }}>
                                {statistics.approvedPayments}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Approved</p>
                        </div>
                        
                        <div style={statCardStyle}>
                            <FaRupeeSign size={24} color={theme.colors.accent} style={{ marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: 0, color: theme.colors.accent }}>
                                ₹{statistics.totalAmount.toFixed(2)}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Revenue</p>
                        </div>
                        
                        <div style={statCardStyle}>
                            <FaClock size={24} color="#ffc107" style={{ marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: 0, color: '#ffc107' }}>
                                ₹{statistics.pendingAmount.toFixed(2)}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Pending Amount</p>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold' }}>Filter:</label>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="all">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Awaiting Approval</option>
                    </select>
                </div>
                
                <button
                    onClick={() => {
                        loadPayments();
                        loadStatistics();
                    }}
                    style={componentStyles.buttons.secondary}
                >
                    🔄 Refresh Data
                </button>
            </div>

            <div>
                {filteredPayments.length === 0 ? (
                    <div style={paymentCardStyle}>
                        <p style={{ textAlign: 'center', color: theme.colors.textLight }}>
                            No payments found.
                        </p>
                    </div>
                ) : (
                    filteredPayments.map(payment => (
                        <div key={payment.id} style={paymentCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: theme.colors.primary }}>
                                        Payment #{payment.id}
                                    </h4>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: theme.colors.textLight }}>
                                        Order: {payment.orderId}
                                    </p>
                                </div>
                                <div style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '20px',
                                    backgroundColor: payment.status === 'confirmed' ? '#28a745' : '#ffc107',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {payment.status.toUpperCase()}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <strong>Amount:</strong> ₹{payment.amount.toFixed(2)}
                                </div>
                                <div>
                                    <strong>Customer:</strong> {payment.userName}
                                </div>
                                <div>
                                    <strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <strong>Method:</strong> Google Pay
                                </div>
                            </div>

                            {payment.paymentProof && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                                        📸 Payment Proof Submitted
                                    </h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                        <div>
                                            <strong>Transaction ID:</strong> {payment.paymentProof.transactionId || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Amount Paid:</strong> ₹{payment.paymentProof.amount || payment.amount}
                                        </div>
                                        <div>
                                            <strong>Payment Date:</strong> {payment.paymentProof.paymentDate || new Date().toLocaleDateString()}
                                        </div>
                                        <div>
                                            <strong>Payment Method:</strong> {payment.paymentProof.paymentMethod || 'Google Pay'}
                                        </div>
                                    </div>
                                    {payment.paymentProof.notes && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                            <strong>Customer Notes:</strong> {payment.paymentProof.notes}
                                        </div>
                                    )}
                                    {payment.paymentProof.screenshot && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <strong>Screenshot:</strong> 
                                            <div style={{ marginTop: '0.5rem', position: 'relative' }}>
                                                <img 
                                                    src={payment.paymentProof.screenshot} 
                                                    alt="Payment Screenshot" 
                                                    style={{ 
                                                        maxWidth: '200px', 
                                                        maxHeight: '150px', 
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setZoomLevel(1);
                                                        setIsFullscreen(false);
                                                    }}
                                                />
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '5px', 
                                                    right: '5px',
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Click to Zoom
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setSelectedPayment(payment)}
                                    style={componentStyles.buttons.secondary}
                                >
                                    <FaEye style={{ marginRight: '0.5rem' }} />
                                    View Details
                                </button>
                                
                                {payment.status === 'confirmed' && (
                                    <>
                                        <button
                                            onClick={() => handleApprovePayment(payment.id)}
                                            style={{
                                                ...componentStyles.buttons.primary,
                                                backgroundColor: '#28a745',
                                                borderColor: '#28a745'
                                            }}
                                            disabled={isLoading}
                                        >
                                            <FaCheck style={{ marginRight: '0.5rem' }} />
                                            Approve
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                setSelectedPayment(payment);
                                                setAdminNotes('');
                                            }}
                                            style={{
                                                ...componentStyles.buttons.secondary,
                                                backgroundColor: '#dc3545',
                                                borderColor: '#dc3545',
                                                color: 'white'
                                            }}
                                            disabled={isLoading}
                                        >
                                            <FaTimes style={{ marginRight: '0.5rem' }} />
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedPayment && (
                <div style={modalStyle} onClick={() => {
                setSelectedPayment(null);
                resetZoomAndFullscreen();
            }}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: theme.colors.primary }}>
                                Payment Details
                            </h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4>Payment Information</h4>
                            <p><strong>Payment ID:</strong> {selectedPayment.id}</p>
                            <p><strong>Order ID:</strong> {selectedPayment.orderId}</p>
                            <p><strong>Amount:</strong> ₹{selectedPayment.amount.toFixed(2)}</p>
                            <p><strong>Status:</strong> {selectedPayment.status}</p>
                            <p><strong>Created:</strong> {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> {selectedPayment.userName}</p>
                            <p><strong>Email:</strong> {selectedPayment.userEmail}</p>
                        </div>

                        {selectedPayment.paymentProof && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                <h4 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>
                                    📸 Payment Proof Details
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <strong>Transaction ID:</strong> {selectedPayment.paymentProof.transactionId || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Amount Paid:</strong> ₹{selectedPayment.paymentProof.amount || selectedPayment.amount}
                                    </div>
                                    <div>
                                        <strong>Payment Date:</strong> {selectedPayment.paymentProof.paymentDate || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Payment Method:</strong> {selectedPayment.paymentProof.paymentMethod || 'Google Pay'}
                                    </div>
                                </div>
                                
                                {selectedPayment.paymentProof.notes && (
                                    <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                        <strong>Customer Notes:</strong> {selectedPayment.paymentProof.notes}
                                    </div>
                                )}
                                
                                {selectedPayment.paymentProof.screenshot && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginBottom: '0.5rem' 
                                        }}>
                                            <strong>Payment Screenshot:</strong>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={handleZoomOut}
                                                    style={{
                                                        ...componentStyles.buttons.secondary,
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        minWidth: 'auto'
                                                    }}
                                                    title="Zoom Out"
                                                >
                                                    <FaSearchMinus />
                                                </button>
                                                <span style={{ fontSize: '0.8rem', minWidth: '40px', textAlign: 'center' }}>
                                                    {Math.round(zoomLevel * 100)}%
                                                </span>
                                                <button
                                                    onClick={handleZoomIn}
                                                    style={{
                                                        ...componentStyles.buttons.secondary,
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        minWidth: 'auto'
                                                    }}
                                                    title="Zoom In"
                                                >
                                                    <FaSearchPlus />
                                                </button>
                                                <button
                                                    onClick={handleResetZoom}
                                                    style={{
                                                        ...componentStyles.buttons.secondary,
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        minWidth: 'auto'
                                                    }}
                                                    title="Reset Zoom"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleToggleFullscreen}
                                                    style={{
                                                        ...componentStyles.buttons.secondary,
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        minWidth: 'auto'
                                                    }}
                                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                                >
                                                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={{ 
                                            textAlign: 'center',
                                            overflow: 'auto',
                                            maxHeight: isFullscreen ? '70vh' : '400px',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            backgroundColor: '#f8f9fa'
                                        }}>
                                            <img
                                                src={selectedPayment.paymentProof.screenshot}
                                                alt="Payment Screenshot"
                                                style={{ 
                                                    maxWidth: isFullscreen ? '100%' : '100%', 
                                                    maxHeight: isFullscreen ? '100%' : '300px', 
                                                    borderRadius: '8px',
                                                    border: '1px solid #ccc',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    transform: `scale(${zoomLevel})`,
                                                    transformOrigin: 'center center',
                                                    transition: 'transform 0.2s ease'
                                                }}
                                            />
                                        </div>
                                        
                                        <div style={{ 
                                            marginTop: '0.5rem',
                                            fontSize: '0.8rem',
                                            color: theme.colors.textLight,
                                            textAlign: 'center'
                                        }}>
                                            💡 <strong>Zoom Tips:</strong> Use zoom controls to examine payment details carefully. 
                                            Fullscreen mode provides maximum visibility for validation.
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ 
                                    padding: '1rem', 
                                    backgroundColor: '#d4edda', 
                                    borderRadius: '4px', 
                                    border: '1px solid #c3e6cb',
                                    color: '#155724'
                                }}>
                                    <strong>✅ Payment Proof Validated:</strong> Customer has submitted payment proof and is awaiting admin approval.
                                </div>
                            </div>
                        )}

                        {selectedPayment.status === 'confirmed' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Admin Notes:
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes for approval/rejection..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setSelectedPayment(null);
                                    resetZoomAndFullscreen();
                                }}
                                style={componentStyles.buttons.secondary}
                            >
                                Close
                            </button>
                            
                            {selectedPayment.status === 'confirmed' && (
                                <>
                                    <button
                                        onClick={() => handleRejectPayment(selectedPayment.id)}
                                        style={{
                                            ...componentStyles.buttons.secondary,
                                            backgroundColor: '#dc3545',
                                            borderColor: '#dc3545',
                                            color: 'white'
                                        }}
                                        disabled={isLoading}
                                    >
                                        <FaTimes style={{ marginRight: '0.5rem' }} />
                                        Reject
                                    </button>
                                    
                                    <button
                                        onClick={() => handleApprovePayment(selectedPayment.id)}
                                        style={{
                                            ...componentStyles.buttons.primary,
                                            backgroundColor: '#28a745',
                                            borderColor: '#28a745'
                                        }}
                                        disabled={isLoading}
                                    >
                                        <FaCheck style={{ marginRight: '0.5rem' }} />
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentManager;