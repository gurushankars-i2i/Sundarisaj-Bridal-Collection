import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import categories from '../data/categories.json';
import products from '../data/products.json';

const FeaturedCategories = () => {
  // Get first product image for each category
  const getCategoryImage = (categoryName) => {
    const categoryProduct = products.find(p => p.category === categoryName);
    const category = categories.find(c => c.name === categoryName);
    
    if (categoryProduct) {
      return categoryProduct.images?.[0] || categoryProduct.image || category?.image;
    }
    // Fallback to category image
    return category?.image;
  };

  const sectionStyle = {
    padding: '4rem 2rem',
    backgroundColor: theme.colors.background,
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    color: theme.colors.primary,
    marginBottom: '2rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const cardStyle = {
    backgroundColor: theme.colors.white,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '300px',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
  };

  const cardHoverStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
  };
  
  const cardUnhoverStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  };

  const imgStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    color: theme.colors.primary,
    padding: '1rem',
    fontWeight: 'bold',
  };

  const cardDescStyle = {
    fontSize: '0.9rem',
    color: theme.colors.textLight,
    padding: '0 1rem 1rem 1rem',
    lineHeight: '1.4',
  };

  const productCountStyle = {
    fontSize: '0.85rem',
    color: theme.colors.primary,
    padding: '0 1rem 1rem 1rem',
    fontWeight: 'bold',
  };

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Featured Collections</h2>
      <div style={gridStyle}>
        {categories.filter(cat => cat.isActive).map((category, index) => (
          <Link 
            to={`/catalog?category=${encodeURIComponent(category.name)}`}
            key={category.id} 
            style={{...cardStyle, animationDelay: `${index * 0.1}s`}}
            className="animate-fade-in hover-lift"
            onMouseOver={cardHoverStyle}
            onMouseOut={cardUnhoverStyle}
          >
            <img 
              src={getCategoryImage(category.name)} 
              alt={category.name} 
              style={imgStyle}
              onError={(e) => {
                e.target.src = category.image; // Fallback to category default
              }}
            />
            <h3 style={cardTitleStyle}>{category.name}</h3>
            <p style={cardDescStyle}>{category.description}</p>
            <p style={productCountStyle}>{category.products} Products Available</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories; 