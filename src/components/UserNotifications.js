import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaShoppingBag, FaEye } from 'react-icons/fa';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import sharedDataService from '../services/sharedDataService';
import { useAuthSystem } from '../context/UnifiedAuthContext';

const UserNotifications = ({ userEmail }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, getUserRole } = useAuthSystem();
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
        
        // Refresh notifications periodically
        const interval = setInterval(loadNotifications, 3000);
        
        return () => clearInterval(interval);
    }, [user]);

    const loadNotifications = () => {
        try {
            const allNotifications = JSON.parse(localStorage.getItem('ssbc-notifications') || '[]');
            // Filter by userId instead of userEmail
            const userNotifications = allNotifications.filter(n => 
                n.userId === user?.id || n.userEmail === user?.email
            );
            setNotifications(userNotifications.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setUnreadCount(userNotifications.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = (notificationId) => {
        try {
            const allNotifications = JSON.parse(localStorage.getItem('ssbc-notifications') || '[]');
            const updatedAllNotifications = allNotifications.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
            );
            localStorage.setItem('ssbc-notifications', JSON.stringify(updatedAllNotifications));
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = () => {
        try {
            const allNotifications = JSON.parse(localStorage.getItem('ssbc-notifications') || '[]');
            const notificationIds = notifications.map(n => n.id);
            const updatedAllNotifications = allNotifications.map(n => 
                notificationIds.includes(n.id) ? { ...n, isRead: true } : n
            );
            localStorage.setItem('ssbc-notifications', JSON.stringify(updatedAllNotifications));
            loadNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleOrderAction = (orderId, action) => {
        if (action === 'view') {
            navigate('/admin/dashboard');
            setShowNotifications(false);
        } else if (action === 'approve' || action === 'reject') {
            const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';
            sharedDataService.updateOrder(orderId, { status: newStatus });
            loadNotifications();
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return <FaShoppingBag style={{ color: '#f0a500' }} />;
            case 'order_approved':
                return <FaCheck style={{ color: '#28a745' }} />;
            case 'order_cancelled':
                return <FaExclamationTriangle style={{ color: '#dc3545' }} />;
            case 'refund_processed':
                return <FaInfoCircle style={{ color: '#17a2b8' }} />;
            default:
                return <FaInfoCircle style={{ color: '#6c757d' }} />;
        }
    };

    const getNotificationTitle = (type) => {
        switch (type) {
            case 'order':
                return 'New Order';
            case 'order_approved':
                return 'Order Approved';
            case 'order_cancelled':
                return 'Order Cancelled';
            case 'refund_processed':
                return 'Refund Processed';
            default:
                return 'Notification';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'order':
                return '#fff3cd';
            case 'order_approved':
                return '#d4edda';
            case 'order_cancelled':
                return '#f8d7da';
            case 'refund_processed':
                return '#d1ecf1';
            default:
                return '#f8f9fa';
        }
    };

    const containerStyle = {
        position: 'relative',
        display: 'inline-block'
    };

    const bellStyle = {
        position: 'relative',
        cursor: 'pointer',
        fontSize: '1.2rem',
        color: theme.colors.text,
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'all 0.3s ease'
    };

    const badgeStyle = {
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    };

    const notificationsPanelStyle = {
        position: 'absolute',
        top: '100%',
        right: '0',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: `1px solid ${theme.colors.accent}`,
        backgroundColor: theme.colors.light_gold
    };

    const notificationItemStyle = {
        padding: '1rem',
        borderBottom: '1px solid #e9ecef',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    };

    const emptyStyle = {
        padding: '2rem',
        textAlign: 'center',
        color: theme.colors.textLight
    };

    return (
        <div style={containerStyle}>
            <div 
                style={bellStyle}
                onClick={() => setShowNotifications(!showNotifications)}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.light_gold}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <div style={badgeStyle}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>

            {showNotifications && (
                <div style={notificationsPanelStyle}>
                    <div style={headerStyle}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Mark All Read
                                </button>
                            )}
                            <button
                                onClick={() => setShowNotifications(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: theme.colors.text
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    style={{
                                        ...notificationItemStyle,
                                        backgroundColor: notification.isRead ? 'white' : getNotificationColor(notification.type),
                                        cursor: notification.type === 'order' && getUserRole() === 'admin' ? 'default' : 'pointer'
                                    }}
                                    onClick={() => {
                                        if (notification.type !== 'order' || getUserRole() !== 'admin') {
                                            markAsRead(notification.id);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (notification.type !== 'order' || getUserRole() !== 'admin') {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (notification.type !== 'order' || getUserRole() !== 'admin') {
                                            e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : getNotificationColor(notification.type);
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ marginTop: '0.25rem' }}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontWeight: 'bold', 
                                                marginBottom: '0.5rem',
                                                color: notification.isRead ? theme.colors.text : theme.colors.primary
                                            }}>
                                                {getNotificationTitle(notification.type)}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                {notification.message || notification.data?.message}
                                            </div>
                                            {notification.data?.refundInfo && (
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: theme.colors.textLight,
                                                    fontStyle: 'italic'
                                                }}>
                                                    {notification.data.refundInfo}
                                                </div>
                                            )}
                                            
                                            {/* Quick Actions for Order Notifications (Admin Only) */}
                                            {notification.type === 'order' && notification.orderId && getUserRole() === 'admin' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOrderAction(notification.orderId, 'view');
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            backgroundColor: theme.colors.primary,
                                                            color: theme.colors.white,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOrderAction(notification.orderId, 'approve');
                                                            markAsRead(notification.id);
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
                                                        <FaCheck /> Approve
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOrderAction(notification.orderId, 'reject');
                                                            markAsRead(notification.id);
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            backgroundColor: theme.colors.error,
                                                            color: theme.colors.white,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        <FaTimes /> Reject
                                                    </button>
                                                </div>
                                            )}
                                            
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                color: theme.colors.textLight,
                                                marginTop: '0.5rem'
                                            }}>
                                                {new Date(notification.date || notification.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: theme.colors.primary,
                                                borderRadius: '50%',
                                                marginTop: '0.5rem'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={emptyStyle}>
                                <FaBell size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No notifications yet</p>
                                <p style={{ fontSize: '0.9rem' }}>You'll see updates about your orders here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserNotifications; 