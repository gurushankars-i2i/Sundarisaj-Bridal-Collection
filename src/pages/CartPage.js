import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaMapMarkerAlt, FaEdit, FaTimes, FaInfoCircle } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal';

const CartPage = () => {
    const { cart, removeFromCart, placeOrder, updateCartQuantity, getCartTotal } = useContext(CartContext);
    const { isAuthenticated, user } = useAuthSystem();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [pickupPoint, setPickupPoint] = useState('');
    const [showPickupForm, setShowPickupForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    // Default addresses for demo - now based on logged-in user
    const getDefaultAddresses = () => {
        if (!user) return [];
        
        return [
            {
                id: 1,
                name: 'Home Address',
                fullName: user.name || 'User',
                address: user.address?.address || '123 Main Street, Apartment 4B',
                city: user.address?.city || 'Mumbai',
                state: user.address?.state || 'Maharashtra',
                zipCode: user.address?.zipCode || '400001',
                phone: user.phone || '+91 9876543210'
            },
            {
                id: 2,
                name: 'Office Address',
                fullName: user.name || 'User',
                address: '456 Business Park, Floor 3',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400002',
                phone: user.phone || '+91 9876543211'
            }
        ];
    };

    // Default pickup points for rental orders
    const defaultPickupPoints = [
        {
            id: 1,
            name: 'Main Store - Bandra West',
            address: 'Shop No. 15, Linking Road, Bandra West, Mumbai',
            phone: '+91 9876543201',
            hours: '10:00 AM - 8:00 PM'
        },
        {
            id: 2,
            name: 'Branch Store - Andheri East',
            address: 'Unit 8, Metro Mall, Andheri East, Mumbai',
            phone: '+91 9876543202',
            hours: '10:00 AM - 8:00 PM'
        },
        {
            id: 3,
            name: 'Downtown Store - Colaba',
            address: 'Ground Floor, Heritage Building, Colaba, Mumbai',
            phone: '+91 9876543203',
            hours: '11:00 AM - 9:00 PM'
        }
    ];

    // Check if cart has rental items
    const hasRentalItems = cart.some(item => item.purchaseType === 'rent');

    // Load default address when component mounts
    useEffect(() => {
        const defaultAddresses = getDefaultAddresses();
        
        if (user?.name) {
            setShippingAddress(prev => ({
                ...prev,
                fullName: user.name
            }));
        }
        
        // Set first default address if no address is set
        if (!shippingAddress.address && defaultAddresses.length > 0) {
            setShippingAddress(defaultAddresses[0]);
        }

        // Set first pickup point if cart has rental items
        if (hasRentalItems && !pickupPoint && defaultPickupPoints.length > 0) {
            setPickupPoint(defaultPickupPoints[0].name);
        }
    }, [user, hasRentalItems]);

    const handleCheckout = async () => {
        if (!isAuthenticated()) {
            alert('Please login to proceed with checkout');
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            alert('Please provide complete shipping address');
            setShowAddressForm(true);
            return;
        }

        // Check pickup point for rental items
        if (hasRentalItems && !pickupPoint) {
            alert('Please select a pickup point for rental items');
            setShowPickupForm(true);
            return;
        }

        setIsCheckingOut(true);
        
        try {
            // Create order first
            const orderId = placeOrder(shippingAddress, pickupPoint);
            
            // Create order data for payment
            const orderData = {
                id: orderId,
                items: [...cart],
                total: getCartTotal(),
                shippingAddress,
                pickupPoint,
                userId: user.id,
                userName: user.name,
                userEmail: user.email
            };

            setCurrentOrder(orderData);
            setShowPaymentModal(true);
        } catch (error) {
            alert('Checkout failed. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handlePaymentComplete = (paymentRequest) => {
        alert(`Order placed successfully! Order ID: ${currentOrder.id}. Payment submitted for approval.`);
        setShowPaymentModal(false);
        setCurrentOrder(null);
        navigate('/dashboard');
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateCartQuantity(itemId, newQuantity);
        }
    };

    const handleAddressChange = (field, value) => {
        setShippingAddress(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const selectDefaultAddress = (address) => {
        setShippingAddress(address);
        setShowAddressForm(false);
    };

    const selectPickupPoint = (point) => {
        setPickupPoint(point.name);
        setShowPickupForm(false);
    };

    // --- Styles ---
    const containerStyle = {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        color: theme.colors.text,
    };

    const titleStyle = {
        textAlign: 'center',
        color: theme.colors.primary,
        marginBottom: '2rem',
        fontSize: '2.5rem',
        fontWeight: 'bold',
    };

    const emptyCartStyle = {
        textAlign: 'center',
        padding: '4rem 0',
    };

    const emptyCartIconStyle = {
        fontSize: '4rem',
        color: theme.colors.textLight,
        marginBottom: '1rem',
    };
    
    const cartGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
    };

    const cartItemStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const itemImageStyle = {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: `2px solid ${theme.colors.accent}`,
        flexShrink: 0,
    };

    const itemDetailsStyle = {
        flexGrow: 1,
    };

    const itemNameStyle = {
        margin: '0 0 0.5rem 0',
        fontSize: '1.3rem',
        color: theme.colors.primary,
        fontWeight: 'bold',
    };

    const itemCategoryStyle = {
        margin: '0 0 0.5rem 0',
        fontSize: '0.9rem',
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: '1px',
    };
    
    const itemPriceStyle = {
        margin: '0.5rem 0',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: theme.colors.accent_dark,
    };

    const purchaseTypeStyle = {
        display: 'inline-block',
        padding: '0.3rem 0.8rem',
        backgroundColor: theme.colors.light_gold,
        color: theme.colors.primary,
        borderRadius: '15px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginTop: '0.5rem',
    };

    const itemSpecsStyle = {
        marginTop: '0.5rem',
        fontSize: '0.9rem',
        color: theme.colors.textLight,
    };

    const summaryStyle = {
        padding: '2rem',
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const summaryTitleStyle = {
        color: theme.colors.primary,
        fontSize: '1.8rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: 'bold',
    };

    const summaryLineStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.1rem',
        marginBottom: '1rem',
        padding: '0.5rem 0',
    };

    const totalStyle = {
        fontWeight: 'bold',
        fontSize: '1.4rem',
        color: theme.colors.primary,
        borderTop: `2px solid ${theme.colors.accent}`,
        paddingTop: '1rem',
        marginTop: '1rem',
    };

    const quantityControlStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: '1rem 0',
    };

    const quantityButtonStyle = {
        ...componentStyles.buttons.secondary,
        padding: '0.5rem',
        width: '35px',
        height: '35px',
        fontSize: '1.2rem',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const quantityInputStyle = {
        width: '50px',
        textAlign: 'center',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        padding: '0.5rem',
        fontSize: '1rem',
        fontWeight: 'bold',
    };

    const removeButtonStyle = {
        ...componentStyles.buttons.secondary,
        backgroundColor: theme.colors.error,
        color: theme.colors.white,
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const checkoutButtonStyle = {
        ...componentStyles.buttons.primary,
        width: '100%',
        marginTop: '1.5rem',
        padding: '1rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    };

    const continueShoppingStyle = {
        ...componentStyles.buttons.secondary,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
    };

    const addressSectionStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const pickupSectionStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const addressFormStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '1rem',
    };

    const addressInputStyle = {
        padding: '0.8rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
    };

    const fullWidthInputStyle = {
        ...addressInputStyle,
        gridColumn: '1 / -1',
    };

    const defaultAddressesStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
    };

    const defaultAddressCardStyle = {
        padding: '1rem',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: theme.colors.white,
    };

    const selectedAddressCardStyle = {
        ...defaultAddressCardStyle,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.light_gold,
    };

    const pickupPointsStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
    };

    const pickupPointCardStyle = {
        padding: '1rem',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: theme.colors.white,
    };

    const selectedPickupCardStyle = {
        ...pickupPointCardStyle,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.light_gold,
    };

    const rentalNoticeStyle = {
        backgroundColor: theme.colors.light_gold,
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>
                <FaShoppingCart style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
                Shopping Cart
            </h1>
            
            {cart.length === 0 ? (
                <div style={emptyCartStyle}>
                    <FaShoppingCart style={emptyCartIconStyle} />
                    <h2 style={{ color: theme.colors.textLight, marginBottom: '1rem' }}>Your cart is empty</h2>
                    <p style={{ color: theme.colors.textLight, marginBottom: '2rem' }}>
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link to="/catalog" style={continueShoppingStyle}>
                        <FaArrowLeft />
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    {/* Rental Notice */}
                    {hasRentalItems && (
                        <div style={rentalNoticeStyle}>
                            <FaInfoCircle style={{ color: theme.colors.primary }} />
                            <div>
                                <strong>Rental Items Detected:</strong> You have rental items in your cart. 
                                Please select a pickup point for these items.
                            </div>
                        </div>
                    )}

                    {/* Shipping Address Section */}
                    <div style={addressSectionStyle}>
                        <h3 style={{ margin: '0 0 1rem 0', color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaMapMarkerAlt />
                            Shipping Address
                        </h3>
                        
                        {!showAddressForm ? (
                            <div>
                                {shippingAddress.address ? (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            Selected Address:
                                        </div>
                                        <div style={{ padding: '1rem', backgroundColor: theme.colors.light_gold, borderRadius: '8px' }}>
                                            <strong>{shippingAddress.fullName}</strong><br />
                                            {shippingAddress.address}<br />
                                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                                            Phone: {shippingAddress.phone}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: theme.colors.textLight, marginBottom: '1rem' }}>No shipping address selected</p>
                                )}
                                
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => setShowAddressForm(true)}
                                        style={{...componentStyles.buttons.secondary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                    >
                                        <FaEdit />
                                        {shippingAddress.address ? 'Edit' : 'Add'} Address
                                    </button>
                                    
                                    {!shippingAddress.address && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {getDefaultAddresses().map(address => (
                                                <button
                                                    key={address.id}
                                                    onClick={() => selectDefaultAddress(address)}
                                                    style={componentStyles.buttons.secondary}
                                                >
                                                    Use {address.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>Quick Select:</h4>
                                    <div style={defaultAddressesStyle}>
                                        {getDefaultAddresses().map(address => (
                                            <div
                                                key={address.id}
                                                style={shippingAddress.id === address.id ? selectedAddressCardStyle : defaultAddressCardStyle}
                                                onClick={() => selectDefaultAddress(address)}
                                            >
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{address.name}</div>
                                                <div>{address.fullName}</div>
                                                <div>{address.address}</div>
                                                <div>{address.city}, {address.state} {address.zipCode}</div>
                                                <div>Phone: {address.phone}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>Or Enter Custom Address:</h4>
                                </div>
                                
                                <div style={addressFormStyle}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={shippingAddress.fullName}
                                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                                        style={addressInputStyle}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={shippingAddress.phone}
                                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                                        style={addressInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={shippingAddress.address}
                                        onChange={(e) => handleAddressChange('address', e.target.value)}
                                        style={fullWidthInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={shippingAddress.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        style={addressInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={shippingAddress.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        style={addressInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={shippingAddress.zipCode}
                                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                        style={addressInputStyle}
                                    />
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <button 
                                        onClick={() => setShowAddressForm(false)}
                                        style={componentStyles.buttons.secondary}
                                    >
                                        Save Address
                                    </button>
                                    <button 
                                        onClick={() => setShowAddressForm(false)}
                                        style={{...componentStyles.buttons.secondary, backgroundColor: theme.colors.textLight}}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pickup Point Section for Rental Items */}
                    {hasRentalItems && (
                        <div style={pickupSectionStyle}>
                            <h3 style={{ margin: '0 0 1rem 0', color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMapMarkerAlt />
                                Pickup Point for Rental Items
                            </h3>
                            
                            {!showPickupForm ? (
                                <div>
                                    {pickupPoint ? (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                Selected Pickup Point:
                                            </div>
                                            <div style={{ padding: '1rem', backgroundColor: theme.colors.light_gold, borderRadius: '8px' }}>
                                                <strong>{pickupPoint}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: theme.colors.textLight, marginBottom: '1rem' }}>No pickup point selected</p>
                                    )}
                                    
                                    <button 
                                        onClick={() => setShowPickupForm(true)}
                                        style={{...componentStyles.buttons.secondary, display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                                    >
                                        <FaEdit />
                                        {pickupPoint ? 'Change' : 'Select'} Pickup Point
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>Select Pickup Point:</h4>
                                        <div style={pickupPointsStyle}>
                                            {defaultPickupPoints.map(point => (
                                                <div
                                                    key={point.id}
                                                    style={pickupPoint === point.name ? selectedPickupCardStyle : pickupPointCardStyle}
                                                    onClick={() => selectPickupPoint(point)}
                                                >
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{point.name}</div>
                                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{point.address}</div>
                                                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>
                                                        Phone: {point.phone}<br />
                                                        Hours: {point.hours}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => setShowPickupForm(false)}
                                            style={componentStyles.buttons.secondary}
                                        >
                                            Confirm Selection
                                        </button>
                                        <button 
                                            onClick={() => setShowPickupForm(false)}
                                            style={{...componentStyles.buttons.secondary, backgroundColor: theme.colors.textLight}}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={cartGridStyle}>
                        {cart.map((item, index) => (
                            <div key={`${item.id}-${index}`} style={cartItemStyle}>
                                <img 
                                    src={item.images?.[0] || item.image} 
                                    alt={item.name} 
                                    style={itemImageStyle}
                                />
                                
                                <div style={itemDetailsStyle}>
                                    <div style={itemCategoryStyle}>{item.category}</div>
                                    <div style={itemNameStyle}>{item.name}</div>
                                    <div style={purchaseTypeStyle}>
                                        {item.purchaseDescription || (item.purchaseType === 'rent' ? 'Rent' : 'Purchase')}
                                    </div>
                                    <div style={itemPriceStyle}>
                                        ₹{item.price.toLocaleString()} {item.purchaseType === 'rent' && 'per day'}
                                    </div>
                                    
                                    {/* Item Specifications */}
                                    <div style={itemSpecsStyle}>
                                        <strong>Specifications:</strong><br />
                                        • Type: {item.type}<br />
                                        • Category: {item.category}<br />
                                        {item.purchaseType === 'rent' && item.rentalDays && (
                                            <>• Rental Duration: {item.rentalDays} day(s)<br /></>
                                        )}
                                        • Stock Available: {item.stock} units
                                    </div>
                                    
                                    <div style={quantityControlStyle}>
                                        <button 
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                                            style={quantityButtonStyle}
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="text" 
                                            value={item.quantity} 
                                            readOnly 
                                            style={quantityInputStyle} 
                                        />
                                        <button 
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                                            style={quantityButtonStyle}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: theme.colors.primary, marginBottom: '1rem' }}>
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        style={removeButtonStyle}
                                    >
                                        <FaTrash />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={summaryStyle}>
                        <h2 style={summaryTitleStyle}>Order Summary</h2>
                        
                        <div style={summaryLineStyle}>
                            <span>Items ({cart.length})</span>
                            <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                        </div>
                        
                        <div style={summaryLineStyle}>
                            <span>Subtotal</span>
                            <span>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        
                        <div style={summaryLineStyle}>
                            <span>Shipping</span>
                            <span style={{ color: theme.colors.success, fontWeight: 'bold' }}>FREE</span>
                        </div>
                        
                        <div style={{ ...summaryLineStyle, ...totalStyle }}>
                            <span>Total</span>
                            <span>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        
                        <button 
                            onClick={handleCheckout} 
                            style={checkoutButtonStyle}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? 'Processing...' : (
                                <>
                                    <FaShoppingCart />
                                    Proceed to Checkout
                                </>
                            )}
                        </button>
                        
                        <Link to="/catalog" style={continueShoppingStyle}>
                            <FaArrowLeft />
                            Continue Shopping
                        </Link>
                    </div>
                </>
            )}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                orderData={currentOrder}
                onPaymentComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default CartPage; 