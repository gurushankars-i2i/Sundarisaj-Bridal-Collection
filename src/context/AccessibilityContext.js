import React, { createContext, useState, useEffect } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(16); // Base font size

    useEffect(() => {
        // Apply the font size to the root HTML element
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    const increaseFontSize = () => {
        setFontSize(prevSize => Math.min(prevSize + 2, 24)); // Cap at 24px
    };

    const decreaseFontSize = () => {
        setFontSize(prevSize => Math.max(prevSize - 2, 12)); // Floor at 12px
    };

    return (
        <AccessibilityContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize }}>
            {children}
        </AccessibilityContext.Provider>
    );
}; 