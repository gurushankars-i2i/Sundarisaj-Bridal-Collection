import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://huefhxldlkbjltzlcbuo.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZWZoeGxkbGtiamx0emxjYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjg4MjEsImV4cCI6MjA2OTcwNDgyMX0.Xoc5U-43rZzgUsyGJ-5pomsWykka7xgTwRs4IWq2kb0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Schema and table configuration (using public schema)
export const SCHEMA = 'public';
export const TABLES = {
    USERS: 'users',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    CART_ITEMS: 'cart_items',
    NOTIFICATIONS: 'notifications'
};

// Field mapping between database and application
export const FIELD_MAPPING = {
    // Database field names -> Application field names
    toApp: {
        // Products
        rental_price_per_day: 'rentalPricePerDay',
        sale_price: 'salePrice',
        is_for_rent: 'isForRent',
        is_for_sale: 'isForSale',
        is_new: 'isNew',
        is_best_seller: 'isBestSeller',
        
        // Users
        date_of_birth: 'dateOfBirth',
        is_blocked: 'isBlocked',
        deleted_at: 'deletedAt',
        created_at: 'createdAt',
        updated_at: 'updatedAt',
        
        // Orders
        order_number: 'orderNumber',
        total_amount: 'totalAmount',
        subtotal: 'subtotal',
        tax_amount: 'taxAmount',
        shipping_amount: 'shippingAmount',
        discount_amount: 'discountAmount',
        payment_status: 'paymentStatus',
        shipping_address: 'shippingAddress',
        billing_address: 'billingAddress',
        is_active: 'isActive',
        
        // Order Items
        order_id: 'orderId',
        product_id: 'productId',
        unit_price: 'unitPrice',
        total_price: 'totalPrice',
        is_rental: 'isRental',
        rental_days: 'rentalDays',
        
        // Cart Items
        user_id: 'userId',
        is_rental: 'isRental',
        rental_days: 'rentalDays',
        
        // Notifications
        user_id: 'userId',
        is_read: 'isRead'
    },
    
    // Application field names -> Database field names
    toDb: {
        // Products
        rentalPricePerDay: 'rental_price_per_day',
        salePrice: 'sale_price',
        isForRent: 'is_for_rent',
        isForSale: 'is_for_sale',
        isNew: 'is_new',
        isBestSeller: 'is_best_seller',
        
        // Users
        dateOfBirth: 'date_of_birth',
        isBlocked: 'is_blocked',
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        
        // Orders
        orderNumber: 'order_number',
        totalAmount: 'total_amount',
        subtotal: 'subtotal',
        taxAmount: 'tax_amount',
        shippingAmount: 'shipping_amount',
        discountAmount: 'discount_amount',
        paymentStatus: 'payment_status',
        shippingAddress: 'shipping_address',
        billingAddress: 'billing_address',
        isActive: 'is_active',
        
        // Order Items
        orderId: 'order_id',
        productId: 'product_id',
        unitPrice: 'unit_price',
        totalPrice: 'total_price',
        isRental: 'is_rental',
        rentalDays: 'rental_days',
        
        // Cart Items
        userId: 'user_id',
        isRental: 'is_rental',
        rentalDays: 'rental_days',
        
        // Notifications
        userId: 'user_id',
        isRead: 'is_read'
    }
};

// Utility functions for field mapping
export const mapFieldsToApp = (data, mapping = FIELD_MAPPING.toApp) => {
    if (Array.isArray(data)) {
        return data.map(item => mapFieldsToApp(item, mapping));
    }
    
    if (typeof data === 'object' && data !== null) {
        const mapped = {};
        for (const [key, value] of Object.entries(data)) {
            const mappedKey = mapping[key] || key;
            mapped[mappedKey] = value;
        }
        return mapped;
    }
    
    return data;
};

export const mapFieldsToDb = (data, mapping = FIELD_MAPPING.toDb) => {
    if (Array.isArray(data)) {
        return data.map(item => mapFieldsToDb(item, mapping));
    }
    
    if (typeof data === 'object' && data !== null) {
        const mapped = {};
        for (const [key, value] of Object.entries(data)) {
            const mappedKey = mapping[key] || key;
            mapped[mappedKey] = value;
        }
        return mapped;
    }
    
    return data;
};

// Product categories - matches database exactly
export const PRODUCT_CATEGORIES = [
    'Necklaces', 'Earrings', 'Bangles', 'Rings', 'Anklets', 
    'Maang Tikka', 'Mangalsutra', 'Nosepin', 'Hair Accessories', 'Waist Belt', 'Toe Rings'
];

// Product types - matches database exactly
export const PRODUCT_TYPES = [
    'Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 
    'Ruby', 'Emerald', 'Sapphire', 'Kundan', 'Polki', 'Antique', 'Meenakari', 'Temple'
];

// User roles
export const USER_ROLES = ['user', 'admin', 'staff'];

// Order statuses
export const ORDER_STATUSES = [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 
    'cancelled', 'returned', 'refunded'
];

// Payment statuses
export const PAYMENT_STATUSES = [
    'pending', 'paid', 'failed', 'refunded', 'partial_refund'
];

// Realtime events
export const REALTIME_EVENTS = {
    PRODUCTS: {
        INSERT: 'INSERT',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    },
    ORDERS: {
        INSERT: 'INSERT',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    },
    CART_ITEMS: {
        INSERT: 'INSERT',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    }
};

// Auth events
export const AUTH_EVENTS = {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED',
    USER_UPDATED: 'USER_UPDATED'
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_ERROR: 'Authentication error. Please log in again.',
    PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
    PRODUCT_ADDED: 'Product added successfully!',
    PRODUCT_UPDATED: 'Product updated successfully!',
    PRODUCT_DELETED: 'Product deleted successfully!',
    ORDER_PLACED: 'Order placed successfully!',
    ORDER_UPDATED: 'Order updated successfully!',
    CART_ITEM_ADDED: 'Item added to cart!',
    CART_ITEM_UPDATED: 'Cart item updated!',
    CART_ITEM_REMOVED: 'Item removed from cart!',
    USER_REGISTERED: 'User registered successfully!',
    USER_UPDATED: 'User updated successfully!'
};

// Error handling utility
export const handleSupabaseError = (error, context = '') => {
    console.error(`Supabase error in ${context}:`, error);
    
    if (error.code === 'PGRST116') {
        return { error: ERROR_MESSAGES.NETWORK_ERROR };
    }
    
    if (error.code === 'PGRST301') {
        return { error: ERROR_MESSAGES.AUTH_ERROR };
    }
    
    if (error.code === 'PGRST403') {
        return { error: ERROR_MESSAGES.PERMISSION_ERROR };
    }
    
    if (error.code === 'PGRST404') {
        return { error: ERROR_MESSAGES.NOT_FOUND };
    }
    
    return { error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
};

// Response formatting utility
export const formatResponse = (data, error = null) => {
    if (error) {
        return { success: false, error: error.message || error.toString(), data: null };
    }
    
    return { success: true, data, error: null };
};

// Realtime subscription utilities
export const createRealtimeSubscription = (table, event, callback) => {
    return supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
            event,
            schema: SCHEMA,
            table
        }, callback)
        .subscribe();
};

export const unsubscribeFromRealtime = (subscription) => {
    if (subscription) {
        supabase.removeChannel(subscription);
    }
};

// Batch operation utility
export const batchOperation = async (operations) => {
    const results = [];
    const errors = [];
    
    for (const operation of operations) {
        try {
            const result = await operation();
            results.push(result);
        } catch (error) {
            errors.push(error);
        }
    }
    
    return { results, errors };
};

// Pagination utility
export const paginateResults = (query, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return query.range(offset, offset + limit - 1);
};

// Search and filter utility
export const searchWithFilters = (query, filters = {}) => {
    let filteredQuery = query;
    
    for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                filteredQuery = filteredQuery.in(key, value);
            } else {
                filteredQuery = filteredQuery.eq(key, value);
            }
        }
    }
    
    return filteredQuery;
};

// File upload utility
export const uploadFile = async (file, bucket = 'products', path = '') => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
    
    if (error) {
        throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
    
    return { filePath, publicUrl };
};

// File deletion utility
export const deleteFile = async (filePath, bucket = 'products') => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
    
    if (error) {
        throw error;
    }
    
    return true;
}; 