// LocalStorage to Supabase Migration Utility
import { authService, productService, cartService, orderService, notificationService, addressService } from '../services/supabaseService';

// =====================================================
// MIGRATION UTILITIES
// =====================================================

export const migrationUtils = {
    // Export localStorage data for migration
    exportLocalStorageData() {
        try {
            const data = {
                users: JSON.parse(localStorage.getItem('ssbc-users') || '[]'),
                currentUser: JSON.parse(localStorage.getItem('ssbc-current-user') || 'null'),
                products: JSON.parse(localStorage.getItem('sundarisaj-products') || '[]'),
                categories: JSON.parse(localStorage.getItem('ssbc-categories') || '[]'),
                notifications: JSON.parse(localStorage.getItem('ssbc-notifications') || '[]'),
                // User-specific data (will be migrated per user)
                userCarts: {},
                userOrders: {},
                userAddresses: {}
            };

            // Get all user-specific cart and order data
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('sundarisaj-cart-')) {
                    const email = key.replace('sundarisaj-cart-', '');
                    data.userCarts[email] = JSON.parse(localStorage.getItem(key) || '[]');
                }
                if (key.startsWith('sundarisaj-orders-')) {
                    const email = key.replace('sundarisaj-orders-', '');
                    data.userOrders[email] = JSON.parse(localStorage.getItem(key) || '[]');
                }
            }

            return data;
        } catch (error) {
            console.error('Error exporting localStorage data:', error);
            return null;
        }
    },

    // Migrate data to Supabase
    async migrateToSupabase() {
        try {
            const data = this.exportLocalStorageData();
            if (!data) {
                throw new Error('Failed to export localStorage data');
            }

            console.log('Starting migration to Supabase...');

            // Migrate users
            for (const user of data.users) {
                if (user.email && user.password) {
                    try {
                        // Create user account
                        const signUpResult = await authService.signUp({
                            firstName: user.name?.split(' ')[0] || user.first_name || 'User',
                            lastName: user.name?.split(' ').slice(1).join(' ') || user.last_name || '',
                            email: user.email,
                            password: user.password,
                            phone: user.phone || '',
                            dateOfBirth: user.dateOfBirth || user.date_of_birth || '1990-01-01'
                        });

                        if (signUpResult.success) {
                            console.log(`Migrated user: ${user.email}`);
                        }
                    } catch (error) {
                        console.error(`Failed to migrate user ${user.email}:`, error);
                    }
                }
            }

            // Migrate products
            for (const product of data.products) {
                try {
                    const productData = {
                        name: product.name,
                        description: product.description || '',
                        category: product.category || 'necklace',
                        type: product.type || 'gold',
                        price: product.price || 0,
                        rental_price_per_day: product.rentalPricePerDay || product.rental_price_per_day || 0,
                        stock_quantity: product.stock || product.stockQuantity || 0,
                        images: product.images || [],
                        is_best_seller: product.isBestSeller || false,
                        is_new_arrival: product.isNew || false,
                        is_active: true
                    };

                    const result = await productService.addProduct(productData);
                    if (result.success) {
                        console.log(`Migrated product: ${product.name}`);
                    }
                } catch (error) {
                    console.error(`Failed to migrate product ${product.name}:`, error);
                }
            }

            console.log('Migration completed!');
            return { success: true, message: 'Migration completed successfully' };
        } catch (error) {
            console.error('Migration failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Clear localStorage after successful migration
    clearLocalStorage() {
        try {
            // Clear all application data
            const keysToRemove = [
                'ssbc-users',
                'ssbc-current-user',
                'sundarisaj-products',
                'ssbc-categories',
                'ssbc-notifications',
                'sundarisaj-all-orders'
            ];

            // Remove user-specific data
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith('sundarisaj-cart-') || 
                    key.startsWith('sundarisaj-orders-') ||
                    keysToRemove.includes(key)) {
                    localStorage.removeItem(key);
                }
            }

            console.log('LocalStorage cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// =====================================================
// FALLBACK UTILITIES
// =====================================================

export const fallbackUtils = {
    // Check if Supabase is available
    isSupabaseAvailable() {
        // Check if Supabase URL and key are available (either from env or hardcoded)
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://huefhxldlkbjltzlcbuo.supabase.co';
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZWZoeGxkbGtiamx0emxjYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjg4MjEsImV4cCI6MjA2OTcwNDgyMX0.Xoc5U-43rZzgUsyGJ-5pomsWykka7xgTwRs4IWq2kb0';
        return !!(supabaseUrl && supabaseKey);
    },

    // Get data with fallback to localStorage
    async getDataWithFallback(supabaseFunction, localStorageKey, transformFunction = null) {
        try {
            if (this.isSupabaseAvailable()) {
                const result = await supabaseFunction();
                if (result.success) {
                    return result.data;
                }
            }
        } catch (error) {
            console.warn('Supabase unavailable, falling back to localStorage:', error);
        }

        // Fallback to localStorage
        try {
            const data = localStorage.getItem(localStorageKey);
            if (data) {
                const parsedData = JSON.parse(data);
                return transformFunction ? transformFunction(parsedData) : parsedData;
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }

        return null;
    },

    // Save data with fallback to localStorage
    async saveDataWithFallback(supabaseFunction, localStorageKey, data) {
        try {
            if (this.isSupabaseAvailable()) {
                const result = await supabaseFunction(data);
                if (result.success) {
                    return result.data;
                }
            }
        } catch (error) {
            console.warn('Supabase unavailable, falling back to localStorage:', error);
        }

        // Fallback to localStorage
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    }
};

// =====================================================
// HYBRID STORAGE UTILITIES
// =====================================================

export const hybridStorage = {
    // Initialize storage based on availability
    async initialize() {
        const isSupabaseReady = this.isSupabaseAvailable();
        
        if (isSupabaseReady) {
            console.log('Using Supabase for data storage');
            return 'supabase';
        } else {
            console.log('Using localStorage for data storage (fallback mode)');
            return 'localStorage';
        }
    },

    // Get storage mode
    getStorageMode() {
        return this.isSupabaseAvailable() ? 'supabase' : 'localStorage';
    },

    // Sync localStorage to Supabase when connection is restored
    async syncToSupabase() {
        if (!this.isSupabaseAvailable()) {
            return { success: false, message: 'Supabase not available' };
        }

        try {
            const result = await migrationUtils.migrateToSupabase();
            if (result.success) {
                migrationUtils.clearLocalStorage();
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Check for data conflicts between localStorage and Supabase
    async checkDataConflicts() {
        if (!this.isSupabaseAvailable()) {
            return { hasConflicts: false, message: 'Supabase not available' };
        }

        try {
            const localData = migrationUtils.exportLocalStorageData();
            const supabaseUsers = await authService.getCurrentUser();
            const supabaseProducts = await productService.getAllProducts();

            const conflicts = {
                users: localData.users.length !== (supabaseUsers?.data?.length || 0),
                products: localData.products.length !== (supabaseProducts?.data?.length || 0),
                hasLocalData: localData.users.length > 0 || localData.products.length > 0
            };

            return {
                hasConflicts: conflicts.users || conflicts.products,
                conflicts,
                message: conflicts.hasLocalData ? 'Local data found, migration recommended' : 'No conflicts detected'
            };
        } catch (error) {
            return { hasConflicts: false, error: error.message };
        }
    }
};

// =====================================================
// MIGRATION STATUS TRACKING
// =====================================================

export const migrationStatus = {
    // Check migration status
    getStatus() {
        try {
            const status = localStorage.getItem('ssbc-migration-status');
            return status ? JSON.parse(status) : { migrated: false, date: null };
        } catch (error) {
            return { migrated: false, date: null };
        }
    },

    // Set migration status
    setStatus(migrated, date = new Date().toISOString()) {
        try {
            localStorage.setItem('ssbc-migration-status', JSON.stringify({ migrated, date }));
        } catch (error) {
            console.error('Error setting migration status:', error);
        }
    },

    // Check if migration is needed
    isMigrationNeeded() {
        const status = this.getStatus();
        const hasLocalData = migrationUtils.exportLocalStorageData();
        
        return !status.migrated && hasLocalData && 
               (hasLocalData.users.length > 0 || hasLocalData.products.length > 0);
    }
};

export default {
    migrationUtils,
    fallbackUtils,
    hybridStorage,
    migrationStatus
}; 