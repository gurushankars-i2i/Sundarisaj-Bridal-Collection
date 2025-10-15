import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import { ProductContext } from '../context/ProductContext';
import { FaSearch, FaTimes } from 'react-icons/fa';

const GlobalSearch = () => {
    const { products } = useContext(ProductContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const searchContainerRef = useRef(null);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            const results = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase()) ||
                p.type.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(results.slice(0, 8)); // Limit to 8 results
        } else {
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsExpanded(false);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchResults([]);
                if (!searchQuery) {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchContainerRef, searchQuery]);

    const containerStyle = {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem 2rem',
        backgroundColor: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.accent}`,
    };

    const searchWrapperStyle = {
        position: 'relative',
        width: isExpanded ? '100%' : 'auto',
        maxWidth: '600px',
        transition: 'all 0.3s ease',
    };

    const searchBoxStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        border: `2px solid ${isExpanded ? theme.colors.primary : theme.colors.accent}`,
        borderRadius: '25px',
        padding: '0.6rem 1.2rem',
        gap: '0.5rem',
        boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        cursor: isExpanded ? 'text' : 'pointer',
    };

    const inputStyle = {
        border: 'none',
        outline: 'none',
        flex: 1,
        fontSize: '1rem',
        backgroundColor: 'transparent',
        display: isExpanded ? 'block' : 'none',
    };

    const searchIconStyle = {
        color: theme.colors.primary,
        fontSize: '1.1rem',
    };

    const resultsStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        marginTop: '0.5rem',
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: 1300,
    };

    const resultItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        textDecoration: 'none',
        color: theme.colors.text,
        borderBottom: `1px solid ${theme.colors.accent}`,
        transition: 'background-color 0.2s ease',
    };

    const resultImageStyle = {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '8px',
    };

    const resultInfoStyle = {
        flex: 1,
    };

    const resultNameStyle = {
        fontWeight: '600',
        marginBottom: '0.25rem',
        fontSize: '0.95rem',
    };

    const resultMetaStyle = {
        fontSize: '0.8rem',
        color: theme.colors.textLight,
    };

    const resultPriceStyle = {
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: '0.95rem',
    };

    const placeholderStyle = {
        color: theme.colors.textLight,
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
    };

    const noResultsStyle = {
        padding: '2rem',
        textAlign: 'center',
        color: theme.colors.textLight,
    };

    return (
        <>
            <style>{`
                .search-result-item:hover {
                    background-color: ${theme.colors.light_gold};
                }
                .search-result-item:last-child {
                    border-bottom: none;
                }
                @media (max-width: 768px) {
                    .global-search-container {
                        padding: 0.8rem 1rem !important;
                    }
                    .global-search-box {
                        padding: 0.5rem 1rem !important;
                    }
                }
            `}</style>
            <div style={containerStyle} className="global-search-container">
                <div style={searchWrapperStyle} ref={searchContainerRef}>
                    <div 
                        style={searchBoxStyle} 
                        className="global-search-box"
                        onClick={() => !isExpanded && setIsExpanded(true)}
                    >
                        <FaSearch style={searchIconStyle} />
                        {!isExpanded && (
                            <span style={placeholderStyle}>Search products...</span>
                        )}
                        <input
                            type="text"
                            placeholder="Search by name, category, or type..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={inputStyle}
                            autoFocus={isExpanded}
                        />
                        {isExpanded && searchQuery && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: theme.colors.textLight,
                                }}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div style={resultsStyle}>
                            {searchResults.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    style={resultItemStyle}
                                    className="search-result-item"
                                    onClick={clearSearch}
                                >
                                    <img
                                        src={product.images?.[0] || product.image}
                                        alt={product.name}
                                        style={resultImageStyle}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                        }}
                                    />
                                    <div style={resultInfoStyle}>
                                        <div style={resultNameStyle}>{product.name}</div>
                                        <div style={resultMetaStyle}>
                                            {product.category} • {product.type}
                                        </div>
                                    </div>
                                    <div style={resultPriceStyle}>₹{product.price.toLocaleString()}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {isExpanded && searchQuery.length > 2 && searchResults.length === 0 && (
                        <div style={resultsStyle}>
                            <div style={noResultsStyle}>
                                <p>No products found for "{searchQuery}"</p>
                                <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
                                    Try searching by product name, category, or type
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GlobalSearch;

