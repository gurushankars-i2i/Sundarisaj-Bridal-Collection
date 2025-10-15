import { supabase, TABLES, handleSupabaseError, formatResponse } from '../config/supabase';

// =====================================================
// AUTHENTICATION SERVICES
// =====================================================

export const authService = {
    // Sign up new user
    async signUp(userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        phone: userData.phone,
                        role: 'user'
                    }
                }
            });

            if (error) throw error;

            // Create user profile in our custom table
            if (data.user) {
                const { error: profileError } = await supabase
                    .from(TABLES.USERS)
                    .insert({
                        id: data.user.id,
                        email: userData.email,
                        name: userData.name,
                        role: 'user',
                        address: userData.address || '',
                        phone: userData.phone,
                        is_active: true
                    });

                if (profileError) throw profileError;
            }

            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get user profile from our custom table
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from(TABLES.USERS)
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    // Don't throw error, just return auth data without profile
                    return formatResponse({ ...data, profile: null }, null);
                }

                return formatResponse({ ...data, profile }, null);
            }

            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return formatResponse({ success: true }, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;

            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from(TABLES.USERS)
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    // Don't throw error, just return user data without profile
                    return formatResponse({ ...user, profile: null }, null);
                }

                return formatResponse({ ...user, profile }, null);
            }

            return formatResponse(null, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update user profile
    async updateProfile(userId, updates) {
        try {
            // First check if user exists
            const { data: existingUser, error: checkError } = await supabase
                .from(TABLES.USERS)
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (checkError) throw checkError;

            if (!existingUser) {
                // User doesn't exist in database, create them
                const { data, error } = await supabase
                    .from(TABLES.USERS)
                    .insert({
                        id: userId,
                        ...updates,
                        is_active: true
                    })
                    .select()
                    .single();

                if (error) throw error;
                return formatResponse(data, null);
            } else {
                // User exists, update them
                const { data, error } = await supabase
                    .from(TABLES.USERS)
                    .update(updates)
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) throw error;
                return formatResponse(data, null);
            }
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Delete user account (soft delete)
    async deleteAccount(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({
                    is_active: false,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Hard delete user account (permanent deletion for GDPR compliance)
    async permanentlyDeleteAccount(userId) {
        try {
            // Start a transaction to delete all user data
            const { data, error } = await supabase.rpc('permanently_delete_user_account', {
                user_id: userId
            });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Request account deletion (for GDPR compliance)
    async requestAccountDeletion(userId, reason = '') {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({
                    deletion_requested_at: new Date().toISOString(),
                    deletion_reason: reason,
                    is_active: false
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Cancel account deletion request
    async cancelAccountDeletion(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({
                    deletion_requested_at: null,
                    deletion_reason: null,
                    is_active: true
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get user's data export (for GDPR compliance)
    async exportUserData(userId) {
        try {
            const { data, error } = await supabase.rpc('export_user_data', {
                user_id: userId
            });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get account deletion status
    async getAccountDeletionStatus(userId) {
        try {
            const { data, error } = await supabase.rpc('get_account_deletion_status', {
                user_id: userId
            });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Recover user account
    async recoverAccount(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({
                    is_active: true,
                    deleted_at: null,
                    deletion_requested_at: null,
                    deletion_reason: null
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// PRODUCT SERVICES
// =====================================================

export const productService = {
    // Get all products
    async getAllProducts() {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get product by ID
    async getProductById(productId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('id', productId)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get products by category
    async getProductsByCategory(category) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('category', category)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get best sellers
    async getBestSellers() {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_best_seller', true)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Search products
    async searchProducts(searchTerm, filters = {}) {
        try {
            let query = supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_active', true);

            // Add search term
            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            // Add filters
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }
            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Add new product (admin only)
    async addProduct(productData) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .insert(productData)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update product (admin only)
    async updateProduct(productId, updates) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .update(updates)
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Delete product (admin only)
    async deleteProduct(productId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ is_active: false })
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update product stock
    async updateProductStock(productId, newStock) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ stock_quantity: Math.max(0, newStock) })
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// CART SERVICES
// =====================================================

export const cartService = {
    // Get user's cart
    async getUserCart(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.CART_ITEMS)
                .select(`
                    *,
                    products (*)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Add item to cart
    async addToCart(userId, productId, quantity, isRental = false, rentalDays = 1) {
        try {
            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .from(TABLES.CART_ITEMS)
                .select('*')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('is_rental', isRental)
                .single();

            if (existingItem) {
                // Update quantity
                const { data, error } = await supabase
                    .from(TABLES.CART_ITEMS)
                    .update({
                        quantity: existingItem.quantity + quantity,
                        rental_days: isRental ? rentalDays : existingItem.rental_days
                    })
                    .eq('id', existingItem.id)
                    .select()
                    .single();

                if (error) throw error;
                return formatResponse(data, null);
            } else {
                // Add new item
                const { data, error } = await supabase
                    .from(TABLES.CART_ITEMS)
                    .insert({
                        user_id: userId,
                        product_id: productId,
                        quantity,
                        is_rental: isRental,
                        rental_days: isRental ? rentalDays : null
                    })
                    .select()
                    .single();

                if (error) throw error;
                return formatResponse(data, null);
            }
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update cart item quantity
    async updateCartItemQuantity(cartItemId, quantity) {
        try {
            const { data, error } = await supabase
                .from(TABLES.CART_ITEMS)
                .update({ quantity })
                .eq('id', cartItemId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Remove item from cart
    async removeFromCart(cartItemId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.CART_ITEMS)
                .delete()
                .eq('id', cartItemId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Clear user's cart
    async clearCart(userId) {
        try {
            const { error } = await supabase
                .from(TABLES.CART_ITEMS)
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return formatResponse({ success: true }, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// ORDER SERVICES
// =====================================================

export const orderService = {
    // Get user's orders
    async getUserOrders(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .select(`
                    *,
                    order_items (
                        *,
                        products (*)
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get all orders (admin only)
    async getAllOrders() {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .select(`
                    *,
                    users (first_name, last_name, email),
                    order_items (
                        *,
                        products (*)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Place new order
    async placeOrder(orderData) {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .insert(orderData)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Cancel order
    async cancelOrder(orderId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .update({ status: 'cancelled' })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// NOTIFICATION SERVICES
// =====================================================

export const notificationService = {
    // Get user's notifications
    async getUserNotifications(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Add notification
    async addNotification(notificationData) {
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .insert(notificationData)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Mark notification as read
    async markNotificationAsRead(notificationId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({ is_read: true })
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .delete()
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Clear all notifications for user
    async clearAllNotifications(userId) {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return formatResponse({ success: true }, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// USER ADDRESS SERVICES
// =====================================================

export const addressService = {
    // Get user's addresses
    async getUserAddresses(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USER_ADDRESSES)
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Add new address
    async addAddress(addressData) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USER_ADDRESSES)
                .insert(addressData)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update address
    async updateAddress(addressId, updates) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USER_ADDRESSES)
                .update(updates)
                .eq('id', addressId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Delete address
    async deleteAddress(addressId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USER_ADDRESSES)
                .delete()
                .eq('id', addressId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Set default address
    async setDefaultAddress(userId, addressId) {
        try {
            // First, unset all default addresses for user
            await supabase
                .from(TABLES.USER_ADDRESSES)
                .update({ is_default: false })
                .eq('user_id', userId);

            // Then set the new default
            const { data, error } = await supabase
                .from(TABLES.USER_ADDRESSES)
                .update({ is_default: true })
                .eq('id', addressId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// ADMIN SERVICES
// =====================================================

export const adminService = {
    // Get deletion statistics
    async getDeletionStatistics() {
        try {
            const { data, error } = await supabase.rpc('get_deletion_statistics');
            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Cleanup old deleted accounts
    async cleanupOldDeletedAccounts() {
        try {
            const { data, error } = await supabase.rpc('cleanup_old_deleted_accounts');
            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get all users (admin only)
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Get user by ID (admin only)
    async getUserById(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Update user (admin only)
    async updateUser(userId, updates) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Block user (admin only)
    async blockUser(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({ is_active: false })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    },

    // Unblock user (admin only)
    async unblockUser(userId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update({ is_active: true })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return formatResponse(data, null);
        } catch (error) {
            return formatResponse(null, error);
        }
    }
};

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export const realtimeService = {
    // Subscribe to cart changes
    subscribeToCart(userId, callback) {
        return supabase
            .channel(`cart-${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'sundarisaaj_bridal_collection',
                table: 'cart_items',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    // Subscribe to order changes
    subscribeToOrders(userId, callback) {
        return supabase
            .channel(`orders-${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'sundarisaaj_bridal_collection',
                table: 'orders',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    // Subscribe to notifications
    subscribeToNotifications(userId, callback) {
        return supabase
            .channel(`notifications-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'sundarisaaj_bridal_collection',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    // Subscribe to product changes (admin)
    subscribeToProducts(callback) {
        return supabase
            .channel('products')
            .on('postgres_changes', {
                event: '*',
                schema: 'sundarisaaj_bridal_collection',
                table: 'products'
            }, callback)
            .subscribe();
    }
};

export default {
    authService,
    productService,
    cartService,
    orderService,
    notificationService,
    addressService,
    adminService,
    realtimeService
}; 