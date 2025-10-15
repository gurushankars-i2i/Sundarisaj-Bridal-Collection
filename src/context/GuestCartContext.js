import React, { createContext, useState, useEffect } from 'react';

export const GuestCartContext = createContext();

export const GuestCartProvider = ({ children }) => {
    const [guestCart, setGuestCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('ssbc-guest-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading guest cart from localStorage:', error);
            return [];
        }
    });

    // Save guest cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('ssbc-guest-cart', JSON.stringify(guestCart));
    }, [guestCart]);

    const addToGuestCart = (product, quantity = 1, purchaseType = 'sale', rentalDays = 1) => {
        const productToAdd = {
            ...product,
            quantity,
            purchaseType,
            rentalDays,
            purchaseDescription: purchaseType === 'rent' 
                ? `Rent for ${rentalDays} day(s)` 
                : 'Purchase'
        };

        setGuestCart(prevCart => {
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

    const removeFromGuestCart = (productId) => {
        setGuestCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateGuestCartQuantity = (productId, newQuantity) => {
        setGuestCart(prevCart => 
            prevCart.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearGuestCart = () => {
        setGuestCart([]);
    };

    const getGuestCartCount = () => {
        return guestCart.reduce((total, item) => total + item.quantity, 0);
    };

    const getGuestCartTotal = () => {
        return guestCart.reduce((total, item) => {
            const itemTotal = item.price * item.quantity;
            return total + itemTotal;
        }, 0);
    };

    const getGuestCartItems = () => {
        return guestCart;
    };

    const migrateGuestCartToUser = (userEmail) => {
        // This function will be called when a guest user registers/logs in
        // The actual cart migration will be handled by the main CartContext
        const cartToMigrate = [...guestCart];
        clearGuestCart();
        return cartToMigrate;
    };

    return (
        <GuestCartContext.Provider value={{
            guestCart,
            addToGuestCart,
            removeFromGuestCart,
            updateGuestCartQuantity,
            clearGuestCart,
            getGuestCartCount,
            getGuestCartTotal,
            getGuestCartItems,
            migrateGuestCartToUser
        }}>
            {children}
        </GuestCartContext.Provider>
    );
}; 