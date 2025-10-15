import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { theme } from '../theme/theme';

const ProductCard = ({ product }) => {
    // A smaller, more compact product card for the row
    const cardStyle = {
        flex: '0 0 220px',
        width: '220px',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        overflow: 'hidden',
        textAlign: 'left'
    };
    const imgStyle = { width: '100%', height: '150px', objectFit: 'cover' };
    const contentStyle = { padding: '1rem' };
    const nameStyle = { fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' };
    const priceStyle = { fontSize: '0.9rem', color: theme.colors.primary };

    return (
        <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <div style={cardStyle}>
                <img src={(product.images && product.images[0]) || product.image} alt={product.name} style={imgStyle} />
                <div style={contentStyle}>
                    <h4 style={nameStyle}>{product.name}</h4>
                    <p style={priceStyle}>₹{product.price}</p>
                </div>
            </div>
        </Link>
    );
}

const CategoryRow = ({ category }) => {
    const { products } = useContext(ProductContext);
    const categoryProducts = products.filter(p => p.category === category).slice(0, 5); // Show first 5

    // Styles
    const sectionStyle = { padding: '2rem', background: category === 'Kundan' ? theme.colors.white : 'transparent' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
    const titleStyle = { fontSize: '2rem', color: theme.colors.primary, margin: 0 };
    const viewAllStyle = { color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' };
    const rowStyle = { display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' };

    return (
        <section style={sectionStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>{category} Collection</h2>
                <Link to="/catalog" style={viewAllStyle}>View All &rarr;</Link>
            </div>
            <div style={rowStyle}>
                {categoryProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
        </section>
    );
};

export default CategoryRow; 