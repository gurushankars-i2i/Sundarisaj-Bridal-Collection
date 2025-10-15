import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, orderService } from '../services/supabaseService';
import { fallbackUtils } from '../utils/localStorageMigration';
import { useSupabaseAuth } from './SupabaseAuthContext';

const SupabaseCartContext = createContext();

export const useSupabaseCart = () => {
    const context = useContext(SupabaseCartContext);
    if (!context) {
        throw new Error('useSupabaseCart must be used within a SupabaseCartProvider');
    }
    return context;
};

export const SupabaseCartProvider = ({ children }) => {
    const { user, isAuthenticated } = useSupabaseAuth();
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('localStorage');

    // Initialize cart and orders when user changes
    useEffect(() => {
        if (user) {
            initializeCartAndOrders();
        } else {
            setCart([]);
            setOrders([]);
            setIsLoading(false);
        }
    }, [user]);

    const initializeCartAndOrders = async () => {
        try {
            setIsLoading(true);
            
            // Check if Supabase is available
            const isSupabaseAvailable = fallbackUtils.isSupabaseAvailable();
            setStorageMode(isSupabaseAvailable ? 'supabase' : 'localStorage');

            if (isSupabaseAvailable && user?.id) {
                // Load from Supabase
                await Promise.all([
                    loadCartFromSupabase(),
                    loadOrdersFromSupabase(),
                    loadAllOrdersFromSupabase()
                ]);
            } else {
                // Load from localStorage
                await loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error initializing cart and orders:', error);
            await loadFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const loadCartFromSupabase = async () => {
        try {
            const result = await cartService.getUserCart(user.id);
            if (result.success) {
                setCart(result.data || []);
            }
        } catch (error) {
            console.error('Error loading cart from Supabase:', error);
        }
    };

    const loadOrdersFromSupabase = async () => {
        try {
            const result = await orderService.getUserOrders(user.id);
            if (result.success) {
                setOrders(result.data || []);
            }
        } catch (error) {
            console.error('Error loading orders from Supabase:', error);
        }
    };

    const loadAllOrdersFromSupabase = async () => {
        try {
            if (user?.role === 'admin') {
                const result = await orderService.getAllOrders();
                if (result.success) {
                    setAllOrders(result.data || []);
                }
            }
        } catch (error) {
            console.error('Error loading all orders from Supabase:', error);
        }
    };

    const loadFromLocalStorage = async () => {
        try {
            const cartKey = getCartKey();
            const ordersKey = getOrdersKey();
            const allOrdersKey = getAllOrdersKey();

            const savedCart = localStorage.getItem(cartKey);
            const savedOrders = localStorage.getItem(ordersKey);
            const savedAllOrders = localStorage.getItem(allOrdersKey);

            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }

            if (savedOrders) {
                setOrders(JSON.parse(savedOrders));
            }

            if (savedAllOrders) {
                setAllOrders(JSON.parse(savedAllOrders));
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    };

    // Generate user-specific localStorage keys
    const getCartKey = () => {
        if (isAuthenticated() && user?.email) {
            return `sundarisaj-cart-${user.email}`;
        }
        return 'sundarisaj-cart-guest';
    };

    const getOrdersKey = () => {
        if (isAuthenticated() && user?.email) {
            return `sundarisaj-orders-${user.email}`;
        }
        return 'sundarisaj-orders-guest';
    };

    const getAllOrdersKey = () => {
        return 'sundarisaj-all-orders';
    };

    // Save cart to storage
    useEffect(() => {
        if (cart.length > 0) {
            if (storageMode === 'localStorage') {
                const cartKey = getCartKey();
                localStorage.setItem(cartKey, JSON.stringify(cart));
            }
        }
    }, [cart, storageMode]);

    // Save orders to storage
    useEffect(() => {
        if (orders.length > 0) {
            if (storageMode === 'localStorage') {
                const ordersKey = getOrdersKey();
                localStorage.setItem(ordersKey, JSON.stringify(orders));
            }
        }
    }, [orders, storageMode]);

    // Save all orders to storage
    useEffect(() => {
        if (allOrders.length > 0) {
            if (storageMode === 'localStorage') {
                const allOrdersKey = getAllOrdersKey();
                localStorage.setItem(allOrdersKey, JSON.stringify(allOrders));
            }
        }
    }, [allOrders, storageMode]);

    const addToCart = async (product, quantity = 1, purchaseType = 'sale', rentalDays = 1) => {
        try {
            const productToAdd = {
                ...product,
                quantity,
                purchaseType,
                rentalDays,
                purchaseDescription: purchaseType === 'rent' 
                    ? `Rent for ${rentalDays} day(s)` 
                    : 'Purchase'
            };

            if (storageMode === 'supabase' && user?.id) {
                const result = await cartService.addToCart(
                    user.id, 
                    product.id, 
                    quantity, 
                    purchaseType === 'rent', 
                    rentalDays
                );
                
                if (result.success) {
                    await loadCartFromSupabase(); // Refresh cart
                    return { success: true, cartItem: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage
                setCart(prevCart => {
                    const existingItemIndex = prevCart.findIndex(item => 
                        item.id === productToAdd.id && item.purchaseType === productToAdd.purchaseType
                    );

                    if (existingItemIndex >= 0) {
                        const updatedCart = [...prevCart];
                        updatedCart[existingItemIndex].quantity += productToAdd.quantity;
                        return updatedCart;
                    } else {
                        return [...prevCart, productToAdd];
                    }
                });
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (storageMode === 'supabase' && user?.id) {
                // Find the cart item ID
                const cartItem = cart.find(item => item.product_id === productId || item.id === productId);
                if (cartItem?.id) {
                    const result = await cartService.removeFromCart(cartItem.id);
                    if (result.success) {
                        await loadCartFromSupabase(); // Refresh cart
                        return { success: true };
                    } else {
                        return { success: false, error: result.error };
                    }
                }
            } else {
                // Fallback to localStorage
                setCart(prevCart => prevCart.filter(item => item.id !== productId));
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    };

    const updateCartQuantity = async (productId, newQuantity) => {
        try {
            if (storageMode === 'supabase' && user?.id) {
                // Find the cart item ID
                const cartItem = cart.find(item => item.product_id === productId || item.id === productId);
                if (cartItem?.id) {
                    const result = await cartService.updateCartItemQuantity(cartItem.id, newQuantity);
                    if (result.success) {
                        await loadCartFromSupabase(); // Refresh cart
                        return { success: true, cartItem: result.data };
                    } else {
                        return { success: false, error: result.error };
                    }
                }
            } else {
                // Fallback to localStorage
                setCart(prevCart => 
                    prevCart.map(item => 
                        item.id === productId 
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                );
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return { success: false, error: error.message };
        }
    };

    const clearCart = async () => {
        try {
            if (storageMode === 'supabase' && user?.id) {
                const result = await cartService.clearCart(user.id);
                if (result.success) {
                    setCart([]);
                    return { success: true };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage
                setCart([]);
                return { success: true };
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.message };
        }
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.purchaseType === 'rent' 
                ? (item.rental_price_per_day || item.rentalPricePerDay || 0) * item.rentalDays
                : (item.price || 0);
            return total + (price * item.quantity);
        }, 0);
    };

    const placeOrder = async (orderData) => {
        try {
            const orderWithItems = {
                ...orderData,
                user_id: user?.id,
                order_number: `ORD-${Date.now()}`,
                status: 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (storageMode === 'supabase' && user?.id) {
                const result = await orderService.placeOrder(orderWithItems);
                if (result.success) {
                    // Clear cart after successful order
                    await clearCart();
                    // Refresh orders
                    await loadOrdersFromSupabase();
                    await loadAllOrdersFromSupabase();
                    return { success: true, order: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage
                const newOrder = {
                    ...orderWithItems,
                    id: Date.now().toString(),
                    items: cart.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        unit_price: item.purchaseType === 'rent' 
                            ? (item.rental_price_per_day || item.rentalPricePerDay || 0) * item.rentalDays
                            : (item.price || 0),
                        is_rental: item.purchaseType === 'rent',
                        rental_days: item.rentalDays
                    }))
                };

                setOrders(prev => [newOrder, ...prev]);
                setAllOrders(prev => [newOrder, ...prev]);
                setCart([]);
                return { success: true, order: newOrder };
            }
        } catch (error) {
            console.error('Error placing order:', error);
            return { success: false, error: error.message };
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            if (storageMode === 'supabase' && user?.id) {
                const result = await orderService.cancelOrder(orderId);
                if (result.success) {
                    await loadOrdersFromSupabase();
                    await loadAllOrdersFromSupabase();
                    return { success: true, order: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage
                setOrders(prev => 
                    prev.map(order => 
                        order.id === orderId 
                            ? { ...order, status: 'cancelled' }
                            : order
                    )
                );
                setAllOrders(prev => 
                    prev.map(order => 
                        order.id === orderId 
                            ? { ...order, status: 'cancelled' }
                            : order
                    )
                );
                return { success: true };
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            return { success: false, error: error.message };
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            if (storageMode === 'supabase' && user?.id) {
                const result = await orderService.updateOrderStatus(orderId, status);
                if (result.success) {
                    await loadOrdersFromSupabase();
                    await loadAllOrdersFromSupabase();
                    return { success: true, order: result.data };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                // Fallback to localStorage
                setOrders(prev => 
                    prev.map(order => 
                        order.id === orderId 
                            ? { ...order, status }
                            : order
                    )
                );
                setAllOrders(prev => 
                    prev.map(order => 
                        order.id === orderId 
                            ? { ...order, status }
                            : order
                    )
                );
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: error.message };
        }
    };

    const getAllOrders = () => {
        return allOrders;
    };

    const getOrdersByStatus = (status) => {
        return allOrders.filter(order => order.status === status);
    };

    const getOrdersByUser = (userId) => {
        return allOrders.filter(order => order.user_id === userId);
    };

    const getOrderStatistics = () => {
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const completedOrders = allOrders.filter(order => order.status === 'delivered').length;
        const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
        const totalRevenue = allOrders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.total_amount || 0), 0);

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue
        };
    };

    const value = {
        cart,
        orders,
        allOrders,
        isLoading,
        storageMode,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        placeOrder,
        cancelOrder,
        updateOrderStatus,
        getAllOrders,
        getOrdersByStatus,
        getOrdersByUser,
        getOrderStatistics
    };

    return (
        <SupabaseCartContext.Provider value={value}>
            {children}
        </SupabaseCartContext.Provider>
    );
}; 