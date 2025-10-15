import React, { useState, useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import { LanguageContext } from '../context/LanguageContext';
import { theme } from '../theme/theme';

const AdminCategoryManager = () => {
    const { categories, addCategory, deleteCategory } = useContext(CategoryContext);
    const { t } = useContext(LanguageContext);
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        if (newCategory.trim()) {
            addCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleDelete = (category) => {
        if (window.confirm(t('deleteCategoryConfirm', { category }))) {
            deleteCategory(category);
        }
    }

    // Styles
    const containerStyle = { padding: '2rem', background: '#fff', borderRadius: '8px' };
    const listStyle = { listStyle: 'none', padding: 0 };
    const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' };
    const inputContainerStyle = { display: 'flex', gap: '1rem', marginTop: '2rem' };
    const inputStyle = { flex: 1, padding: '0.75rem' };
    const buttonStyle = { padding: '0.75rem 1.5rem', cursor: 'pointer' };

    return (
        <div style={containerStyle}>
            <h2>{t('manageCategories')}</h2>
            <ul style={listStyle}>
                {categories.map(cat => (
                    <li key={cat} style={listItemStyle}>
                        <span>{cat}</span>
                        <button onClick={() => handleDelete(cat)} style={{...buttonStyle, background: theme.colors.accent_dark, color: 'white'}}>
                            {t('delete')}
                        </button>
                    </li>
                ))}
            </ul>
            <div style={inputContainerStyle}>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t('newCategoryName')}
                    style={inputStyle}
                />
                <button onClick={handleAdd} style={{...buttonStyle, background: theme.colors.primary, color: 'white'}}>
                    {t('addCategory')}
                </button>
            </div>
        </div>
    );
};

export default AdminCategoryManager; 