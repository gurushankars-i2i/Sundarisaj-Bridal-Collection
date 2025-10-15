import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthSystem } from './UnifiedAuthContext';
import sharedDataService from '../services/sharedDataService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuthSystem();
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // All orders for admin

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

    // Load cart and orders when user changes
    useEffect(() => {
        const cartKey = getCartKey();
        const ordersKey = getOrdersKey();
        const allOrdersKey = getAllOrdersKey();

        try {
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

            // Check for guest cart migration when user logs in
            if (isAuthenticated() && user) {
                const guestCart = localStorage.getItem('ssbc-guest-cart');
                if (guestCart) {
                    try {
                        const guestCartItems = JSON.parse(guestCart);
                        if (guestCartItems.length > 0) {
                            // Migrate guest cart items to user cart
                            setCart(prevCart => {
                                const existingCart = [...prevCart];
                                guestCartItems.forEach(guestItem => {
                                    const existingIndex = existingCart.findIndex(item => 
                                        item.id === guestItem.id && item.purchaseType === guestItem.purchaseType
                                    );
                                    if (existingIndex >= 0) {
                                        existingCart[existingIndex].quantity += guestItem.quantity;
                                    } else {
                                        existingCart.push(guestItem);
                                    }
                                });
                                return existingCart;
                            });
                            // Clear guest cart
                            localStorage.removeItem('ssbc-guest-cart');
                        }
                    } catch (error) {
                        console.error('Error migrating guest cart:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading cart/orders from localStorage:', error);
        }
    }, [user, isAuthenticated]);

    // Listen to shared data service changes for real-time order updates
    useEffect(() => {
        if (!isAuthenticated() || !user) return;

        const handleDataChange = (data) => {
            // Update orders if there are changes in shared data
            if (data.orders && Array.isArray(data.orders)) {
                // Filter orders for current user
                const userOrders = data.orders.filter(order => order.userEmail === user.email);
                
                // Update local orders state
                setOrders(userOrders);
                
                // Update localStorage for user-specific orders
                const ordersKey = getOrdersKey();
                localStorage.setItem(ordersKey, JSON.stringify(userOrders));
            }
        };

        // Add listener for data changes
        sharedDataService.addListener('dataChanged', handleDataChange);

        // Initial sync with shared data
        const sharedOrders = sharedDataService.data.orders || [];
        const userOrders = sharedOrders.filter(order => order.userEmail === user.email);
        if (userOrders.length > 0) {
            setOrders(userOrders);
            const ordersKey = getOrdersKey();
            localStorage.setItem(ordersKey, JSON.stringify(userOrders));
        }

        return () => {
            sharedDataService.removeListener('dataChanged', handleDataChange);
        };
    }, [user, isAuthenticated]);

    // Save cart to localStorage
    useEffect(() => {
        const cartKey = getCartKey();
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart]);

    // Save orders to localStorage
    useEffect(() => {
        const ordersKey = getOrdersKey();
        localStorage.setItem(ordersKey, JSON.stringify(orders));
    }, [orders]);

    // Save all orders to localStorage
    useEffect(() => {
        const allOrdersKey = getAllOrdersKey();
        localStorage.setItem(allOrdersKey, JSON.stringify(allOrders));
    }, [allOrders]);

    const addToCart = (product, quantity = 1, purchaseType = 'sale', rentalDays = 1) => {
        const productToAdd = {
            ...product,
            quantity,
            purchaseType,
            rentalDays,
            purchaseDescription: purchaseType === 'rent' 
                ? `Rent for ${rentalDays} day(s)` 
                : 'Purchase'
        };

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
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateCartQuantity = (productId, newQuantity) => {
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const itemTotal = item.price * item.quantity;
            return total + itemTotal;
        }, 0);
    };

    const getCartItems = () => {
        return cart;
    };

    const generateOrderId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `SSBC-${timestamp}-${random}`;
    };

    const placeOrder = (shippingAddress, pickupPoint = null) => {
        if (cart.length === 0) {
            throw new Error('Cart is empty');
        }

        if (!isAuthenticated()) {
            throw new Error('Authentication required to place order');
        }

        const orderId = generateOrderId();
        const orderTotal = getCartTotal();
        
        const newOrder = {
            id: orderId,
            userId: user?.email || 'guest',
            userName: user?.name || 'Guest User',
            userEmail: user?.email || 'guest@example.com',
            items: [...cart],
            total: orderTotal,
            status: 'order_placed', // order_placed, pending_payment, pending_payment_approval, order_confirmed, processing, shipped, on_delivery, completed, cancelled
            date: new Date().toISOString(),
            shippingAddress: shippingAddress || user?.address,
            pickupPoint: pickupPoint,
            orderType: cart.some(item => item.purchaseType === 'rent') ? 'mixed' : 
                      cart[0].purchaseType === 'rent' ? 'rental' : 'purchase',
            customerInfo: {
                name: user?.name || 'Guest User',
                email: user?.email || 'guest@example.com',
                phone: user?.phone || shippingAddress?.phone || ''
            },
            adminNotes: '',
            cancellationReason: '',
            replacementRequested: false,
            replacementReason: '',
            postSaleSupport: {
                requested: false,
                issue: '',
                status: 'none' // none, requested, in_progress, resolved
            }
        };

        // Add to shared data service for cross-browser access first
        const addedOrder = sharedDataService.addOrder(newOrder);

        // Add to user's orders
        setOrders(prevOrders => [addedOrder, ...prevOrders]);

        // Add to all orders (for admin)
        setAllOrders(prevAllOrders => [addedOrder, ...prevAllOrders]);

        // Update localStorage for user-specific orders
        const ordersKey = getOrdersKey();
        const currentOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        localStorage.setItem(ordersKey, JSON.stringify([addedOrder, ...currentOrders]));

        // Clear cart after successful order
        clearCart();

        return orderId;
    };

    const cancelOrder = (orderId, reason = '') => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled', cancellationReason: reason }
                    : order
            )
        );

        setAllOrders(prevAllOrders => 
            prevAllOrders.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled', cancellationReason: reason }
                    : order
            )
        );
    };

    const updateOrderStatus = (orderId, newStatus, adminNotes = '') => {
        // Update in shared data service for cross-browser access
        const updatedOrder = sharedDataService.updateOrder(orderId, { 
            status: newStatus, 
            adminNotes,
            updatedAt: new Date().toISOString()
        });

        if (updatedOrder) {
            // Update local state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus, adminNotes, updatedAt: updatedOrder.updatedAt }
                        : order
                )
            );

            setAllOrders(prevAllOrders => 
                prevAllOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus, adminNotes, updatedAt: updatedOrder.updatedAt }
                        : order
                )
            );

            // Update localStorage for user-specific orders
            const ordersKey = getOrdersKey();
            const currentOrders = orders.filter(order => order.id !== orderId);
            const updatedOrders = [...currentOrders, updatedOrder];
            localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));
        }
    };

    const requestReplacement = (orderId, reason) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { 
                        ...order, 
                        replacementRequested: true, 
                        replacementReason: reason 
                    }
                    : order
            )
        );

        setAllOrders(prevAllOrders => 
            prevAllOrders.map(order => 
                order.id === orderId 
                    ? { 
                        ...order, 
                        replacementRequested: true, 
                        replacementReason: reason 
                    }
                    : order
            )
        );
    };

    const requestPostSaleSupport = (orderId, issue) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { 
                        ...order, 
                        postSaleSupport: {
                            requested: true,
                            issue,
                            status: 'requested'
                        }
                    }
                    : order
            )
        );

        setAllOrders(prevAllOrders => 
            prevAllOrders.map(order => 
                order.id === orderId 
                    ? { 
                        ...order, 
                        postSaleSupport: {
                            requested: true,
                            issue,
                            status: 'requested'
                        }
                    }
                    : order
            )
        );
    };

    const getOrders = () => {
        return orders;
    };

    const getAllOrders = () => {
        // Get orders from shared data service for cross-browser access
        return sharedDataService.getAllOrders();
    };

    const getOrderById = (orderId) => {
        return allOrders.find(order => order.id === orderId);
    };

    const getOrdersByStatus = (status) => {
        return allOrders.filter(order => order.status === status);
    };

    const getOrdersByUser = (userEmail) => {
        return allOrders.filter(order => order.userEmail === userEmail);
    };

    const getOrderStatistics = () => {
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const confirmedOrders = allOrders.filter(order => order.status === 'confirmed').length;
        const shippedOrders = allOrders.filter(order => order.status === 'shipped').length;
        const deliveredOrders = allOrders.filter(order => order.status === 'delivered').length;
        const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
        const totalRevenue = allOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((total, order) => total + order.total, 0);

        return {
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue
        };
    };

    return (
        <CartContext.Provider value={{
            cart,
            orders,
            allOrders,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            getCartCount,
            getCartTotal,
            getCartItems,
            placeOrder,
            cancelOrder,
            updateOrderStatus,
            requestReplacement,
            requestPostSaleSupport,
            getOrders,
            getAllOrders,
            getOrderById,
            getOrdersByStatus,
            getOrdersByUser,
            getOrderStatistics
        }}>
            {children}
        </CartContext.Provider>
    );
}; 