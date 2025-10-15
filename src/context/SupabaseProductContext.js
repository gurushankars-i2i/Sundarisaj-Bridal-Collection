import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, TABLES, mapFieldsToApp, mapFieldsToDb, handleSupabaseError, formatResponse } from '../config/supabase';

const SupabaseProductContext = createContext();

export const useSupabaseProducts = () => {
    const context = useContext(SupabaseProductContext);
    if (!context) {
        throw new Error('useSupabaseProducts must be used within a SupabaseProductProvider');
    }
    return context;
};

export const SupabaseProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);

    // Load all products
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (fetchError) {
                const { error } = handleSupabaseError(fetchError, 'loadProducts');
                setError(error);
                return;
            }

            // Map database fields to application fields
            const mappedProducts = mapFieldsToApp(data);
            setProducts(mappedProducts);

            // Extract categories
            const uniqueCategories = [...new Set(mappedProducts.map(p => p.category))];
            setCategories(uniqueCategories);

            // Filter best sellers and new arrivals
            const bestSellers = mappedProducts.filter(product => product.isBestSeller);
            const newArrivals = mappedProducts.filter(product => product.isNew);

            setBestSellers(bestSellers);
            setNewArrivals(newArrivals);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'loadProducts');
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    // Get product by ID
    const getProductById = async (id) => {
        try {
            const { data, error: fetchError } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (fetchError) {
                const { error } = handleSupabaseError(fetchError, 'getProductById');
                return formatResponse(null, error);
            }

            const mappedProduct = mapFieldsToApp(data);
            return formatResponse(mappedProduct);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'getProductById');
            return formatResponse(null, error);
        }
    };

    // Get products by category
    const getProductsByCategory = async (category) => {
        try {
            const { data, error: fetchError } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('category', category)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (fetchError) {
                const { error } = handleSupabaseError(fetchError, 'getProductsByCategory');
                return formatResponse(null, error);
            }

            const mappedProducts = mapFieldsToApp(data);
            return formatResponse(mappedProducts);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'getProductsByCategory');
            return formatResponse(null, error);
        }
    };

    // Search products
    const searchProducts = async (query, filters = {}) => {
        try {
            let searchQuery = supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_active', true);

            // Add text search
            if (query) {
                searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            // Add filters
            if (filters.category) {
                searchQuery = searchQuery.eq('category', filters.category);
            }
            if (filters.type) {
                searchQuery = searchQuery.eq('type', filters.type);
            }
            if (filters.minPrice !== undefined) {
                searchQuery = searchQuery.gte('price', filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                searchQuery = searchQuery.lte('price', filters.maxPrice);
            }
            if (filters.isForRent !== undefined) {
                searchQuery = searchQuery.eq('is_for_rent', filters.isForRent);
            }
            if (filters.isForSale !== undefined) {
                searchQuery = searchQuery.eq('is_for_sale', filters.isForSale);
            }
            if (filters.isBestSeller !== undefined) {
                searchQuery = searchQuery.eq('is_best_seller', filters.isBestSeller);
            }
            if (filters.isNew !== undefined) {
                searchQuery = searchQuery.eq('is_new', filters.isNew);
            }

            const { data, error: fetchError } = await searchQuery.order('created_at', { ascending: false });

            if (fetchError) {
                const { error } = handleSupabaseError(fetchError, 'searchProducts');
                return formatResponse(null, error);
            }

            const mappedProducts = mapFieldsToApp(data);
            return formatResponse(mappedProducts);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'searchProducts');
            return formatResponse(null, error);
        }
    };

    // Add new product
    const addProduct = async (productData) => {
        try {
            // Map application fields to database fields
            const mappedData = mapFieldsToDb(productData);

            const { data, error: insertError } = await supabase
                .from(TABLES.PRODUCTS)
                .insert([mappedData])
                .select()
                .single();

            if (insertError) {
                const { error } = handleSupabaseError(insertError, 'addProduct');
                return formatResponse(null, error);
            }

            const mappedProduct = mapFieldsToApp(data);
            
            // Update local state
            setProducts(prev => [mappedProduct, ...prev]);
            
            return formatResponse(mappedProduct);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'addProduct');
            return formatResponse(null, error);
        }
    };

    // Update product
    const updateProduct = async (id, updates) => {
        try {
            // Map application fields to database fields
            const mappedUpdates = mapFieldsToDb(updates);

            const { data, error: updateError } = await supabase
                .from(TABLES.PRODUCTS)
                .update(mappedUpdates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                const { error } = handleSupabaseError(updateError, 'updateProduct');
                return formatResponse(null, error);
            }

            const mappedProduct = mapFieldsToApp(data);
            
            // Update local state
            setProducts(prev => prev.map(p => p.id === id ? mappedProduct : p));
            
            return formatResponse(mappedProduct);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'updateProduct');
            return formatResponse(null, error);
        }
    };

    // Delete product (soft delete)
    const deleteProduct = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ is_active: false })
                .eq('id', id);

            if (deleteError) {
                const { error } = handleSupabaseError(deleteError, 'deleteProduct');
                return formatResponse(null, error);
            }

            // Update local state
            setProducts(prev => prev.filter(p => p.id !== id));
            
            return formatResponse({ success: true });

        } catch (err) {
            const { error } = handleSupabaseError(err, 'deleteProduct');
            return formatResponse(null, error);
        }
    };

    // Update product stock
    const updateProductStock = async (id, quantity) => {
        try {
            const { data, error: updateError } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ stock_quantity: quantity })
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                const { error } = handleSupabaseError(updateError, 'updateProductStock');
                return formatResponse(null, error);
            }

            const mappedProduct = mapFieldsToApp(data);
            
            // Update local state
            setProducts(prev => prev.map(p => p.id === id ? mappedProduct : p));
            
            return formatResponse(mappedProduct);

        } catch (err) {
            const { error } = handleSupabaseError(err, 'updateProductStock');
            return formatResponse(null, error);
        }
    };

    // Get best sellers
    const getBestSellers = () => {
        return bestSellers;
    };

    // Get new arrivals
    const getNewArrivals = () => {
        return newArrivals;
    };

    // Get all categories
    const getAllCategories = () => {
        return categories;
    };

    // Load products on component mount
    useEffect(() => {
        loadProducts();
    }, []);

    const value = {
        products,
        loading,
        error,
        categories,
        bestSellers,
        newArrivals,
        loadProducts,
        getProductById,
        getProductsByCategory,
        searchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        getBestSellers,
        getNewArrivals,
        getAllCategories
    };

    return (
        <SupabaseProductContext.Provider value={value}>
            {children}
        </SupabaseProductContext.Provider>
    );
}; 