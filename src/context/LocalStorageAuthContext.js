import React, { createContext, useState, useEffect, useContext } from 'react';

export const LocalStorageAuthContext = createContext();

// Custom hook to use the auth context
export const useLocalStorageAuth = () => {
    const context = useContext(LocalStorageAuthContext);
    if (!context) {
        throw new Error('useLocalStorageAuth must be used within a LocalStorageAuthProvider');
    }
    return context;
};

export const LocalStorageAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load user and users from localStorage on mount
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('ssbc-current-user');
            const savedUsers = localStorage.getItem('ssbc-users');
            
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            
            // Always ensure demo users are available
            if (savedUsers) {
                const parsedUsers = JSON.parse(savedUsers);
                // Check if demo users exist, if not add them
                const hasDemoUsers = parsedUsers.some(u => 
                    u.email === 'user@example.com' || 
                    u.email === 'admin@example.com' || 
                    u.email === 'staff@example.com'
                );
                
                if (!hasDemoUsers) {
                    // Add demo users to existing users
                    const updatedUsers = [...parsedUsers, ...getDemoUsers()];
                    setUsers(updatedUsers);
                    localStorage.setItem('ssbc-users', JSON.stringify(updatedUsers));
                } else {
                    setUsers(parsedUsers);
                }
            } else {
                // No users exist, initialize with demo users
                const demoUsers = getDemoUsers();
                setUsers(demoUsers);
                localStorage.setItem('ssbc-users', JSON.stringify(demoUsers));
            }
        } catch (error) {
            console.error('Error loading auth data from localStorage:', error);
            // Fallback: always ensure demo users exist
            const demoUsers = getDemoUsers();
            setUsers(demoUsers);
            localStorage.setItem('ssbc-users', JSON.stringify(demoUsers));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to get demo users
    const getDemoUsers = () => {
        return [
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
    };

    // Function to reset demo users
    const resetDemoUsers = () => {
        const demoUsers = getDemoUsers();
        setUsers(demoUsers);
        localStorage.setItem('ssbc-users', JSON.stringify(demoUsers));
        localStorage.removeItem('ssbc-current-user');
        setUser(null);
    };

    const refreshDemoUsers = () => {
        const demoUsers = getDemoUsers();
        setUsers(demoUsers);
        localStorage.setItem('ssbc-users', JSON.stringify(demoUsers));
        return demoUsers;
    };

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('ssbc-current-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('ssbc-current-user');
        }
    }, [user]);

    // Save users to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('ssbc-users', JSON.stringify(users));
    }, [users]);

    const login = async (email, password) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const foundUser = users.find(u => 
                u.email === email && 
                u.password === password && 
                !u.isDeleted && 
                u.isActive
            );

            if (foundUser) {
                const updatedUser = {
                    ...foundUser,
                    lastLogin: new Date().toISOString()
                };
                
                setUser(updatedUser);
                
                // Update user in users array
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.id === foundUser.id ? updatedUser : u
                    )
                );
                
                return { success: true, user: updatedUser };
            } else {
                // Check if user exists but is deactivated
                const deactivatedUser = users.find(u => u.email === email && u.password === password);
                if (deactivatedUser && !deactivatedUser.isActive) {
                    return { success: false, error: 'Account has been deactivated. Please contact administrator.' };
                }
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if email already exists
            const existingUser = users.find(u => u.email === userData.email && !u.isDeleted);
            if (existingUser) {
                return false;
            }

            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                dateOfBirth: userData.dateOfBirth || '1990-01-01',
                address: userData.address || {
                    address: userData.streetAddress || '',
                    city: userData.city || '',
                    state: userData.state || '',
                    zipCode: userData.zipCode || ''
                },
                role: 'user',
                isActive: true,
                isDeleted: false,
                deletedAt: null,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            setUsers(prevUsers => [...prevUsers, newUser]);
            setUser(newUser);
            
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = () => {
        return user !== null && !user.isDeleted && user.isActive;
    };

    const getUserRole = () => {
        return user?.role || null;
    };

    const hasRole = (role) => {
        return isAuthenticated() && user.role === role;
    };

    const hasAnyRole = (roles) => {
        return isAuthenticated() && roles.includes(user.role);
    };

    const updateProfile = (updates) => {
        if (!user) return false;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === user.id ? updatedUser : u
            )
        );
        
        return true;
    };

    const updateAddress = (addressUpdates) => {
        if (!user) return false;

        const updatedUser = {
            ...user,
            address: { ...user.address, ...addressUpdates }
        };
        
        setUser(updatedUser);
        
        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === user.id ? updatedUser : u
            )
        );
        
        return true;
    };

    const deleteAccount = (userId = null) => {
        const targetUserId = userId || user?.id;
        if (!targetUserId) return false;

        // Soft delete - mark as deleted but keep data for 30 days
        const deletedUser = users.find(u => u.id === targetUserId);
        if (!deletedUser) return false;

        const updatedUser = {
            ...deletedUser,
            isDeleted: true,
            isActive: false,
            deletedAt: new Date().toISOString()
        };

        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === targetUserId ? updatedUser : u
            )
        );

        // If deleting current user, log them out
        if (targetUserId === user?.id) {
            setUser(null);
        }

        return true;
    };

    const recoverAccount = (userId) => {
        const deletedUser = users.find(u => u.id === userId && u.isDeleted);
        if (!deletedUser) return false;

        // Check if 30 days have passed
        const deletedAt = new Date(deletedUser.deletedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (deletedAt < thirtyDaysAgo) {
            return false; // Account permanently deleted
        }

        const recoveredUser = {
            ...deletedUser,
            isDeleted: false,
            isActive: true,
            deletedAt: null
        };

        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === userId ? recoveredUser : u
            )
        );

        return true;
    };

    const blockUser = (userId) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return false;

        const updatedUser = {
            ...targetUser,
            isActive: false
        };

        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === userId ? updatedUser : u
            )
        );

        // If blocking current user, log them out
        if (userId === user?.id) {
            setUser(null);
        }

        return true;
    };

    const unblockUser = (userId) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return false;

        const updatedUser = {
            ...targetUser,
            isActive: true
        };

        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === userId ? updatedUser : u
            )
        );

        return true;
    };

    const getAllUsers = () => {
        return users.filter(u => !u.isDeleted);
    };

    const getActiveUsers = () => {
        return users.filter(u => !u.isDeleted && u.isActive);
    };

    const getBlockedUsers = () => {
        return users.filter(u => !u.isDeleted && !u.isActive);
    };

    const getDeletedUsers = () => {
        return users.filter(u => u.isDeleted);
    };

    const getUserById = (userId) => {
        return users.find(u => u.id === userId);
    };

    const getUserStatistics = () => {
        const activeUsers = getActiveUsers();
        const blockedUsers = getBlockedUsers();
        const deletedUsers = getDeletedUsers();
        const totalUsers = users.length;

        return {
            totalUsers,
            activeUsers: activeUsers.length,
            blockedUsers: blockedUsers.length,
            deletedUsers: deletedUsers.length,
            newUsersThisMonth: activeUsers.filter(u => {
                const createdAt = new Date(u.createdAt);
                const thisMonth = new Date();
                return createdAt.getMonth() === thisMonth.getMonth() && 
                       createdAt.getFullYear() === thisMonth.getFullYear();
            }).length
        };
    };

    const cleanupDeletedAccounts = () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const accountsToDelete = users.filter(u => 
            u.isDeleted && new Date(u.deletedAt) < thirtyDaysAgo
        );

        if (accountsToDelete.length > 0) {
            setUsers(prevUsers => 
                prevUsers.filter(u => 
                    !u.isDeleted || new Date(u.deletedAt) >= thirtyDaysAgo
                )
            );
            return accountsToDelete.length;
        }

        return 0;
    };

    return (
        <LocalStorageAuthContext.Provider value={{
            user,
            users,
            isLoading,
            login,
            register,
            logout,
            isAuthenticated,
            getUserRole,
            hasRole,
            hasAnyRole,
            updateProfile,
            updateAddress,
            deleteAccount,
            recoverAccount,
            blockUser,
            unblockUser,
            getAllUsers,
            getActiveUsers,
            getBlockedUsers,
            getDeletedUsers,
            getUserById,
            getUserStatistics,
            cleanupDeletedAccounts,
            resetDemoUsers,
            refreshDemoUsers
        }}>
            {children}
        </LocalStorageAuthContext.Provider>
    );
}; 