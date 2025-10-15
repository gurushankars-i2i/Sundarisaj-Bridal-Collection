import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { theme } from '../theme/theme';
import ProductCard from '../components/ProductCard';
import BestSellersCarousel from '../components/BestSellersCarousel';
import { FaSpinner, FaStar } from 'react-icons/fa';

const CatalogPage = () => {
    const { products } = useContext(ProductContext);
    const [searchParams] = useSearchParams();
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'newest', 'bestseller'

    // Simulate loading for better UX
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const filteredAndSortedProducts = useMemo(() => {
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const featured = searchParams.get('featured');

        let filtered = products.filter(p => {
            // Price filter
            const inPriceRange = p.price >= priceRange[0] && p.price <= priceRange[1];
            if (!inPriceRange) return false;

            // Category filter
            if (category && p.category !== category) return false;

            // Type filter
            if (type && p.type !== type) return false;
            
            // Featured filter
            if (featured && !p[featured]) return false;

            return true;
        });

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'newest':
                    return b.isNew ? 1 : -1;
                case 'bestseller':
                    return b.isBestSeller ? 1 : -1;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }, [products, priceRange, searchParams, sortBy]);

    const pageStyle = {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '2rem',
    };

    const titleStyle = {
        color: theme.colors.primary,
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    };

    const subtitleStyle = {
        color: theme.colors.textLight,
        fontSize: '1.1rem',
    };

    const filterContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        background: theme.colors.white,
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const filterGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    };

    const priceLabelStyle = { 
        fontSize: '1.1rem', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const priceValueStyle = { 
        color: theme.colors.primary, 
        marginLeft: '0.5rem',
        fontWeight: 'bold',
    };

    const sortSelectStyle = {
        padding: '0.5rem 1rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: theme.colors.white,
        cursor: 'pointer',
    };

    const catalogGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
        justifyItems: 'center',
    };

    const categoryTitleStyle = {
        textAlign: 'center',
        color: theme.colors.primary,
        marginBottom: '2rem',
        width: '100%',
        fontSize: '2rem',
        fontWeight: 'bold',
    };

    const loadingStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '2rem',
        color: theme.colors.primary,
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: theme.colors.textLight,
    };

    const emptyIconStyle = {
        fontSize: '4rem',
        marginBottom: '1rem',
        color: theme.colors.accent,
    };

    const resultsInfoStyle = {
        textAlign: 'center',
        marginBottom: '2rem',
        color: theme.colors.textLight,
        fontSize: '1.1rem',
    };

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>Bridal Jewelry Collection</h1>
                <p style={subtitleStyle}>Discover our exquisite collection of traditional and modern bridal jewelry</p>
            </div>

            {/* Best Seller Carousel */}
            {!searchParams.get('category') && !searchParams.get('type') && (
                <BestSellersCarousel />
            )}

            <div style={filterContainerStyle}>
                <div style={filterGroupStyle}>
                    <label style={priceLabelStyle} htmlFor="price">
                        Price up to: <span style={priceValueStyle}>₹{priceRange[1].toLocaleString()}</span>
                    </label>
                    <input
                        type="range"
                        id="price"
                        min="0"
                        max="100000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                        style={{ width: '300px' }}
                    />
                </div>

                <div style={filterGroupStyle}>
                    <label htmlFor="sort" style={{ fontWeight: 'bold' }}>Sort by:</label>
                    <select 
                        id="sort"
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={sortSelectStyle}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="newest">Newest First</option>
                        <option value="bestseller">Best Sellers</option>
                    </select>
                </div>
            </div>

            {searchParams.get('category') && (
                <h2 style={categoryTitleStyle}>
                    Category: {searchParams.get('category')}
                </h2>
            )}

            {isLoading ? (
                <div style={loadingStyle}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '1rem' }}>Loading products...</span>
                </div>
            ) : filteredAndSortedProducts.length === 0 ? (
                <div style={emptyStateStyle}>
                    <FaStar style={emptyIconStyle} />
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                </div>
            ) : (
                <>
                    <div style={resultsInfoStyle}>
                        Showing {filteredAndSortedProducts.length} of {products.length} products
                    </div>
                    <div style={catalogGridStyle}>
                        {filteredAndSortedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .catalog-grid {
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                        gap: 1rem !important;
                    }
                    
                    .filter-container {
                        flex-direction: column !important;
                        gap: 1rem !important;
                    }
                    
                    .filter-group {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CatalogPage; 