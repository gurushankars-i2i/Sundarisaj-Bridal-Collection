import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ProductContext } from '../context/ProductContext';
import sharedDataService from '../services/sharedDataService';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import AdminAccountDeletionManager from '../components/AdminAccountDeletionManager';
import AdminProductManager from '../components/AdminProductManager';
import AdminCustomerManager from '../components/AdminCustomerManager';
import AdminPaymentManager from '../components/AdminPaymentManager';
import AdminReviewManager from '../components/AdminReviewManager';
import { 
    FaShoppingBag, 
    FaUsers, 
    FaBox, 
    FaRupeeSign, 
    FaEye, 
    FaEdit, 
    FaCheck, 
    FaTimes, 
    FaTruck, 
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaSearch,
    FaFilter,
    FaSort,
    FaTrash,
    FaChartLine,
    FaChartBar,
    FaChartPie,
    FaChartArea
} from 'react-icons/fa';

const AdminDashboardPage = () => {
    const { getAllOrders, getOrderStatistics, updateOrderStatus } = useContext(CartContext);
    const { products } = useContext(ProductContext);
    
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [dateRange, setDateRange] = useState('month');

    useEffect(() => {
        const allOrders = sharedDataService.getAllOrders();
        setOrders(allOrders || []);
        
        // Listen for data changes
        const handleDataChange = (data) => {
            setOrders(data.orders || []);
        };
        
        sharedDataService.addListener('dataChanged', handleDataChange);
        
        return () => {
            sharedDataService.removeListener('dataChanged', handleDataChange);
        };
    }, []);

    const statistics = sharedDataService.getOrderStatistics();

    const filteredAndSortedOrders = orders
        .filter(order => {
            const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
            const matchesSearch = searchTerm === '' || 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(b.date) - new Date(a.date);
                    break;
                case 'total':
                    comparison = b.total - a.total;
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'customer':
                    comparison = a.userName.localeCompare(b.userName);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });

    const handleStatusUpdate = (orderId, newStatus, adminNotes = '') => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        let updates = { status: newStatus, adminNotes };
        let notificationMessage = '';

        // Handle delivery flow updates
        switch (newStatus) {
            case 'shipped':
                const trackingNumber = prompt('Enter tracking number:');
                const carrier = prompt('Enter shipping carrier (e.g., FedEx, UPS, DHL):');
                if (trackingNumber && carrier) {
                    updates.tracking = {
                        number: trackingNumber,
                        carrier: carrier,
                        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
                    };
                    updates.delivery = {
                        ...order.delivery,
                        shippedAt: new Date().toISOString()
                    };
                    notificationMessage = `Your order has been shipped! Tracking: ${trackingNumber} via ${carrier}`;
                } else {
                    alert('Tracking information is required for shipping status.');
                    return;
                }
                break;

            case 'out_for_delivery':
                updates.delivery = {
                    ...order.delivery,
                    outForDeliveryAt: new Date().toISOString()
                };
                notificationMessage = 'Your order is out for delivery today!';
                break;

            case 'delivered':
                updates.delivery = {
                    ...order.delivery,
                    deliveredAt: new Date().toISOString()
                };
                notificationMessage = 'Your order has been delivered! Please check your items and consider leaving a review.';
                break;

            case 'processing':
                notificationMessage = 'Your order is now being processed and prepared for shipping.';
                break;

            case 'order_confirmed':
                notificationMessage = 'Your order has been confirmed and is now being processed!';
                break;
        }

        // Update in shared data service
        sharedDataService.updateOrder(orderId, updates);
        
        // Update local state
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, ...updates }
                    : order
            )
        );
        
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(prev => ({ ...prev, ...updates }));
        }

        // Send notification to user if message exists
        if (notificationMessage) {
            sendUserNotification(order.userEmail, 'order_status_update', {
                orderId: order.id,
                status: newStatus,
                message: notificationMessage,
                tracking: updates.tracking
            });
        }
    };

    // Order management functions
    const handleApproveOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            // Check stock availability
            const hasStock = order.items.every(item => {
                const product = products.find(p => p.id === item.id);
                return product && (product.stock || 0) >= item.quantity;
            });

            if (hasStock) {
                // Update order status
                handleStatusUpdate(orderId, 'order_confirmed', 'Order approved by admin');
                
                // Update stock counts
                order.items.forEach(item => {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        sharedDataService.updateProduct(product.id, {
                            stock: Math.max(0, (product.stock || 0) - item.quantity)
                        });
                    }
                });

                // Send notification to user
                sendUserNotification(order.userEmail, 'order_approved', {
                    orderId: order.id,
                    status: 'order_confirmed',
                    message: 'Your order has been approved and is now being processed!'
                });

                alert('✅ Order approved successfully! Stock updated and user notified.');
            } else {
                alert('❌ Cannot approve order: Insufficient stock for some items.');
            }
        }
    };

    const handleCancelOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const reason = prompt('Please provide a reason for cancellation:');
            if (reason) {
                // Update order status
                handleStatusUpdate(orderId, 'cancelled', `Order cancelled: ${reason}`);
                
                // Restore stock if order was confirmed
                if (['order_confirmed', 'processing'].includes(order.status)) {
                    order.items.forEach(item => {
                        const product = products.find(p => p.id === item.id);
                        if (product) {
                            sharedDataService.updateProduct(product.id, {
                                stock: (product.stock || 0) + item.quantity
                            });
                        }
                    });
                }

                // Send notification to user
                sendUserNotification(order.userEmail, 'order_cancelled', {
                    orderId: order.id,
                    status: 'cancelled',
                    message: `Your order has been cancelled. Reason: ${reason}`,
                    refundInfo: 'Refund will be processed within 3-5 business days.'
                });

                alert('✅ Order cancelled successfully! User notified and stock restored if needed.');
            }
        }
    };

    const handleProcessRefund = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            // Check if order has refund destination
            if (!order.refund?.destination) {
                alert('❌ Cannot process refund: No refund destination specified by customer.');
                return;
            }

            const refundAmount = prompt(`Enter refund amount for order ${orderId} (current total: ₹${order.total}):`);
            if (refundAmount && !isNaN(refundAmount)) {
                const amount = parseFloat(refundAmount);
                if (amount > 0 && amount <= order.total) {
                    // Update order with refund information
                    handleStatusUpdate(orderId, 'refunded', `Refund processed: ₹${amount}`);
                    
                    // Send notification to user
                    sendUserNotification(order.userEmail, 'refund_processed', {
                        orderId: order.id,
                        refundAmount: amount,
                        message: `Refund of ₹${amount} has been processed for your cancelled order.`
                    });

                    alert(`✅ Refund of ₹${amount} processed successfully! User notified.`);
                } else {
                    alert('❌ Invalid refund amount. Must be between 0 and order total.');
                }
            }
        }
    };

    // Notification system
    const sendUserNotification = (userEmail, type, data) => {
        const notification = {
            id: `notif-${Date.now()}`,
            type,
            userEmail,
            data,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        // Store notification in shared data service
        const existingNotifications = sharedDataService.data.notifications || [];
        sharedDataService.data.notifications = [...existingNotifications, notification];
        sharedDataService.saveData();

        // In a real app, this would send email/SMS notifications
        console.log(`Notification sent to ${userEmail}:`, notification);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'order_placed': return theme.colors.info;
            case 'pending_payment': return theme.colors.warning;
            case 'pending_payment_approval': return theme.colors.primary;
            case 'order_confirmed': return theme.colors.success;
            case 'processing': return theme.colors.info;
            case 'shipped': return theme.colors.primary;
            case 'on_delivery': return theme.colors.accent;
            case 'completed': return theme.colors.success;
            case 'cancelled': return theme.colors.error;
            default: return theme.colors.textLight;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'order_placed': return <FaClock />;
            case 'pending_payment': return <FaRupeeSign />;
            case 'pending_payment_approval': return <FaClock />;
            case 'order_confirmed': return <FaCheck />;
            case 'processing': return <FaBox />;
            case 'shipped': return <FaTruck />;
            case 'on_delivery': return <FaTruck />;
            case 'completed': return <FaCheckCircle />;
            case 'cancelled': return <FaTimes />;
            default: return <FaExclamationTriangle />;
        }
    };

    // Analytics helper functions
    const getSalesData = (range) => {
        const now = new Date();
        let startDate = new Date();
        
        switch (range) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        const filteredOrders = orders.filter(order => new Date(order.date) >= startDate);
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = filteredOrders.length;
        const uniqueCustomers = new Set(filteredOrders.map(order => order.userEmail)).size;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            uniqueCustomers,
            averageOrderValue
        };
    };

    const getLowStockProducts = () => {
        return products.filter(product => (product.stock || 0) > 0 && (product.stock || 0) <= 10);
    };

    const getOutOfStockProducts = () => {
        return products.filter(product => (product.stock || 0) === 0);
    };

    const getTopSellingProducts = () => {
        // Simulate sales data - in real app this would come from order history
        return products.slice(0, 10).map(product => ({
            ...product,
            salesCount: Math.floor(Math.random() * 50) + 1
        })).sort((a, b) => b.salesCount - a.salesCount);
    };

    const containerStyle = {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        color: theme.colors.text,
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
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

    const tabContainerStyle = {
        display: 'flex',
        marginBottom: '2rem',
        borderBottom: `2px solid ${theme.colors.accent}`,
    };

    const tabStyle = {
        padding: '1rem 2rem',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: theme.colors.textLight,
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s ease',
    };

    const activeTabStyle = {
        ...tabStyle,
        color: theme.colors.primary,
        borderBottomColor: theme.colors.primary,
        backgroundColor: theme.colors.light_gold,
        borderBottomWidth: '3px',
        borderBottomStyle: 'solid',
    };

    const contentStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    };

    const statCardStyle = {
        padding: '1.5rem',
        backgroundColor: theme.colors.light_gold,
        borderRadius: '8px',
        textAlign: 'center',
        border: `1px solid ${theme.colors.accent}`,
    };

    const statValueStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '0.5rem',
    };

    const statLabelStyle = {
        color: theme.colors.textLight,
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    };

    const filtersStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
    };

    const filterInputStyle = {
        padding: '0.8rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
        minWidth: '200px',
    };

    const filterSelectStyle = {
        padding: '0.8rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: theme.colors.white,
        color: theme.colors.text,
        cursor: 'pointer',
    };

    const ordersTableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem',
    };

    const tableHeaderStyle = {
        backgroundColor: theme.colors.primary,
        color: 'white',
        padding: '1rem',
        textAlign: 'left',
        fontWeight: 'bold',
    };

    const tableRowStyle = {
        borderBottom: `1px solid ${theme.colors.accent}`,
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    };

    const tableCellStyle = {
        padding: '1rem',
        verticalAlign: 'top',
    };

    const statusBadgeStyle = (status) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        backgroundColor: getStatusColor(status) + '20',
        color: getStatusColor(status),
        border: `1px solid ${getStatusColor(status)}`,
    });

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    const modalHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${theme.colors.accent}`,
    };

    const closeButtonStyle = {
        ...componentStyles.buttons.secondary,
        padding: '0.5rem',
        fontSize: '1.2rem',
    };

    const orderItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        marginBottom: '1rem',
    };

    const itemImageStyle = {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: `1px solid ${theme.colors.accent}`,
    };

    const actionButtonsStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Admin Dashboard</h1>
                    <p style={subtitleStyle}>Manage orders, products, and customer data</p>
                </div>
                <Link 
                    to="/admin/create-user" 
                    style={{
                        ...componentStyles.buttons.primary,
                        padding: '0.75rem 1.5rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaUser />
                    Create User
                </Link>
            </div>

            <div style={tabContainerStyle}>
                <button 
                    style={activeTab === 'overview' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    style={activeTab === 'orders' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders ({orders.length})
                </button>
                <button 
                    style={activeTab === 'products' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('products')}
                >
                    Products ({products.length})
                </button>
                <button 
                    style={activeTab === 'analytics' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('analytics')}
                >
                    <FaChartLine style={{ marginRight: '0.5rem' }} />
                    Sales Analytics
                </button>
                <button 
                    style={activeTab === 'customers' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
                <button 
                    style={activeTab === 'account-deletion' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('account-deletion')}
                >
                    <FaTrash style={{ marginRight: '0.5rem' }} />
                    Account Deletion
                </button>
                <button 
                    style={activeTab === 'payments' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('payments')}
                >
                    <FaRupeeSign style={{ marginRight: '0.5rem' }} />
                    Payments
                </button>
                <button 
                    style={activeTab === 'reviews' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('reviews')}
                >
                    ⭐ Reviews
                </button>
            </div>

            <div style={contentStyle}>
                {activeTab === 'overview' && (
                    <div>
                        <h2 style={{ color: theme.colors.primary, marginBottom: '2rem' }}>Dashboard Overview</h2>
                        
                        <div style={statsGridStyle}>
                            <div style={statCardStyle}>
                                <div style={statValueStyle}>{statistics.totalOrders}</div>
                                <div style={statLabelStyle}>Total Orders</div>
                            </div>
                            <div style={statCardStyle}>
                                <div style={statValueStyle}>₹{statistics.totalRevenue.toLocaleString()}</div>
                                <div style={statLabelStyle}>Total Revenue</div>
                            </div>
                            <div style={statCardStyle}>
                                <div style={statValueStyle}>{statistics.pendingOrders}</div>
                                <div style={statLabelStyle}>Pending Orders</div>
                            </div>
                            <div style={statCardStyle}>
                                <div style={statValueStyle}>{statistics.deliveredOrders}</div>
                                <div style={statLabelStyle}>Delivered Orders</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Recent Orders</h3>
                                {orders.slice(0, 5).map(order => {
                                    const payment = sharedDataService.getPaymentByOrderId(order.id);
                                    return (
                                        <div key={order.id} style={{ 
                                            padding: '1rem', 
                                            border: `1px solid ${theme.colors.accent}`, 
                                            borderRadius: '8px', 
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>#{order.id}</strong>
                                                    <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                        {order.userName}
                                                    </div>
                                                </div>
                                                <div style={statusBadgeStyle(order.status)}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                                ₹{order.total.toLocaleString()}
                                            </div>
                                            
                                            {/* Payment Proof Section */}
                                            {payment && (
                                                <div style={{ 
                                                    marginTop: '1rem', 
                                                    padding: '0.75rem', 
                                                    backgroundColor: payment.status === 'pending' ? '#fff3cd' : payment.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 'bold' }}>
                                                            Payment: {payment.status === 'pending' ? '⏳ Pending Verification' : payment.status === 'confirmed' ? '✅ Confirmed' : '❌ Rejected'}
                                                        </span>
                                                    </div>
                                                    {payment.paymentProof && (
                                                        <img 
                                                            src={payment.paymentProof} 
                                                            alt="Payment proof" 
                                                            style={{ 
                                                                maxWidth: '150px', 
                                                                maxHeight: '150px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                marginTop: '0.5rem'
                                                            }}
                                                            onClick={() => {
                                                                // Open payment in payments tab
                                                                setActiveTab('payments');
                                                                // The AdminPaymentManager will handle showing the payment details
                                                                if (window.showPaymentProofForOrder) {
                                                                    window.showPaymentProofForOrder(order.id);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    {payment.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveTab('payments');
                                                                    setTimeout(() => {
                                                                        if (window.showPaymentProofForOrder) {
                                                                            window.showPaymentProofForOrder(order.id);
                                                                        }
                                                                    }, 100);
                                                                }}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '0.5rem',
                                                                    backgroundColor: theme.colors.success,
                                                                    color: theme.colors.white,
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                <FaCheck /> Verify Payment
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                style={{
                                                    marginTop: '0.75rem',
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    backgroundColor: theme.colors.primary,
                                                    color: theme.colors.white,
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <FaEye style={{ marginRight: '0.5rem' }} />
                                                View Details
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Order Status Distribution</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { status: 'pending', count: statistics.pendingOrders, color: theme.colors.warning },
                                        { status: 'confirmed', count: statistics.confirmedOrders, color: theme.colors.info },
                                        { status: 'shipped', count: statistics.shippedOrders, color: theme.colors.primary },
                                        { status: 'delivered', count: statistics.deliveredOrders, color: theme.colors.success },
                                        { status: 'cancelled', count: statistics.cancelledOrders, color: theme.colors.error }
                                    ].map(({ status, count, color }) => (
                                        <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ 
                                                    width: '12px', 
                                                    height: '12px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: color 
                                                }} />
                                                <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h2 style={{ color: theme.colors.primary, marginBottom: '2rem' }}>Order Management</h2>
                        
                        <div style={filtersStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={filterInputStyle}
                                />
                            </div>
                            
                            <select
                                value={orderStatusFilter}
                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                                style={filterSelectStyle}
                            >
                                <option value="all">All Status</option>
                                <option value="order_placed">Order Placed</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="pending_payment_approval">Pending Payment Approval</option>
                                <option value="order_confirmed">Order Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="on_delivery">On Delivery</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={filterSelectStyle}
                            >
                                <option value="date">Sort by Date</option>
                                <option value="total">Sort by Total</option>
                                <option value="status">Sort by Status</option>
                                <option value="customer">Sort by Customer</option>
                            </select>
                            
                            <button
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                style={componentStyles.buttons.secondary}
                            >
                                <FaSort />
                                {sortOrder === 'desc' ? 'Desc' : 'Asc'}
                            </button>
                        </div>

                        <table style={ordersTableStyle}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Order ID</th>
                                    <th style={tableHeaderStyle}>Customer</th>
                                    <th style={tableHeaderStyle}>Items</th>
                                    <th style={tableHeaderStyle}>Total</th>
                                    <th style={tableHeaderStyle}>Status</th>
                                    <th style={tableHeaderStyle}>Date</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedOrders.map(order => (
                                    <tr key={order.id} style={tableRowStyle}>
                                        <td style={tableCellStyle}>
                                            <strong>#{order.id}</strong>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{order.userName}</div>
                                                <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                    {order.userEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div>
                                                {order.items.length} item(s)
                                                <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                    {order.orderType}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <strong>₹{order.total.toLocaleString()}</strong>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div style={statusBadgeStyle(order.status)}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                style={componentStyles.buttons.secondary}
                                            >
                                                <FaEye />
                                                View
                                            </button>
                                                
                                                {order.status === 'pending_payment_approval' && (
                                                    <button
                                                        onClick={() => handleApproveOrder(order.id)}
                                                        style={{
                                                            ...componentStyles.buttons.primary,
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                
                                                {['order_placed', 'pending_payment', 'pending_payment_approval'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        style={{
                                                            ...componentStyles.buttons.secondary,
                                                            backgroundColor: '#dc3545',
                                                            borderColor: '#dc3545',
                                                            color: 'white',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                
                                                {order.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => handleProcessRefund(order.id)}
                                                        style={{
                                                            ...componentStyles.buttons.secondary,
                                                            backgroundColor: '#ffc107',
                                                            borderColor: '#ffc107',
                                                            color: '#212529',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Refund
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredAndSortedOrders.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textLight }}>
                                <FaShoppingBag style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                <h3>No orders found</h3>
                                <p>Try adjusting your filters or search criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <AdminProductManager />
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h2 style={{ color: theme.colors.primary, marginBottom: '2rem' }}>Sales Analytics & Inventory Management</h2>
                        
                        {/* Date Range Selector */}
                        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: theme.colors.primary }}>Select Date Range</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setDateRange('today')}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: dateRange === 'today' ? theme.colors.primary : undefined,
                                        color: dateRange === 'today' ? 'white' : undefined
                                    }}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setDateRange('week')}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: dateRange === 'week' ? theme.colors.primary : undefined,
                                        color: dateRange === 'week' ? 'white' : undefined
                                    }}
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => setDateRange('month')}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: dateRange === 'month' ? theme.colors.primary : undefined,
                                        color: dateRange === 'month' ? 'white' : undefined
                                    }}
                                >
                                    This Month
                                </button>
                                <button
                                    onClick={() => setDateRange('year')}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: dateRange === 'year' ? theme.colors.primary : undefined,
                                        color: dateRange === 'year' ? 'white' : undefined
                                    }}
                                >
                                    This Year
                                </button>
                            </div>
                        </div>

                        {/* Sales Statistics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                                <FaChartLine size={40} color={theme.colors.primary} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                                    ₹{getSalesData(dateRange).totalRevenue.toLocaleString()}
                                </h3>
                                <p style={{ margin: 0, color: theme.colors.textLight }}>Total Revenue</p>
                            </div>
                            
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                                <FaShoppingBag size={40} color={theme.colors.success} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.success }}>
                                    {getSalesData(dateRange).totalOrders}
                                </h3>
                                <p style={{ margin: 0, color: theme.colors.textLight }}>Total Orders</p>
                            </div>
                            
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                                <FaUsers size={40} color={theme.colors.info} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ margin: 0, color: theme.colors.textLight }}>
                                    {getSalesData(dateRange).uniqueCustomers}
                                </h3>
                                <p style={{ margin: 0, color: theme.colors.textLight }}>Unique Customers</p>
                            </div>
                            
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                                <FaRupeeSign size={40} color={theme.colors.accent} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.accent }}>
                                    ₹{getSalesData(dateRange).averageOrderValue.toLocaleString()}
                                </h3>
                                <p style={{ margin: 0, color: theme.colors.textLight }}>Avg Order Value</p>
                            </div>
                        </div>

                        {/* Inventory Overview */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: theme.colors.primary }}>Inventory Overview</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>{products.length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textLight }}>Total Products</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.warning }}>{getLowStockProducts().length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textLight }}>Low Stock Items</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.info }}>{getOutOfStockProducts().length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textLight }}>Out of Stock</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.success }}>{getTopSellingProducts().length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textLight }}>Top Selling</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: theme.colors.primary }}>Top Selling Products</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {getTopSellingProducts().slice(0, 5).map((product, index) => (
                                    <div key={product.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        padding: '1rem', 
                                        backgroundColor: '#f8f9fa', 
                                        borderRadius: '6px' 
                                    }}>
                                        <div style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            backgroundColor: theme.colors.primary, 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem 0' }}>{product.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                Category: {product.category} | Stock: {product.stock || 0}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                                ₹{product.price}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                {product.salesCount || 0} sold
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <AdminCustomerManager />
                )}

                {activeTab === 'account-deletion' && (
                    <div>
                        <AdminAccountDeletionManager />
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div>
                        <AdminPaymentManager />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <AdminReviewManager />
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div style={modalOverlayStyle} onClick={() => setShowOrderModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ color: theme.colors.primary, margin: 0 }}>
                                Order #{selectedOrder.id}
                            </h2>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                style={closeButtonStyle}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Customer Information</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FaUser />
                                    <strong>{selectedOrder.userName}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FaEnvelope />
                                    {selectedOrder.userEmail}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FaPhone />
                                    {selectedOrder.customerInfo.phone}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FaCalendarAlt />
                                    {new Date(selectedOrder.date).toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Shipping Address</h3>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <FaMapMarkerAlt style={{ marginTop: '0.2rem' }} />
                                    <div>
                                        <div>{selectedOrder.shippingAddress.fullName}</div>
                                        <div>{selectedOrder.shippingAddress.address}</div>
                                        <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</div>
                                        <div>Phone: {selectedOrder.shippingAddress.phone}</div>
                                    </div>
                                </div>
                                
                                {selectedOrder.pickupPoint && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ color: theme.colors.primary, marginBottom: '0.5rem' }}>Pickup Point</h4>
                                        <div>{selectedOrder.pickupPoint}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Order Items</h3>
                            {selectedOrder.items.map((item, index) => (
                                <div key={index} style={orderItemStyle}>
                                    <img 
                                        src={item.images?.[0] || item.image} 
                                        alt={item.name} 
                                        style={itemImageStyle}
                                    />
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                            {item.purchaseDescription || (item.purchaseType === 'rent' ? 'Rent' : 'Purchase')}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                            Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '0.5rem' }}>Order Status</h3>
                                <div style={statusBadgeStyle(selectedOrder.status)}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {selectedOrder.status}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                    Total: ₹{selectedOrder.total.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Refund Information */}
                        {selectedOrder.refund && (
                            <div style={{
                                background: '#f8f9fa',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '2rem',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Refund Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div><strong>Status:</strong> {selectedOrder.refund.status}</div>
                                        <div><strong>Amount:</strong> ₹{selectedOrder.refund.amount?.toLocaleString() || selectedOrder.total.toLocaleString()}</div>
                                        <div><strong>Reason:</strong> {selectedOrder.refund.reason || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div><strong>Destination:</strong> {selectedOrder.refund.destination || 'Not specified'}</div>
                                        <div><strong>Initiated:</strong> {new Date(selectedOrder.refund.initiatedAt).toLocaleString()}</div>
                                        {selectedOrder.refund.processedAt && (
                                            <div><strong>Processed:</strong> {new Date(selectedOrder.refund.processedAt).toLocaleString()}</div>
                                        )}
                                        {selectedOrder.refund.failedReason && (
                                            <div><strong>Failure Reason:</strong> {selectedOrder.refund.failedReason}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={actionButtonsStyle}>
                            {/* Payment Proof Verification Button - Always visible for orders with payment */}
                            {selectedOrder.status === 'pending_payment_approval' && (
                                    <button
                                    onClick={() => {
                                        // Show payment proof verification
                                        if (window.showPaymentProofForOrder) {
                                            window.showPaymentProofForOrder(selectedOrder.id);
                                        } else {
                                            // Fallback to opening payment management
                                            window.open('/admin/payments', '_blank');
                                        }
                                    }}
                                    style={{...componentStyles.buttons.secondary, backgroundColor: '#17a2b8', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    <FaEye />
                                    Verify Payment Proof
                                </button>
                            )}
                            
                            {selectedOrder.status === 'pending_payment_approval' && (
                                <button
                                    onClick={() => {
                                        handleApproveOrder(selectedOrder.id);
                                        setShowOrderModal(false);
                                    }}
                                        style={{...componentStyles.buttons.primary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                    >
                                        <FaCheck />
                                    ✅ Approve Order
                                    </button>
                            )}
                            
                            {['order_placed', 'pending_payment', 'pending_payment_approval'].includes(selectedOrder.status) && (
                                    <button
                                    onClick={() => {
                                        handleCancelOrder(selectedOrder.id);
                                        setShowOrderModal(false);
                                    }}
                                    style={{...componentStyles.buttons.secondary, backgroundColor: '#dc3545', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                    >
                                        <FaTimes />
                                        Cancel Order
                                    </button>
                            )}
                            
                            {selectedOrder.status === 'order_confirmed' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                                    style={{...componentStyles.buttons.primary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    <FaBox />
                                    Start Processing
                                </button>
                            )}
                            
                            {selectedOrder.status === 'processing' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                                    style={{...componentStyles.buttons.primary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    <FaTruck />
                                    Mark as Shipped
                                </button>
                            )}
                            
                            {selectedOrder.status === 'shipped' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'on_delivery')}
                                    style={{...componentStyles.buttons.primary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    <FaTruck />
                                    Out for Delivery
                                </button>
                            )}
                            
                            {selectedOrder.status === 'on_delivery' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                                    style={{...componentStyles.buttons.primary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    <FaCheckCircle />
                                    Mark as Completed
                                </button>
                            )}
                            
                            {selectedOrder.status === 'cancelled' && (
                                <button
                                    onClick={() => {
                                        handleProcessRefund(selectedOrder.id);
                                        setShowOrderModal(false);
                                    }}
                                    style={{...componentStyles.buttons.secondary, backgroundColor: '#ffc107', color: '#212529', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                >
                                    💰 Process Refund
                                </button>
                            )}
                            
                            <button
                                onClick={() => setShowOrderModal(false)}
                                style={componentStyles.buttons.secondary}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage; 