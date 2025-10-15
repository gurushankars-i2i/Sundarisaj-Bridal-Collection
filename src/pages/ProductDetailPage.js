import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaShoppingCart, FaCheck, FaMinus, FaPlus } from 'react-icons/fa';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { products, updateProductStock } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);
    const { addNotification } = useContext(NotificationContext);
    const navigate = useNavigate();
    
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [purchaseType, setPurchaseType] = useState('sale'); // 'sale' or 'rent'
    const [rentalDays, setRentalDays] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const product = products.find(p => p.id === parseInt(id));

    useEffect(() => {
        if (product) {
            setMainImage(product.images?.[0] || product.image);
        }
    }, [product]);

    if (!product) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Product not found</h2>
            </div>
        );
    }

    const getCurrentPrice = () => {
        if (purchaseType === 'rent') {
            return product.rentalPricePerDay || product.price;
        }
        return product.salePrice || product.price;
    };

    const getTotalPrice = () => {
        const basePrice = getCurrentPrice();
        if (purchaseType === 'rent') {
            return basePrice * rentalDays * quantity;
        }
        return basePrice * quantity;
    };

    const getPurchaseDescription = () => {
        if (purchaseType === 'rent') {
            return `Rent for ${rentalDays} day(s)`;
        }
        return 'Purchase';
    };

    const handleQuantityChange = (newQuantity) => {
        // Validate against available stock
        if (newQuantity < 1) {
            setQuantity(1);
            return;
        }
        
        if (newQuantity > product.stock) {
            addNotification({
                id: Date.now(),
                message: `Only ${product.stock} items available in stock`,
                type: 'warning',
                date: new Date().toISOString(),
                isRead: false
            });
            return;
        }
        
        setQuantity(newQuantity);
    };

    const handleAddToCart = async () => {
        // Final stock validation before adding to cart
        if (quantity > product.stock) {
            addNotification({
                id: Date.now(),
                message: `Cannot add ${quantity} items. Only ${product.stock} available in stock.`,
                type: 'error',
                date: new Date().toISOString(),
                isRead: false
            });
            return;
        }

        setIsAddingToCart(true);

        try {
            const productToAdd = {
                ...product,
                price: getCurrentPrice(),
                purchaseType,
                purchaseDescription: getPurchaseDescription(),
                rentalDays: purchaseType === 'rent' ? rentalDays : null,
                quantity
            };

            addToCart(productToAdd);

            // Update product stock
            const newStock = product.stock - quantity;
            updateProductStock(product.id, newStock);

            addNotification({
                id: Date.now(),
                message: `${quantity}x ${product.name} added to cart!`,
                type: 'success',
                date: new Date().toISOString(),
                isRead: false
            });

            // Ask user if they want to go to cart
            setTimeout(() => {
                if (window.confirm('Item added to cart! Would you like to view your cart?')) {
                    navigate('/cart');
                }
            }, 500);

        } catch (error) {
            addNotification({
                id: Date.now(),
                message: 'Failed to add item to cart. Please try again.',
                type: 'error',
                date: new Date().toISOString(),
                isRead: false
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        minHeight: '80vh',
    };

    const imageSectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    };

    const mainImageStyle = {
        width: '100%',
        height: '500px',
        objectFit: 'cover',
        borderRadius: '12px',
        border: `2px solid ${theme.colors.accent}`,
    };

    const thumbnailContainerStyle = {
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        padding: '0.5rem 0',
    };

    const thumbnailStyle = (isActive) => ({
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        cursor: 'pointer',
        border: isActive ? `3px solid ${theme.colors.primary}` : `2px solid ${theme.colors.accent}`,
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.8,
    });

    const detailsSectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '0.5rem',
    };

    const categoryStyle = {
        fontSize: '1rem',
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '1rem',
    };

    const descriptionStyle = {
        fontSize: '1.1rem',
        lineHeight: '1.6',
        color: theme.colors.text,
        marginBottom: '1.5rem',
    };

    const priceSectionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
    };

    const priceStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: theme.colors.secondary,
    };

    const stockStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        backgroundColor: product.stock > 10 ? theme.colors.success : 
                        product.stock > 0 ? theme.colors.warning : theme.colors.error,
        color: 'white',
    };

    const purchaseTypeSectionStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
    };

    const purchaseTypeButtonStyle = (isActive) => ({
        ...componentStyles.buttons.secondary,
        backgroundColor: isActive ? theme.colors.primary : theme.colors.white,
        color: isActive ? 'white' : theme.colors.text,
        border: `2px solid ${theme.colors.primary}`,
        padding: '1rem 2rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
    });

    const rentalDaysSectionStyle = {
        display: purchaseType === 'rent' ? 'flex' : 'none',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
    };

    const quantitySectionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
    };

    const quantityButtonStyle = {
        ...componentStyles.buttons.secondary,
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
    };

    const quantityInputStyle = {
        width: '60px',
        textAlign: 'center',
        padding: '0.5rem',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
    };

    const totalSectionStyle = {
        backgroundColor: theme.colors.light_gold,
        padding: '1.5rem',
        borderRadius: '12px',
        border: `2px solid ${theme.colors.accent}`,
        marginBottom: '1.5rem',
    };

    const totalPriceStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: '0.5rem',
    };

    const totalDescriptionStyle = {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: '1rem',
    };

    const addToCartButtonStyle = {
        ...componentStyles.buttons.primary,
        width: '100%',
        padding: '1.5rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: isAddingToCart ? 0.7 : 1,
        cursor: isAddingToCart ? 'not-allowed' : 'pointer',
    };

    return (
        <div style={containerStyle}>
            <div style={imageSectionStyle}>
                <div style={{ position: 'relative' }}>
                    <InnerImageZoom
                        src={mainImage}
                        zoomSrc={mainImage}
                        zoomScale={2.5}
                        width={500}
                        height={500}
                        zoomType="hover"
                        zoomPreload={true}
                        style={mainImageStyle}
                    />
                </div>
                
                <div style={thumbnailContainerStyle}>
                    {(product.images || [product.image]).map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            style={thumbnailStyle(mainImage === image)}
                            onClick={() => setMainImage(image)}
                        />
                    ))}
                </div>
            </div>

            <div style={detailsSectionStyle}>
                <div>
                    <div style={categoryStyle}>{product.category}</div>
                    <h1 style={titleStyle}>{product.name}</h1>
                    <p style={descriptionStyle}>{product.description}</p>
                </div>

                <div style={priceSectionStyle}>
                    <div style={priceStyle}>₹{getCurrentPrice().toLocaleString()}</div>
                    <div style={stockStyle}>
                        {product.stock > 10 ? 'In Stock' : 
                         product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of Stock'}
                    </div>
                </div>

                <div style={purchaseTypeSectionStyle}>
                    <button
                        style={purchaseTypeButtonStyle(purchaseType === 'sale')}
                        onClick={() => setPurchaseType('sale')}
                    >
                        Purchase
                    </button>
                    <button
                        style={purchaseTypeButtonStyle(purchaseType === 'rent')}
                        onClick={() => setPurchaseType('rent')}
                    >
                        Rent
                    </button>
                </div>

                {purchaseType === 'rent' && (
                    <div style={rentalDaysSectionStyle}>
                        <label style={{ fontWeight: 'bold' }}>Rental Days:</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={rentalDays}
                            onChange={(e) => setRentalDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                            style={{
                                padding: '0.5rem',
                                border: `1px solid ${theme.colors.accent}`,
                                borderRadius: '8px',
                                width: '80px',
                                textAlign: 'center'
                            }}
                        />
                    </div>
                )}

                <div style={quantitySectionStyle}>
                    <label style={{ fontWeight: 'bold' }}>Quantity:</label>
                    <button
                        style={quantityButtonStyle}
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                    >
                        <FaMinus />
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min="1"
                        max={product.stock}
                        style={quantityInputStyle}
                    />
                    <button
                        style={quantityButtonStyle}
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                    >
                        <FaPlus />
                    </button>
                    <span style={{ color: theme.colors.textLight }}>
                        (Max: {product.stock})
                    </span>
                </div>

                <div style={totalSectionStyle}>
                    <div style={totalPriceStyle}>₹{getTotalPrice().toLocaleString()}</div>
                    <div style={totalDescriptionStyle}>
                        {getPurchaseDescription()} • {quantity} item(s)
                    </div>
                </div>

                <button
                    style={addToCartButtonStyle}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock === 0}
                >
                    {isAddingToCart ? (
                        <>
                            <FaCheck />
                            Added to Cart!
                        </>
                    ) : (
                        <>
                            <FaShoppingCart />
                            Add to Cart
                        </>
                    )}
                </button>

                {product.stock === 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: theme.colors.error,
                        fontWeight: 'bold',
                        padding: '1rem',
                        backgroundColor: theme.colors.light_gold,
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.error}`
                    }}>
                        This item is currently out of stock
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage; 