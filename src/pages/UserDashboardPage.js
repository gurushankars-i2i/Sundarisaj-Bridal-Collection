import React, { useContext, useState } from 'react';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { generateInvoicePdf } from '../services/pdfService';
import { theme } from '../theme/theme';
import { Link } from 'react-router-dom';
import RefundManager from '../components/RefundManager';
import ReviewModal from '../components/ReviewModal';
import sharedDataService from '../services/sharedDataService';

const UserDashboardPage = () => {
    const { user } = useAuthSystem();
    const { orders } = useContext(CartContext);
    const { t } = useContext(LanguageContext);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Helper functions for order status
    const getStatusColor = (status) => {
        switch (status) {
            case 'order_placed': return '#ff6b35';
            case 'pending_payment': return '#ffc107';
            case 'pending_payment_approval': return '#17a2b8';
            case 'order_confirmed': return '#28a745';
            case 'processing': return '#007bff';
            case 'shipped': return '#6f42c1';
            case 'out_for_delivery': return '#fd7e14';
            case 'delivered': return '#20c997';
            case 'returned': return '#fd7e14';
            case 'cancelled': return '#dc3545';
            case 'refund_initiated': return '#ffc107';
            case 'refund_processed': return '#17a2b8';
            case 'refunded': return '#28a745';
            case 'refund_failed': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusBackground = (status) => {
        switch (status) {
            case 'order_placed': return '#fff3e0';
            case 'pending_payment': return '#fff8e1';
            case 'pending_payment_approval': return '#e3f2fd';
            case 'order_confirmed': return '#e8f5e8';
            case 'processing': return '#e3f2fd';
            case 'shipped': return '#f3e5f5';
            case 'out_for_delivery': return '#fff3e0';
            case 'delivered': return '#e8f5e8';
            case 'returned': return '#fff3e0';
            case 'cancelled': return '#ffebee';
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

    const handleDownloadInvoice = (order) => {
        generateInvoicePdf(order, user, t);
    };

    const handleReturnOrder = (order) => {
        // TODO: Implement return order functionality
        alert('Return functionality will be implemented soon!');
    };

    const handleReviewOrder = (order) => {
        setSelectedOrderForReview(order);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (review) => {
        try {
            // Save review to shared data service
            sharedDataService.addReview(review);
            console.log('Review submitted:', review);
            alert('Review submitted successfully! Your review is pending admin approval.');
            setRefreshKey(prev => prev + 1); // Refresh to show updated order status
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    // --- STYLES ---
    const pageStyle = {
        padding: '2rem',
        background: '#f9f9f9',
        minHeight: 'calc(100vh - 140px)', // Adjust based on header/footer height
    };
    const headerStyle = {
        textAlign: 'center',
        marginBottom: '2rem',
    };
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        alignItems: 'start',
    };
    const cardStyle = {
        background: theme.colors.white,
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    };
    const titleStyle = {
        color: theme.colors.primary,
        marginBottom: '1.5rem',
        borderBottom: `2px solid ${theme.colors.accent}`,
        paddingBottom: '0.5rem',
    };
    const orderItemStyle = {
        border: `1px solid ${theme.colors.lightGray}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
    };
    const orderHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        marginBottom: '1rem',
        borderBottom: `1px solid ${theme.colors.lightGray}`,
        fontWeight: 'bold',
    };
    const productItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.5rem 0',
        justifyContent: 'space-between',
    };
    const productImageStyle = {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px',
    };
    const emptyStateStyle = {
        textAlign: 'center',
        padding: '3rem',
        background: '#fafafa',
        borderRadius: '8px',
    };
    const downloadButtonStyle = {
        background: theme.colors.primary,
        color: theme.colors.white,
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    };
    const profileLinkStyle = {
        background: theme.colors.primary,
        color: theme.colors.white,
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
    };

    return (
        <div style={pageStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 style={titleStyle}>{t('welcome')}, {user.name}!</h1>
                <Link to="/profile" style={profileLinkStyle}>{t('editProfile')}</Link>
            </div>
            <div style={gridStyle}>
                {/* Profile Card */}
                <div style={cardStyle}>
                    <h2 style={titleStyle}>My Profile</h2>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>

                {/* Order History Card */}
                <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <h2 style={titleStyle}>My Order History</h2>
                        <button 
                            onClick={() => setRefreshKey(prev => prev + 1)} 
                            style={{
                                background: theme.colors.primary,
                                color: theme.colors.white,
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.secondary}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary}
                            title="Reload order data"
                        >
                            🔄 Refresh Orders
                        </button>
                    </div>

                    {/* Order Summary Statistics */}
                    {orders.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem',
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                    {orders.length}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Total Orders</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                    ₹{orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Total Spent</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
                                    {orders.filter(order => order.status === 'delivered').length}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Delivered</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                                    {orders.filter(order => ['order_placed', 'pending_payment', 'pending_payment_approval', 'order_confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)).length}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>In Progress</div>
                            </div>
                        </div>
                    )}
                    {orders.length === 0 ? (
                        <div style={emptyStateStyle}>
                            <p>You have not placed any orders yet.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} style={orderItemStyle}>
                                <div style={orderHeaderStyle}>
                                    <div>
                                        <strong>Order ID:</strong> {order.id}
                                    </div>
                                    <div>
                                        <strong>Date:</strong> {new Date(order.date).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <strong>Total:</strong> ₹{order.total.toLocaleString()}
                                    </div>
                                    <div>
                                        <strong>Status:</strong> <span style={{
                                            color: getStatusColor(order.status), 
                                            fontWeight: 'bold',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            background: getStatusBackground(order.status)
                                        }}>{formatStatus(order.status)}</span>
                                    </div>
                                </div>
                                {order.items.map(item => (
                                    <div key={item.id} style={productItemStyle}>
                                        <img src={item.image} alt={item.name} style={productImageStyle} />
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>₹{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                                
                                {/* Order Tracking Information */}
                                {order.tracking && (
                                    <div style={{
                                        background: '#f0f8ff',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        borderLeft: `4px solid #007bff`
                                    }}>
                                        <strong>📦 Order Tracking:</strong>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div><strong>Tracking Number:</strong> {order.tracking.number}</div>
                                            <div><strong>Carrier:</strong> {order.tracking.carrier}</div>
                                            {order.tracking.estimatedDelivery && (
                                                <div><strong>Estimated Delivery:</strong> {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Information */}
                                {order.delivery && (
                                    <div style={{
                                        background: '#f0fff0',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        borderLeft: `4px solid #28a745`
                                    }}>
                                        <strong>🚚 Delivery Details:</strong>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            {order.delivery.shippedAt && (
                                                <div><strong>Shipped:</strong> {new Date(order.delivery.shippedAt).toLocaleString()}</div>
                                            )}
                                            {order.delivery.outForDeliveryAt && (
                                                <div><strong>Out for Delivery:</strong> {new Date(order.delivery.outForDeliveryAt).toLocaleString()}</div>
                                            )}
                                            {order.delivery.deliveredAt && (
                                                <div><strong>Delivered:</strong> {new Date(order.delivery.deliveredAt).toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Refund Manager Component */}
                                <RefundManager 
                                    order={order} 
                                    onRefundUpdate={(refundData) => {
                                        // Update order with new refund data
                                        console.log('Refund updated:', refundData);
                                        // This would typically update the order in the backend
                                    }}
                                />

                                {/* Refund Destination Display */}
                                {order.refund && order.refund.destination && (
                                    <div style={{
                                        background: '#fff3cd',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        borderLeft: `4px solid #ffc107`
                                    }}>
                                        <strong>💰 Refund Destination:</strong>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div><strong>Method:</strong> {order.refund.destination}</div>
                                            {order.refund.destination === 'bank_transfer' && order.refund.bankAccount && (
                                                <div><strong>Account:</strong> {order.refund.bankAccount}</div>
                                            )}
                                            {order.refund.destination === 'upi' && order.refund.upiId && (
                                                <div><strong>UPI ID:</strong> {order.refund.upiId}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes Display */}
                                {order.adminNotes && (
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        borderLeft: `4px solid ${theme.colors.primary}`
                                    }}>
                                        <strong>Admin Notes:</strong> {order.adminNotes}
                                    </div>
                                )}
                                
                                {/* Last Updated Info */}
                                {order.updatedAt && (
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6c757d',
                                        marginBottom: '1rem',
                                        fontStyle: 'italic'
                                    }}>
                                        Last updated: {new Date(order.updatedAt).toLocaleString()}
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => handleDownloadInvoice(order)}
                                        style={downloadButtonStyle}
                                    >
                                        {t('downloadInvoice')}
                                    </button>
                                    
                                    {/* Return and Review buttons for delivered orders */}
                                    {order.status === 'delivered' && (
                                        <>
                                            <button 
                                                onClick={() => handleReturnOrder(order)}
                                                style={{
                                                    ...downloadButtonStyle,
                                                    background: '#fd7e14',
                                                    margin: 0
                                                }}
                                            >
                                                📦 Return Item
                                            </button>
                                            <button 
                                                onClick={() => handleReviewOrder(order)}
                                                style={{
                                                    ...downloadButtonStyle,
                                                    background: '#17a2b8',
                                                    margin: 0
                                                }}
                                            >
                                                ⭐ Write Review
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedOrderForReview && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedOrderForReview(null);
                    }}
                    order={selectedOrderForReview}
                    onSubmitReview={handleSubmitReview}
                />
            )}
        </div>
    );
};

export default UserDashboardPage; 