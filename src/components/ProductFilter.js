import React, { useContext } from 'react';
import { theme } from '../theme/theme';
import { LanguageContext } from '../context/LanguageContext';


const ProductFilter = ({ priceRange, setPriceRange }) => {
    const { t } = useContext(LanguageContext);
    const filterContainerStyle = {
        // ... styles
    };

    return (
        <div style={filterContainerStyle}>
            <h3>{t('priceFilter')}</h3>
            {/* ... rest of the component ... */}
        </div>
    );
};

export default ProductFilter; 