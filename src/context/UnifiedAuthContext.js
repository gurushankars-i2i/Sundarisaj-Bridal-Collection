import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStorageAuthProvider, useLocalStorageAuth } from './LocalStorageAuthContext';
import { AUTH_CONFIG, getCurrentAuthSystem } from '../config/authConfig';

// Create a unified context that provides the appropriate auth system
export const UnifiedAuthContext = createContext();

// Custom hook that automatically uses the correct auth system
export const useUnifiedAuth = () => {
    const context = useContext(UnifiedAuthContext);
    if (!context) {
        throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
    }
    return context;
};

// Provider component that wraps the appropriate auth system
export const UnifiedAuthProvider = ({ children }) => {
    const authSystem = getCurrentAuthSystem();
    const [currentSystem, setCurrentSystem] = useState(authSystem);

    useEffect(() => {
        setCurrentSystem(authSystem);
        console.log(`🔐 Using authentication system: ${authSystem}`);
        console.log(`📋 Configuration:`, AUTH_CONFIG);
    }, [authSystem]);

    // For now, always use localStorage since Supabase is not fully implemented
    // This can be easily extended later when Supabase integration is complete
    return (
        <LocalStorageAuthProvider>
            <UnifiedAuthContext.Provider value={{ 
                authSystem: 'localStorage', 
                useAuth: useLocalStorageAuth,
                config: AUTH_CONFIG
            }}>
                {children}
            </UnifiedAuthContext.Provider>
        </LocalStorageAuthProvider>
    );
};

// Hook to get the current auth system and auth functions
export const useAuthSystem = () => {
    const { authSystem, useAuth, config } = useUnifiedAuth();
    const auth = useAuth();
    
    return {
        authSystem,
        config,
        ...auth,
        // Add system-specific utilities
        isLocalStorage: authSystem === 'localStorage',
        isSupabase: authSystem === 'supabase',
        // Add role checking functions
        hasRole: (role) => {
            if (Array.isArray(role)) {
                return auth.isAuthenticated && auth.user && role.includes(auth.user.role);
            }
            return auth.isAuthenticated && auth.user && auth.user.role === role;
        },
        // Add system switching capability (for development)
        switchToLocalStorage: () => {
            if (process.env.NODE_ENV === 'development') {
                localStorage.setItem('ssbc-auth-system-override', 'localStorage');
                window.location.reload();
            }
        },
        switchToSupabase: () => {
            if (process.env.NODE_ENV === 'development') {
                localStorage.setItem('ssbc-auth-system-override', 'supabase');
                window.location.reload();
            }
        }
    };
}; 