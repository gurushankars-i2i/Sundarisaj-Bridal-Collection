import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { theme } from '../theme/theme';

const ProductPage = () => {
    const { id } = useParams();
    const { products } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);
    const { t } = useContext(LanguageContext);

    const [purchaseType, setPurchaseType] = useState('rent'); // 'rent' or 'sale'
    const [rentalPeriod, setRentalPeriod] = useState('oneDay'); // 'oneDay' or 'threeDays'

    const product = products.find(p => p.id === id);

    if (!product) {
        return <div style={{ padding: '2rem' }}>{t('productNotFound')}</div>;
    }

    const getPrice = () => {
        if (purchaseType === 'sale') return product.salePrice;
        return rentalPeriod === 'oneDay' ? product.rentalPricePerDay : product.rentalPriceThreeDays;
    };

    const handleAddToCart = () => {
        let purchaseDescription = '';
        if (purchaseType === 'sale') {
            purchaseDescription = t('sale');
        } else {
            purchaseDescription = rentalPeriod === 'oneDay' ? t('rental_oneDay') : t('rental_threeDays');
        }

        const itemToAdd = {
            ...product,
            price: getPrice(),
            purchaseType,
            rentalPeriod: purchaseType === 'rent' ? rentalPeriod : null,
            purchaseDescription
        };
        addToCart(itemToAdd);
        alert(t('itemAddedToCart'));
    };
    
    // --- Styles ---
    const containerStyle = {
        display: 'flex',
        padding: '4rem 2rem',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap'
    };
    const imageContainerStyle = { flex: '1 1 400px', textAlign: 'center' };
    const imageStyle = { maxWidth: '100%', height: 'auto', borderRadius: '8px' };
    const detailsStyle = { flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' };
    const priceStyle = { fontSize: '2rem', fontWeight: 'bold', color: theme.colors.secondary };
    const selectionGroupStyle = { display: 'flex', gap: '1rem', marginTop: '1rem' };
    const buttonStyle = (isActive) => ({
        padding: '0.8rem 1.5rem',
        border: `2px solid ${theme.colors.primary}`,
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        backgroundColor: isActive ? theme.colors.primary : theme.colors.white,
        color: isActive ? theme.colors.white : theme.colors.primary,
        transition: 'all 0.3s ease'
    });
    const radioGroupStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' };
    const radioLabelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' };
    const addToCartButtonStyle = {
        padding: '1rem 2rem',
        marginTop: '1.5rem',
        backgroundColor: theme.colors.secondary,
        color: theme.colors.white,
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    };


    return (
        <div style={containerStyle}>
            <div style={imageContainerStyle}>
                <img src={product.image} alt={product.name} style={imageStyle} />
            </div>
            <div style={detailsStyle}>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <div style={priceStyle}>₹{getPrice().toLocaleString()}</div>

                {/* Purchase Type Selection: Rent or Buy */}
                <div style={selectionGroupStyle}>
                    <button onClick={() => setPurchaseType('rent')} style={buttonStyle(purchaseType === 'rent')}>{t('rent')}</button>
                    <button onClick={() => setPurchaseType('sale')} style={buttonStyle(purchaseType === 'sale')}>{t('buy')}</button>
                </div>

                {/* Rental Period Selection (only shows if 'Rent' is selected) */}
                {purchaseType === 'rent' && (
                    <div style={radioGroupStyle}>
                        <label style={radioLabelStyle}>
                            <input type="radio" value="oneDay" name="rentalPeriod" checked={rentalPeriod === 'oneDay'} onChange={() => setRentalPeriod('oneDay')} />
                            {t('perDayRental')} (₹{product.rentalPricePerDay.toLocaleString()})
                        </label>
                        <label style={radioLabelStyle}>
                            <input type="radio" value="threeDays" name="rentalPeriod" checked={rentalPeriod === 'threeDays'} onChange={() => setRentalPeriod('threeDays')} />
                            {t('threeDayPackage')} (₹{product.rentalPriceThreeDays.toLocaleString()})
                        </label>
                    </div>
                )}
                
                <button onClick={handleAddToCart} style={addToCartButtonStyle}>{t('addToCart')}</button>
            </div>
        </div>
    );
};

export default ProductPage;
