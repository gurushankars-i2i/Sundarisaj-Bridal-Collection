import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        // Dynamically import the translation file
        import(`../locales/${language}.json`)
            .then(module => {
                setTranslations(module.default);
            })
            .catch(err => {
                console.error(`Could not load ${language}.json:`, err);
                // Fallback to English if the desired language file fails
                import(`../locales/en.json`)
                    .then(module => setTranslations(module.default));
            });
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prevLang => (prevLang === 'en' ? 'ta' : 'en'));
    };

    const t = (key) => {
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}; 