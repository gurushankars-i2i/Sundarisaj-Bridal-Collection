// Shared Data Service for cross-browser instance data sharing
class SharedDataService {
    constructor() {
        this.storageKey = 'ssbc-shared-data';
        this.data = this.loadData();
        this.listeners = new Map();
        this.initializeStorage();
    }

    // Initialize storage with demo data if empty
    initializeStorage() {
        if (!this.data.orders || this.data.orders.length === 0) {
            // Add some demo orders for testing
            this.data.orders = [];
            this.data.payments = [];
            this.data.users = [];
            this.saveData();
        }
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {
                orders: [],
                payments: [],
                users: [],
                products: [],
                categories: [],
                reviews: []
            };
        } catch (error) {
            console.error('Error loading shared data:', error);
            return {
                orders: [],
                payments: [],
                users: [],
                products: [],
                categories: [],
                reviews: []
            };
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            this.notifyListeners('dataChanged', this.data);
        } catch (error) {
            console.error('Error saving shared data:', error);
        }
    }

    // Add event listener
    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    // Remove event listener
    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Notify all listeners of an event
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in listener callback:', error);
                }
            });
        }
    }

    // Order Management
    addOrder(order) {
        this.data.orders.unshift(order);
        this.saveData();
        
        // Notify admin users about new order
        this.notifyAdminsAboutNewOrder(order);
        
        return order;
    }
    
    notifyAdminsAboutNewOrder(order) {
        // Get all admin users
        const adminUsers = this.getAllUsers().filter(u => u.role === 'admin');
        
        // Get existing notifications
        const notifications = JSON.parse(localStorage.getItem('ssbc-notifications') || '[]');
        
        // Create notification for each admin
        adminUsers.forEach(admin => {
            const notification = {
                id: `order-notif-${order.id}-${Date.now()}-${admin.id}`,
                message: `🛍️ New order #${order.id} from ${order.userName} - ₹${order.total.toLocaleString()}`,
                type: 'order',
                date: new Date().toISOString(),
                isRead: false,
                userId: admin.id,
                orderId: order.id,
                actionType: 'order',
                actionData: order
            };
            notifications.unshift(notification);
        });
        
        // Save updated notifications
        localStorage.setItem('ssbc-notifications', JSON.stringify(notifications));
        
        // Notify listeners
        this.notifyListeners('newOrder', { order, adminUsers });
    }

    updateOrder(orderId, updates) {
        const orderIndex = this.data.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.data.orders[orderIndex] = { ...this.data.orders[orderIndex], ...updates };
            this.saveData();
            return this.data.orders[orderIndex];
        }
        return null;
    }

    getOrder(orderId) {
        return this.data.orders.find(o => o.id === orderId);
    }

    getAllOrders() {
        return [...this.data.orders];
    }

    getUserOrders(userId) {
        return this.data.orders.filter(o => o.userId === userId);
    }

    // Payment Management
    addPayment(payment) {
        this.data.payments.unshift(payment);
        this.saveData();
        return payment;
    }

    updatePayment(paymentId, updates) {
        const paymentIndex = this.data.payments.findIndex(p => p.id === paymentId);
        if (paymentIndex !== -1) {
            this.data.payments[paymentIndex] = { ...this.data.payments[paymentIndex], ...updates };
            this.saveData();
            return this.data.payments[paymentIndex];
        }
        return null;
    }

    getPayment(paymentId) {
        return this.data.payments.find(p => p.id === paymentId);
    }

    getAllPayments() {
        return [...this.data.payments];
    }

    getPendingPayments() {
        return this.data.payments.filter(p => 
            p.status === 'pending' || p.status === 'confirmed'
        );
    }

    getPaymentByOrderId(orderId) {
        return this.data.payments.find(p => p.orderId === orderId);
    }

    // User Management
    addUser(user) {
        this.data.users.push(user);
        this.saveData();
        return user;
    }

    updateUser(userId, updates) {
        const userIndex = this.data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
            this.saveData();
            return this.data.users[userIndex];
        }
        return null;
    }

    getUser(userId) {
        return this.data.users.find(u => u.id === userId);
    }

    getAllUsers() {
        return [...this.data.users];
    }

    // Product Management
    addProduct(product) {
        this.data.products.push(product);
        this.saveData();
        return product;
    }

    updateProduct(productId, updates) {
        const productIndex = this.data.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.data.products[productIndex] = { ...this.data.products[productIndex], ...updates };
            this.saveData();
            return this.data.products[productIndex];
        }
        return null;
    }

    getProduct(productId) {
        return this.data.products.find(p => p.id === productId);
    }

    getAllProducts() {
        return [...this.data.products];
    }

    // Category Management
    addCategory(category) {
        this.data.categories.push(category);
        this.saveData();
        return category;
    }

    updateCategory(categoryId, updates) {
        const categoryIndex = this.data.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
            this.data.categories[categoryIndex] = { ...this.data.categories[categoryIndex], ...updates };
            this.saveData();
            return this.data.categories[categoryIndex];
        }
        return null;
    }

    getCategory(categoryId) {
        return this.data.categories.find(c => c.id === categoryId);
    }

    getAllCategories() {
        return [...this.data.categories];
    }

    // Statistics and Analytics
    getOrderStatistics() {
        const totalOrders = this.data.orders.length;
        const totalRevenue = this.data.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const pendingOrders = this.data.orders.filter(o => 
            o.status === 'order_placed' || 
            o.status === 'pending_payment' || 
            o.status === 'pending_payment_approval'
        ).length;
        const confirmedOrders = this.data.orders.filter(o => 
            o.status === 'order_confirmed' || 
            o.status === 'processing' || 
            o.status === 'shipped' || 
            o.status === 'on_delivery' || 
            o.status === 'completed'
        ).length;
        const cancelledOrders = this.data.orders.filter(o => o.status === 'cancelled').length;

        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            confirmedOrders,
            cancelledOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }

    getPaymentStatistics() {
        const totalPayments = this.data.payments.length;
        const approvedPayments = this.data.payments.filter(p => p.status === 'approved');
        const pendingPayments = this.data.payments.filter(p => 
            p.status === 'pending' || p.status === 'confirmed'
        );
        const totalAmount = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
            totalPayments,
            approvedPayments: approvedPayments.length,
            pendingPayments: pendingPayments.length,
            totalAmount,
            pendingAmount,
            averageAmount: approvedPayments.length > 0 ? totalAmount / approvedPayments.length : 0
        };
    }

    // Search and Filter
    searchOrders(query, filters = {}) {
        return this.data.orders.filter(order => {
            const matchesQuery = !query || 
                order.id.toLowerCase().includes(query.toLowerCase()) ||
                order.userName.toLowerCase().includes(query.toLowerCase()) ||
                order.userEmail.toLowerCase().includes(query.toLowerCase());
            
            const matchesStatus = !filters.status || filters.status === 'all' || order.status === filters.status;
            const matchesDateRange = !filters.startDate || !filters.endDate || 
                (new Date(order.date) >= new Date(filters.startDate) && 
                 new Date(order.date) <= new Date(filters.endDate));

            return matchesQuery && matchesStatus && matchesDateRange;
        });
    }

    searchUsers(query, filters = {}) {
        return this.data.users.filter(user => {
            const matchesQuery = !query || 
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase()) ||
                user.phone?.includes(query) ||
                user.role === query;

            const matchesRole = !filters.role || filters.role === 'all' || user.role === filters.role;
            const matchesStatus = !filters.status || filters.status === 'all' || 
                (filters.status === 'active' ? user.isActive : !user.isActive);

            return matchesQuery && matchesRole && matchesStatus;
        });
    }

    // Data Export/Import
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = { ...this.data, ...importedData };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data (for testing/reset)
    clearAllData() {
        this.data = {
            orders: [],
            payments: [],
            users: [],
            products: [],
            categories: []
        };
        this.saveData();
    }

    // Initialize with demo data
    initializeDemoData() {
        // Add demo users if none exist
        if (this.data.users.length === 0) {
            this.data.users = [
                {
                    id: '1',
                    name: 'Demo User',
                    email: 'user@example.com',
                    password: 'password123',
                    phone: '+91 9876543210',
                    role: 'user',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    lastLogin: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'admin123',
                    phone: '+91 9876543211',
                    role: 'admin',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    lastLogin: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Staff User',
                    email: 'staff@example.com',
                    password: 'staff123',
                    phone: '+91 9876543212',
                    role: 'staff',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    lastLogin: new Date().toISOString()
                }
            ];
        }

        // Add demo categories if none exist
        if (this.data.categories.length === 0) {
            this.data.categories = [
                { id: 'kundan', name: 'Kundan', description: 'Traditional Kundan jewelry' },
                { id: 'temple', name: 'Temple', description: 'Temple jewelry collection' },
                { id: 'american-diamond', name: 'American Diamond', description: 'American diamond jewelry' },
                { id: 'traditional', name: 'Traditional', description: 'Traditional Indian jewelry' },
                { id: 'modern', name: 'Modern', description: 'Modern jewelry designs' },
                { id: 'kemp', name: 'Kemp', description: 'Kemp jewelry collection' },
                { id: 'pearl', name: 'Pearl', description: 'Pearl jewelry' },
                { id: 'polki', name: 'Polki', description: 'Polki jewelry' },
                { id: 'antique', name: 'Antique', description: 'Antique jewelry pieces' },
                { id: 'bridal-sets', name: 'Bridal Sets', description: 'Complete bridal jewelry sets' }
            ];
        }

        this.saveData();
    }

    // Review Management
    addReview(review) {
        if (!this.data.reviews) {
            this.data.reviews = [];
        }
        this.data.reviews.unshift(review);
        this.saveData();
        
        // Notify admin about new review
        const adminUsers = this.getAllUsers().filter(u => u.role === 'admin');
        const notifications = JSON.parse(localStorage.getItem('ssbc-notifications') || '[]');
        adminUsers.forEach(admin => {
            const notification = {
                id: `review-notif-${review.id}-${Date.now()}-${admin.id}`,
                message: `⭐ New review (${review.rating} stars) from ${review.userName} for ${review.productName}`,
                type: 'review',
                date: new Date().toISOString(),
                isRead: false,
                userId: admin.id,
                reviewId: review.id,
                actionType: 'review',
                actionData: review
            };
            notifications.unshift(notification);
        });
        localStorage.setItem('ssbc-notifications', JSON.stringify(notifications));
        
        return review;
    }

    getAllReviews() {
        return this.data.reviews || [];
    }

    getReviewsByProduct(productId) {
        return (this.data.reviews || []).filter(r => r.productId === productId && r.status === 'approved');
    }

    getPendingReviews() {
        return (this.data.reviews || []).filter(r => r.status === 'pending');
    }

    updateReviewStatus(reviewId, status) {
        const reviewIndex = (this.data.reviews || []).findIndex(r => r.id === reviewId);
        if (reviewIndex !== -1) {
            this.data.reviews[reviewIndex].status = status;
            this.saveData();
            return this.data.reviews[reviewIndex];
        }
        return null;
    }

    getReviewStatistics() {
        const reviews = this.data.reviews || [];
        return {
            total: reviews.length,
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
            averageRating: reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0
        };
    }
}

// Create singleton instance
const sharedDataService = new SharedDataService();

// Initialize with demo data
sharedDataService.initializeDemoData();

export default sharedDataService; 