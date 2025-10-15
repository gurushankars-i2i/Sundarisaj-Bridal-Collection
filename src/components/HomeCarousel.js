import React, { useContext } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { theme } from '../theme/theme';

const HomeCarousel = () => {
    const { products } = useContext(ProductContext);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        pauseOnHover: true,
    };
    
    // Styles
    const slideStyle = (image) => ({
        height: '60vh',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
    });
    
    const nameStyle = { fontSize: '3rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' };
    const categoryStyle = { fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '-10px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' };
    const buttonStyle = {
        marginTop: '2rem',
        padding: '1rem 2.5rem',
        border: `2px solid ${theme.colors.secondary}`,
        borderRadius: '5px',
        backgroundColor: 'transparent',
        color: theme.colors.secondary,
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background-color 0.3s, color 0.3s',
    };

    return (
        <Slider {...settings}>
            {products.slice(0, 4).map(product => ( // Show first 4 products in carousel
                <div key={product.id}>
                    <div style={slideStyle(product.image)}>
                        <p style={categoryStyle}>{product.category}</p>
                        <h2 style={nameStyle}>{product.name}</h2>
                        <Link to={`/product/${product.id}`} style={buttonStyle}>
                            View Details
                        </Link>
                    </div>
                </div>
            ))}
        </Slider>
    );
};

export default HomeCarousel; 