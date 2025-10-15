import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { CategoryContext } from '../context/CategoryContext';
import { theme } from '../theme/theme';

const AdminProductForm = ({ onSave, editingProduct, onCancel }) => {
    const { t } = useContext(LanguageContext);
    const { categories } = useContext(CategoryContext);
    const [product, setProduct] = useState({
        name: '',
        category: '',
        type: '',
        price: '',
        stock: '',
        description: '',
        images: [],
        isForRent: false,
        isForSale: true,
        isNew: true,
        isBestSeller: false
    });

    useEffect(() => {
        if (editingProduct) {
            setProduct({ ...editingProduct, images: editingProduct.images || (editingProduct.image ? [editingProduct.image] : []) });
        }
        if (!editingProduct && categories.length > 0) {
            setProduct(p => ({ ...p, category: categories[0] }));
        }
    }, [editingProduct, categories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(product);
    };

    // For image URLs
    const [newImageUrl, setNewImageUrl] = useState('');
    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            setProduct(prev => ({ ...prev, images: [...(prev.images || []), newImageUrl.trim()] }));
            setNewImageUrl('');
        }
    };
    const handleRemoveImage = (idx) => {
        setProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    // Styles
    const formStyle = { background: theme.colors.white, padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '2rem' };
    const inputGroupStyle = { marginBottom: '1rem', display: 'flex', flexDirection: 'column' };
    const labelStyle = { marginBottom: '0.5rem', fontWeight: 'bold', color: theme.colors.text };
    const inputStyle = { padding: '10px', borderRadius: '4px', border: `1px solid ${theme.colors.accent}`, color: theme.colors.text, backgroundColor: theme.colors.white };
    const buttonContainerStyle = { display: 'flex', gap: '1rem', marginTop: '1.5rem' };
    const buttonStyle = (bgColor) => ({ padding: '10px 20px', border: 'none', borderRadius: '5px', color: 'white', fontWeight: 'bold', cursor: 'pointer', backgroundColor: bgColor });
    const formOverlayStyle = { /* ... */ };
    const checkboxGroupStyle = { /* ... */ };
    const checkboxLabelStyle = { /* ... */ };
    const cancelButtonStyle = { /* ... */ };
    const saveButtonStyle = { /* ... */ };
    const textareaStyle = { /* ... */ };

    return (
        <div style={formOverlayStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2>{editingProduct ? t('editProduct') : t('addNewProduct')}</h2>
                
                {/* Text inputs */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="name">{t('productName')}</label>
                    <input style={inputStyle} type="text" name="name" value={product.name} onChange={handleChange} placeholder={t('productName')} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="category">{t('category')}</label>
                    <select 
                        style={inputStyle} 
                        name="category" 
                        value={product.category} 
                        onChange={handleChange}
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="type">{t('type')}</label>
                    <input style={inputStyle} type="text" name="type" value={product.type} onChange={handleChange} placeholder={t('typePlaceholder')} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="price">{t('price')} (₹)</label>
                    <input style={inputStyle} type="number" name="price" value={product.price} onChange={handleChange} placeholder={t('price')} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="stock">{t('stock')}</label>
                    <input style={inputStyle} type="number" name="stock" value={product.stock} onChange={handleChange} placeholder={t('stock')} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="image">{t('imageURL')}</label>
                    <input style={inputStyle} type="text" name="image" value={product.image} onChange={handleChange} placeholder={t('imageURL')} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="description">{t('description')}</label>
                    <textarea style={textareaStyle} name="description" value={product.description} onChange={handleChange} placeholder={t('description')} required />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="rentalPricePerDay">{t('rentalPricePerDay')}</label>
                    <input style={inputStyle} type="number" name="rentalPricePerDay" value={product.rentalPricePerDay || ''} onChange={handleChange} placeholder="e.g., 500" required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="rentalPriceThreeDays">{t('rentalPriceThreeDays')}</label>
                    <input style={inputStyle} type="number" name="rentalPriceThreeDays" value={product.rentalPriceThreeDays || ''} onChange={handleChange} placeholder="e.g., 1200" />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle} htmlFor="salePrice">{t('salePrice')}</label>
                    <input style={inputStyle} type="number" name="salePrice" value={product.salePrice || ''} onChange={handleChange} placeholder="e.g., 7500" />
                </div>

                {/* Checkbox inputs */}
                <div style={checkboxGroupStyle}>
                    <label style={checkboxLabelStyle}><input type="checkbox" name="isForRent" checked={product.isForRent} onChange={handleChange} /> {t('forRent')}</label>
                    <label style={checkboxLabelStyle}><input type="checkbox" name="isForSale" checked={product.isForSale} onChange={handleChange} /> {t('forSale')}</label>
                    <label style={checkboxLabelStyle}><input type="checkbox" name="isNew" checked={product.isNew} onChange={handleChange} /> {t('newArrival')}</label>
                    <label style={checkboxLabelStyle}><input type="checkbox" name="isBestSeller" checked={product.isBestSeller} onChange={handleChange} /> {t('bestSeller')}</label>
                </div>

                {/* Images input */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>{t('images')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {(product.images || []).map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={img} alt={`img${idx}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: `1px solid ${theme.colors.accent}` }} />
                                <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: -8, right: -8, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontWeight: 'bold', color: '#c00', lineHeight: '18px', padding: 0 }}>×</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input style={inputStyle} type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder={t('imageURL')} />
                        <button type="button" onClick={handleAddImage} style={buttonStyle(theme.colors.primary)}>{t('add')}</button>
                    </div>
                </div>

                <div style={buttonContainerStyle}>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>{t('cancel')}</button>
                    <button type="submit" style={saveButtonStyle}>{t('saveProduct')}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm; 