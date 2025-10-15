import React, { createContext, useState, useEffect } from 'react';
import productsData from '../data/products.json';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        // ALWAYS use the latest products from JSON file to ensure catalog is up-to-date
        // This ensures any updates to products.json are reflected immediately
        console.log('📦 Loading product catalog...');
        console.log(`✨ Loaded ${productsData.length} products from catalog`);
        return productsData;
    });

    // Save products to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('sundarisaj-products', JSON.stringify(products));
    }, [products]);

    const addProduct = (newProduct) => {
        const productWithId = {
            ...newProduct,
            id: Date.now(), // Simple ID generation
            stock: newProduct.stock || 0,
            isForRent: newProduct.isForRent !== undefined ? newProduct.isForRent : true,
            isForSale: newProduct.isForSale !== undefined ? newProduct.isForSale : true,
            isNew: newProduct.isNew !== undefined ? newProduct.isNew : false,
            isBestSeller: newProduct.isBestSeller !== undefined ? newProduct.isBestSeller : false,
        };
        setProducts(prev => [...prev, productWithId]);
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => 
            prev.map(product => 
                product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
            )
        );
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(product => product.id !== productId));
    };

    const updateProductStock = (productId, newStock) => {
        setProducts(prev => 
            prev.map(product => 
                product.id === productId 
                    ? { ...product, stock: Math.max(0, newStock) } 
                    : product
            )
        );
    };

    const getProductsByCategory = (category) => {
        return products.filter(product => product.category === category);
    };

    const getProductsByType = (type) => {
        return products.filter(product => product.type === type);
    };

    const getFeaturedProducts = (feature) => {
        return products.filter(product => product[feature]);
    };

    const searchProducts = (query) => {
        const lowercaseQuery = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.description.toLowerCase().includes(lowercaseQuery) ||
            product.category.toLowerCase().includes(lowercaseQuery)
        );
    };

    const getCategories = () => {
        const categories = [...new Set(products.map(product => product.category))];
        return categories.sort();
    };

    const getTypes = () => {
        const types = [...new Set(products.map(product => product.type))];
        return types.sort();
    };

    const getStockStatus = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return 'unknown';
        
        if (product.stock === 0) return 'out_of_stock';
        if (product.stock <= 5) return 'low_stock';
        return 'in_stock';
    };

    const getAvailableStock = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.stock : 0;
    };

    const reserveStock = (productId, quantity) => {
        const product = products.find(p => p.id === productId);
        if (!product || product.stock < quantity) {
            return false; // Cannot reserve
        }
        
        updateProductStock(productId, product.stock - quantity);
        return true; // Successfully reserved
    };

    const releaseStock = (productId, quantity) => {
        const product = products.find(p => p.id === productId);
        if (!product) return false;
        
        updateProductStock(productId, product.stock + quantity);
        return true;
    };

    return (
        <ProductContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            updateProductStock,
            getProductsByCategory,
            getProductsByType,
            getFeaturedProducts,
            searchProducts,
            getCategories,
            getTypes,
            getStockStatus,
            getAvailableStock,
            reserveStock,
            releaseStock
        }}>
            {children}
        </ProductContext.Provider>
    );
}; 