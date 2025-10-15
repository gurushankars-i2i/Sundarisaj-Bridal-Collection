import React, { createContext, useState, useEffect } from 'react';
import categoriesData from '../data/categories.json';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState(() => {
        // ALWAYS use the latest categories from JSON file to ensure catalog is up-to-date
        console.log('📂 Loading categories...');
        const categoryNames = categoriesData.map(cat => cat.name);
        console.log(`✨ Loaded ${categoryNames.length} categories:`, categoryNames);
        return categoryNames;
    });

    useEffect(() => {
        localStorage.setItem('ssbc-categories', JSON.stringify(categories));
    }, [categories]);

    const addCategory = (categoryName) => {
        if (categoryName && !categories.find(cat => cat.toLowerCase() === categoryName.toLowerCase())) {
            setCategories(prevCategories => [...prevCategories, categoryName]);
        }
    };

    const deleteCategory = (categoryName) => {
        setCategories(prevCategories => prevCategories.filter(cat => cat !== categoryName));
    };

    return (
        <CategoryContext.Provider value={{ categories, addCategory, deleteCategory }}>
            {children}
        </CategoryContext.Provider>
    );
}; 