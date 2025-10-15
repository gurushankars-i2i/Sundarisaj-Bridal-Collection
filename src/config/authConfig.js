// Authentication System Configuration
export const AUTH_CONFIG = {
    // Current authentication system
    SYSTEM: process.env.REACT_APP_AUTH_SYSTEM || 'localStorage',
    
    // Available systems
    SYSTEMS: {
        LOCAL_STORAGE: 'localStorage',
        SUPABASE: 'supabase'
    },
    
    // Feature flags
    FEATURES: {
        ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
        ENABLE_GUEST_CART: process.env.REACT_APP_ENABLE_GUEST_CART === 'true',
        ENABLE_ROLE_BASED_ACCESS: process.env.REACT_APP_ENABLE_ROLE_BASED_ACCESS === 'true'
    },
    
    // Supabase configuration (only used when SYSTEM = 'supabase')
    SUPABASE: {
        URL: process.env.REACT_APP_SUPABASE_URL,
        ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
    },
    
    // localStorage configuration
    LOCAL_STORAGE: {
        USER_KEY: 'ssbc-current-user',
        USERS_KEY: 'ssbc-users',
        CART_KEY: 'ssbc-cart',
        ORDERS_KEY: 'ssbc-orders',
        GUEST_CART_KEY: 'ssbc-guest-cart'
    }
};

// Helper functions
export const isLocalStorage = () => AUTH_CONFIG.SYSTEM === AUTH_CONFIG.SYSTEMS.LOCAL_STORAGE;
export const isSupabase = () => AUTH_CONFIG.SYSTEM === AUTH_CONFIG.SYSTEMS.SUPABASE;

// Get current auth system
export const getCurrentAuthSystem = () => AUTH_CONFIG.SYSTEM;

// Check if feature is enabled
export const isFeatureEnabled = (feature) => AUTH_CONFIG.FEATURES[feature] || false; 