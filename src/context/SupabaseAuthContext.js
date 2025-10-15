import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabaseService';
import { fallbackUtils } from '../utils/localStorageMigration';

const SupabaseAuthContext = createContext();

export const useSupabaseAuth = () => {
    const context = useContext(SupabaseAuthContext);
    if (!context) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }
    return context;
};

export const SupabaseAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('localStorage'); // 'supabase' or 'localStorage'

    // Initialize authentication
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            setIsLoading(true);
            
            // Always use Supabase mode
            setStorageMode('supabase');
            console.log('🔧 Initializing Supabase authentication...');

            // Try to get current user from Supabase
            const result = await authService.getCurrentUser();
            console.log('📡 Supabase auth result:', result);
            
            if (result.success && result.data) {
                setUser(result.data);
                console.log('✅ User loaded from Supabase:', result.data);
            } else {
                console.log('ℹ️  No current user in Supabase');
            }
            
        } catch (error) {
            console.error('❌ Error initializing Supabase auth:', error);
            // Don't fallback to localStorage - keep Supabase mode
            console.log('⚠️  Supabase auth failed, but staying in Supabase mode');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login with Supabase...');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password ? '***' : 'empty');
            
            // Always use Supabase
            const result = await authService.signIn(email, password);
            console.log('📡 Supabase login result:', result);
            
            if (result.success) {
                setUser(result.data);
                console.log('✅ Login successful:', result.data);
                return { success: true, user: result.data };
            } else {
                console.log('❌ Login failed:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            if (storageMode === 'supabase') {
                await authService.signOut();
            }
            setUser(null);
            localStorage.removeItem('ssbc-current-user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Attempting registration with Supabase...');
            console.log('👤 User data:', { ...userData, password: '***' });
            
            // Always use Supabase
            const result = await authService.signUp(userData);
            console.log('📡 Supabase registration result:', result);
            
            if (result.success) {
                setUser(result.data);
                console.log('✅ Registration successful:', result.data);
                return { success: true, user: result.data };
            } else {
                console.log('❌ Registration failed:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (userId, updates) => {
        try {
            if (storageMode === 'supabase') {
                const result = await authService.updateProfile(userId, updates);
                if (result.success) {
                    setUser(result.data);
                    return { success: true, user: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage update
                const updatedUsers = users.map(u => 
                    u.id === userId ? { ...u, ...updates } : u
                );
                setUsers(updatedUsers);
                
                if (user && user.id === userId) {
                    const updatedUser = { ...user, ...updates };
                    setUser(updatedUser);
                    localStorage.setItem('ssbc-current-user', JSON.stringify(updatedUser));
                }
                
                localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                return { success: true, user: user };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    };

    const deleteAccount = async (userId) => {
        try {
            if (storageMode === 'supabase') {
                const result = await authService.deleteAccount(userId);
                if (result.success) {
                    if (user && user.id === userId) {
                        setUser(null);
                        localStorage.removeItem('ssbc-current-user');
                    }
                    return { success: true };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage soft delete
                const updatedUsers = users.map(u => 
                    u.id === userId ? { ...u, isActive: false, deletedAt: new Date().toISOString() } : u
                );
                setUsers(updatedUsers);
                
                if (user && user.id === userId) {
                    setUser(null);
                    localStorage.removeItem('ssbc-current-user');
                }
                
                localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                return { success: true };
            }
        } catch (error) {
            console.error('Account deletion error:', error);
            return { success: false, error: error.message };
        }
    };

    const recoverAccount = async (userId) => {
        try {
            if (storageMode === 'supabase') {
                const result = await authService.recoverAccount(userId);
                if (result.success) {
                    return { success: true, user: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage recovery
                const updatedUsers = users.map(u => 
                    u.id === userId ? { ...u, isActive: true, deletedAt: null } : u
                );
                setUsers(updatedUsers);
                localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                return { success: true };
            }
        } catch (error) {
            console.error('Account recovery error:', error);
            return { success: false, error: error.message };
        }
    };

    const blockUser = async (userId) => {
        try {
            if (storageMode === 'supabase') {
                const result = await authService.blockUser(userId);
                if (result.success) {
                    return { success: true, user: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage block
                const updatedUsers = users.map(u => 
                    u.id === userId ? { ...u, isBlocked: true } : u
                );
                setUsers(updatedUsers);
                localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                return { success: true };
            }
        } catch (error) {
            console.error('User block error:', error);
            return { success: false, error: error.message };
        }
    };

    const unblockUser = async (userId) => {
        try {
            if (storageMode === 'supabase') {
                const result = await authService.unblockUser(userId);
                if (result.success) {
                    return { success: true, user: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage unblock
                const updatedUsers = users.map(u => 
                    u.id === userId ? { ...u, isBlocked: false } : u
                );
                setUsers(updatedUsers);
                localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                return { success: true };
            }
        } catch (error) {
            console.error('User unblock error:', error);
            return { success: false, error: error.message };
        }
    };

    const isAuthenticated = () => {
        // User is authenticated if we have user data (either from auth or profile)
        return !!user;
    };

    const getUserRole = () => {
        // Check if user has a profile with role
        if (user?.profile?.role) {
            return user.profile.role;
        }
        // Check if user object itself has role (for backward compatibility)
        if (user?.role) {
            return user.role;
        }
        // Default to guest if no role found
        return 'guest';
    };

    const resetDemoUsers = () => {
        const demoUsers = [
            {
                id: '1',
                name: 'Demo User',
                email: 'user@example.com',
                password: 'password123',
                phone: '+91 9876543210',
                dateOfBirth: '1990-01-01',
                address: {
                    address: '123 Demo Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001'
                },
                role: 'user',
                isActive: true,
                isDeleted: false,
                deletedAt: null,
                createdAt: '2024-01-01T00:00:00.000Z',
                lastLogin: null
            },
            {
                id: '2',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '+91 9876543211',
                dateOfBirth: '1985-01-01',
                address: {
                    address: '456 Admin Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400002'
                },
                role: 'admin',
                isActive: true,
                isDeleted: false,
                deletedAt: null,
                createdAt: '2024-01-01T00:00:00.000Z',
                lastLogin: null
            },
            {
                id: '3',
                name: 'Staff User',
                email: 'staff@example.com',
                password: 'staff123',
                phone: '+91 9876543212',
                dateOfBirth: '1988-01-01',
                address: {
                    address: '789 Staff Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400003'
                },
                role: 'staff',
                isActive: true,
                isDeleted: false,
                deletedAt: null,
                createdAt: '2024-01-01T00:00:00.000Z',
                lastLogin: null
            }
        ];
        setUsers(demoUsers);
        localStorage.setItem('ssbc-users', JSON.stringify(demoUsers));
        localStorage.removeItem('ssbc-current-user');
        setUser(null);
    };

    const value = {
        user,
        users,
        isLoading,
        storageMode,
        login,
        logout,
        register,
        updateProfile,
        deleteAccount,
        recoverAccount,
        blockUser,
        unblockUser,
        isAuthenticated,
        getUserRole,
        resetDemoUsers
    };

    return (
        <SupabaseAuthContext.Provider value={value}>
            {children}
        </SupabaseAuthContext.Provider>
    );
}; 