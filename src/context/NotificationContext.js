import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthSystem } from './UnifiedAuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        try {
            const localData = localStorage.getItem('ssbc-notifications');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Failed to parse notifications from localStorage", error);
            return [];
        }
    });

    const { user, isAuthenticated } = useAuthSystem();

    // Filter notifications based on user authentication
    const userNotifications = isAuthenticated() && user ? 
        notifications.filter(n => n.userId === user.id || n.userId === 'all') : 
        [];

    useEffect(() => {
        localStorage.setItem('ssbc-notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (notification) => {
        let newNotification;
        
        if (typeof notification === 'string') {
            // Handle string notifications (backward compatibility)
            newNotification = {
                id: `notif-${Date.now()}`,
                message: notification,
                type: 'info',
                date: new Date().toISOString(),
                isRead: false,
                userId: user?.id || 'all'
            };
        } else {
            // Handle object notifications
            newNotification = {
                id: notification.id || `notif-${Date.now()}`,
                message: notification.message,
                type: notification.type || 'info',
                date: notification.date || new Date().toISOString(),
                isRead: notification.isRead || false,
                userId: notification.userId || user?.id || 'all'
            };
        }
        
        setNotifications(prev => [newNotification, ...prev]);
    };

    const addUserNotification = (userId, notification) => {
        const newNotification = {
            id: `notif-${Date.now()}`,
            message: notification.message || notification,
            type: notification.type || 'info',
            date: new Date().toISOString(),
            isRead: false,
            userId: userId,
            orderId: notification.orderId || null,
            actionType: notification.actionType || null, // 'order', 'payment', 'review', 'refund'
            actionData: notification.actionData || null
        };
        
        setNotifications(prev => [newNotification, ...prev]);
    };

    const addOrderNotification = (orderId, orderData, adminUserIds) => {
        // Notify all admin users about new order
        adminUserIds.forEach(adminId => {
            const newNotification = {
                id: `order-notif-${orderId}-${Date.now()}`,
                message: `New order #${orderId} from ${orderData.userName} - ₹${orderData.total.toLocaleString()}`,
                type: 'order',
                date: new Date().toISOString(),
                isRead: false,
                userId: adminId,
                orderId: orderId,
                actionType: 'order',
                actionData: orderData
            };
            setNotifications(prev => [newNotification, ...prev]);
        });
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    };

    const clearAllNotifications = () => {
        if (isAuthenticated() && user) {
            // Only clear user's notifications
            setNotifications(prev => prev.filter(n => n.userId !== user.id));
        } else {
            setNotifications([]);
        }
    };

    const removeNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const getUnreadCount = () => {
        return userNotifications.filter(n => !n.isRead).length;
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications: userNotifications, 
            allNotifications: notifications,
            addNotification, 
            addUserNotification,
            addOrderNotification,
            markAsRead, 
            clearAllNotifications,
            removeNotification,
            getUnreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
}; 