import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import categories from '../data/categories.json';
import products from '../data/products.json';
import { FaChevronDown, FaGem, FaCrown, FaStar } from 'react-icons/fa';

const EnhancedMegaMenu = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get subcategories (types) for each category
    const getSubcategories = (categoryName) => {
        const categoryProducts = products.filter(p => p.category === categoryName);
        const types = [...new Set(categoryProducts.map(p => p.type))];
        return types.slice(0, 6); // Limit to 6 subcategories
    };

    // Get product count for subcategory
    const getProductCount = (categoryName, type) => {
        return products.filter(p => p.category === categoryName && p.type === type).length;
    };

    const menuBarStyle = {
        backgroundColor: theme.colors.primary,
        padding: '0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1100,
    };

    const menuContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
    };

    const categoryItemStyle = (isActive) => ({
        padding: '1rem 1.5rem',
        color: theme.colors.white,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderBottom: isActive ? `3px solid ${theme.colors.accent}` : '3px solid transparent',
        fontSize: '0.95rem',
        fontWeight: '500',
        position: 'relative',
    });

    const megaMenuStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        zIndex: 1150,
        maxWidth: '1400px',
        margin: '0 auto',
        animation: 'slideDown 0.3s ease-out',
    };

    const subcategoryColumnStyle = {
        padding: '0',
    };

    const subcategoryLinkStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0.8rem',
        color: theme.colors.text,
        textDecoration: 'none',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        marginBottom: '0.3rem',
    };

    const productCountStyle = {
        fontSize: '0.8rem',
        color: theme.colors.textLight,
        backgroundColor: theme.colors.light_gold,
        padding: '0.2rem 0.5rem',
        borderRadius: '12px',
    };

    const featuredBadgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.75rem',
        color: theme.colors.accent,
        fontWeight: 'bold',
        marginLeft: '0.5rem',
    };

    return (
        <>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .subcategory-link:hover {
                    background-color: ${theme.colors.light_gold};
                    transform: translateX(5px);
                }
                @media (max-width: 1024px) {
                    .mega-menu-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    .mega-menu-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .category-item {
                        padding: 0.8rem 1rem !important;
                        font-size: 0.9rem !important;
                    }
                }
            `}</style>
            <div 
                style={menuBarStyle}
                onMouseLeave={() => {
                    setActiveCategory(null);
                    setIsMenuOpen(false);
                }}
            >
                <div style={menuContainerStyle}>
                    {categories.filter(cat => cat.isActive).slice(0, 5).map((category) => {
                        const subcategories = getSubcategories(category.name);
                        
                        return (
                            <div
                                key={category.id}
                                onMouseEnter={() => {
                                    setActiveCategory(category.name);
                                    setIsMenuOpen(true);
                                }}
                                style={{ position: 'relative' }}
                            >
                                <Link
                                    to={`/catalog?category=${encodeURIComponent(category.name)}`}
                                    style={categoryItemStyle(activeCategory === category.name)}
                                    className="category-item"
                                >
                                    <FaGem style={{ fontSize: '0.9rem' }} />
                                    {category.name}
                                    {subcategories.length > 0 && (
                                        <FaChevronDown style={{ fontSize: '0.7rem' }} />
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                    
                    {/* View All Link */}
                    <Link
                        to="/catalog"
                        style={categoryItemStyle(false)}
                        className="category-item"
                    >
                        <FaStar style={{ fontSize: '0.9rem' }} />
                        View All Collections
                    </Link>
                </div>

                {/* Mega Menu Dropdown */}
                {isMenuOpen && activeCategory && (
                    <div style={megaMenuStyle} className="mega-menu-grid">
                        {getSubcategories(activeCategory).map((type, index) => {
                            const count = getProductCount(activeCategory, type);
                            const isPopular = count > 2;
                            
                            return (
                                <div key={index} style={subcategoryColumnStyle}>
                                    <Link
                                        to={`/catalog?category=${encodeURIComponent(activeCategory)}&type=${encodeURIComponent(type)}`}
                                        style={subcategoryLinkStyle}
                                        className="subcategory-link"
                                    >
                                        <span>
                                            {type}
                                            {isPopular && (
                                                <span style={featuredBadgeStyle}>
                                                    <FaCrown /> Popular
                                                </span>
                                            )}
                                        </span>
                                        <span style={productCountStyle}>{count}</span>
                                    </Link>
                                </div>
                            );
                        })}
                        
                        {/* View All in Category */}
                        <div style={{...subcategoryColumnStyle, gridColumn: 'span 4'}}>
                            <Link
                                to={`/catalog?category=${encodeURIComponent(activeCategory)}`}
                                style={{
                                    ...subcategoryLinkStyle,
                                    backgroundColor: theme.colors.primary,
                                    color: theme.colors.white,
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    marginTop: '1rem',
                                }}
                            >
                                View All {activeCategory} →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default EnhancedMegaMenu;

