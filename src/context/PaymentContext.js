import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthSystem } from './UnifiedAuthContext';
import sharedDataService from '../services/sharedDataService';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuthSystem();
    const [payments, setPayments] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);

    // Load payments from shared data service
    useEffect(() => {
        loadPaymentsFromSharedService();
        
        // Listen for data changes
        const handleDataChange = (data) => {
            if (data.payments) {
                setPayments(data.payments);
                setPendingPayments(data.payments.filter(p => 
                    p.status === 'pending' || p.status === 'confirmed'
                ));
            }
        };
        
        sharedDataService.addListener('dataChanged', handleDataChange);
        
        return () => {
            sharedDataService.removeListener('dataChanged', handleDataChange);
        };
    }, []);

    const loadPaymentsFromSharedService = () => {
        const allPayments = sharedDataService.getAllPayments();
        const pendingPaymentsData = sharedDataService.getPendingPayments();
        
        setPayments(allPayments);
        setPendingPayments(pendingPaymentsData);
    };

    // Generate GPay UPI URL
    const generateGPayQR = (amount, orderId, merchantName = 'Sundarisaj Bridal Collection') => {
        // UPI payment URL format
        const upiId = 'sundarisaj@paytm'; // Replace with actual UPI ID
        const merchantCode = 'SBCOLL'; // Merchant code
        
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&mc=${merchantCode}&tid=${orderId}&am=${amount}&cu=INR&url=`;
        
        return upiUrl;
    };

    // Create payment request
    const createPaymentRequest = async (orderData) => {
        if (!isAuthenticated()) {
            throw new Error('User must be authenticated to create payment request');
        }

        const paymentRequest = {
            id: `PAY_${Date.now()}`,
            orderId: orderData.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            amount: orderData.total,
            currency: 'INR',
            status: 'pending', // pending, confirmed, approved, rejected, failed
            paymentMethod: 'gpay',
            upiUrl: generateGPayQR(orderData.total, orderData.id),
            orderDetails: orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentProof: null,
            adminNotes: null,
            approvedBy: null,
            approvedAt: null
        };

        // Update order status to pending_payment
        try {
            if (window.updateOrderStatus) {
                window.updateOrderStatus(orderData.id, 'pending_payment', 'Payment request created');
            }
        } catch (error) {
            console.log('Order status update not available:', error);
        }

        // Add to shared data service first
        const addedPayment = sharedDataService.addPayment(paymentRequest);
        
        // Update local state
        setPayments(prev => [...prev, addedPayment]);
        setPendingPayments(prev => [...prev, addedPayment]);
        
        return addedPayment;
    };

    // Submit payment proof
    const submitPaymentProof = async (paymentId, proofData) => {
        if (!isAuthenticated()) {
            throw new Error('User must be authenticated to submit payment proof');
        }

        const payment = pendingPayments.find(p => p.id === paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        // Update in shared data service first
        const updatedPayment = sharedDataService.updatePayment(paymentId, {
            status: 'confirmed',
            paymentProof: proofData,
            updatedAt: new Date().toISOString()
        });

        // Update local state
        setPendingPayments(prev => prev.map(payment => 
            payment.id === paymentId 
                ? {
                    ...payment,
                    status: 'confirmed',
                    paymentProof: proofData,
                    updatedAt: new Date().toISOString()
                }
                : payment
        ));
        
        setPayments(prev => prev.map(payment => 
            payment.id === paymentId 
                ? {
                    ...payment,
                    status: 'confirmed',
                    paymentProof: proofData,
                    updatedAt: new Date().toISOString()
                }
                : payment
        ));

        // Update order status to pending_payment_approval
        try {
            if (window.updateOrderStatus) {
                window.updateOrderStatus(payment.orderId, 'pending_payment_approval', 'Payment proof submitted, awaiting admin approval');
            }
        } catch (error) {
            console.log('Order status update not available:', error);
        }

        return true;
    };

    // Admin: Get all pending payments
    const getPendingPayments = () => {
        return pendingPayments.filter(payment => 
            payment.status === 'confirmed' || payment.status === 'pending'
        );
    };

    // Admin: Approve payment
    const approvePayment = async (paymentId, adminNotes = '') => {
        if (!isAuthenticated() || user.role !== 'admin') {
            throw new Error('Only admin can approve payments');
        }

        const payment = pendingPayments.find(p => p.id === paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const approvedPayment = {
            ...payment,
            status: 'approved',
            adminNotes,
            approvedBy: user.id,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Update in shared data service first
        const updatedPayment = sharedDataService.updatePayment(paymentId, {
            status: 'approved',
            adminNotes,
            approvedBy: user.id,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Update local state
        setPayments(prev => prev.map(p => 
            p.id === paymentId ? updatedPayment : p
        ));
        setPendingPayments(prev => prev.filter(p => p.id !== paymentId));

        // Update order status in shared data service
        try {
            sharedDataService.updateOrder(payment.orderId, { 
                status: 'order_confirmed', 
                adminNotes: `Payment approved: ${adminNotes}`,
                updatedAt: new Date().toISOString()
            });
            
            // Send notification to user
            const notification = {
                id: `notif-${Date.now()}`,
                type: 'order_approved',
                userEmail: payment.userEmail,
                data: {
                    orderId: payment.orderId,
                    status: 'order_confirmed',
                    message: `Your payment has been approved! Order #${payment.orderId} is now confirmed and being processed.`,
                    adminNotes: adminNotes
                },
                timestamp: new Date().toISOString(),
                isRead: false
            };

            // Store notification in shared data service
            const existingNotifications = sharedDataService.data.notifications || [];
            sharedDataService.data.notifications = [...existingNotifications, notification];
            sharedDataService.saveData();
            
            console.log(`✅ Payment approved for order: ${payment.orderId}. Order status updated and user notified.`);
        } catch (error) {
            console.error('Error updating order status or sending notification:', error);
        }

        return approvedPayment;
    };

    // Admin: Reject payment
    const rejectPayment = async (paymentId, adminNotes = '') => {
        if (!isAuthenticated() || user.role !== 'admin') {
            throw new Error('Only admin can reject payments');
        }

        // Update in shared data service first
        const updatedPayment = sharedDataService.updatePayment(paymentId, {
            status: 'rejected',
            adminNotes,
            approvedBy: user.id,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Update local state
        setPendingPayments(prev => prev.map(payment => 
            payment.id === paymentId 
                ? {
                    ...payment,
                    status: 'rejected',
                    adminNotes,
                    approvedBy: user.id,
                    approvedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                : payment
        ));

        // Update order status in shared data service
        try {
            const payment = pendingPayments.find(p => p.id === paymentId);
            if (payment) {
                sharedDataService.updateOrder(payment.orderId, { 
                    status: 'cancelled', 
                    adminNotes: `Payment rejected: ${adminNotes}`,
                    updatedAt: new Date().toISOString()
                });
                
                // Send notification to user
                const notification = {
                    id: `notif-${Date.now()}`,
                    type: 'order_cancelled',
                    userEmail: payment.userEmail,
                    data: {
                        orderId: payment.orderId,
                        status: 'cancelled',
                        message: `Your payment has been rejected for order #${payment.orderId}. Please contact support for assistance.`,
                        adminNotes: adminNotes
                    },
                    timestamp: new Date().toISOString(),
                    isRead: false
                };

                // Store notification in shared data service
                const existingNotifications = sharedDataService.data.notifications || [];
                sharedDataService.data.notifications = [...existingNotifications, notification];
                sharedDataService.saveData();
                
                console.log(`❌ Payment rejected for order: ${payment.orderId}. Order status updated and user notified.`);
            }
        } catch (error) {
            console.error('Error updating order status or sending notification:', error);
        }

        return true;
    };

    // Get user's payments
    const getUserPayments = () => {
        if (!isAuthenticated()) return [];
        
        const userPayments = payments.filter(payment => payment.userId === user.id);
        const userPendingPayments = pendingPayments.filter(payment => payment.userId === user.id);
        
        return [...userPayments, ...userPendingPayments].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    };

    // Get payment by ID
    const getPaymentById = (paymentId) => {
        const allPayments = [...payments, ...pendingPayments];
        return allPayments.find(payment => payment.id === paymentId);
    };

    // Get payment statistics (for admin)
    const getPaymentStatistics = () => {
        if (!isAuthenticated() || user.role !== 'admin') return null;

        const allPayments = [...payments, ...pendingPayments];
        const totalAmount = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = pendingPayments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0);

        return {
            totalPayments: allPayments.length,
            approvedPayments: payments.filter(p => p.status === 'approved').length,
            pendingPayments: pendingPayments.filter(p => p.status === 'confirmed').length,
            rejectedPayments: pendingPayments.filter(p => p.status === 'rejected').length,
            totalAmount,
            pendingAmount,
            averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
        };
    };

    const value = {
        payments,
        pendingPayments,
        createPaymentRequest,
        submitPaymentProof,
        getPendingPayments,
        approvePayment,
        rejectPayment,
        getUserPayments,
        getPaymentById,
        getPaymentStatistics,
        generateGPayQR
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};