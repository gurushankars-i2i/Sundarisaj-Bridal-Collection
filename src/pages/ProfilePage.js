import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthSystem } from '../context/UnifiedAuthContext';
import { CartContext } from '../context/CartContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import AccountDeletionModal from '../components/AccountDeletionModal';
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt, 
    FaEdit, 
    FaPlus, 
    FaTrash, 
    FaShoppingBag, 
    FaCalendarAlt, 
    FaRupeeSign,
    FaCheckCircle,
    FaClock,
    FaTruck,
    FaStar,
    FaHeart,
    FaCog,
    FaShieldAlt,
    FaDownload,
    FaExclamationTriangle
} from 'react-icons/fa';

const ProfilePage = () => {
    const { user, logout } = useAuthSystem();
    const { getOrders, placeOrder } = useContext(CartContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showAccountDeletionModal, setShowAccountDeletionModal] = useState(false);
    
    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || ''
    });
    
    // Address form state
    const [addressForm, setAddressForm] = useState({
        name: '',
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        isDefault: false
    });
    
    // Default addresses for demo
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: 'Home Address',
            fullName: 'Demo User',
            address: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '+91 9876543210',
            isDefault: true
        },
        {
            id: 2,
            name: 'Office Address',
            fullName: 'Demo User',
            address: '456 Business Park, Floor 3',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400002',
            phone: '+91 9876543211',
            isDefault: false
        }
    ]);

    // Load orders on component mount
    useEffect(() => {
        const userOrders = getOrders();
        setOrders(userOrders || []);
    }, [getOrders]);

    // Load profile data
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = () => {
        // In a real app, this would update the user profile via API
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
    };

    const handleAddressSave = () => {
        if (!addressForm.name || !addressForm.address) {
            alert('Please fill in all required fields');
            return;
        }

        if (selectedAddressId) {
            // Update existing address
            setAddresses(prev => prev.map(addr => 
                addr.id === selectedAddressId ? { ...addressForm, id: selectedAddressId } : addr
            ));
        } else {
            // Add new address
            const newAddress = {
                ...addressForm,
                id: Date.now(),
                fullName: addressForm.fullName || user?.name || 'Demo User'
            };
            setAddresses(prev => [...prev, newAddress]);
        }

        setAddressForm({
            name: '',
            fullName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            isDefault: false
        });
        setSelectedAddressId(null);
        setIsEditingAddress(false);
    };

    const handleAddressEdit = (address) => {
        setAddressForm(address);
        setSelectedAddressId(address.id);
        setIsEditingAddress(true);
    };

    const handleAddressDelete = (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        }
    };

    const handleRepeatOrder = (order) => {
        // Implementation for repeating an order
        console.log('Repeating order:', order);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getOrderStatus = (order) => {
        // Mock order status based on order date
        const orderDate = new Date(order.date);
        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 1) return { status: 'Processing', color: theme.colors.warning, icon: FaClock };
        if (daysDiff < 3) return { status: 'Shipped', color: theme.colors.info, icon: FaTruck };
        if (daysDiff < 7) return { status: 'Delivered', color: theme.colors.success, icon: FaCheckCircle };
        return { status: 'Completed', color: theme.colors.success, icon: FaCheckCircle };
    };

    const containerStyle = {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        color: theme.colors.text,
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '3rem',
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

    const tabContainerStyle = {
        display: 'flex',
        marginBottom: '2rem',
        borderBottom: `2px solid ${theme.colors.accent}`,
    };

    const tabStyle = {
        padding: '1rem 2rem',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: theme.colors.textLight,
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s ease',
    };

    const activeTabStyle = {
        ...tabStyle,
        color: theme.colors.primary,
        borderBottomColor: theme.colors.primary,
    };

    const contentStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${theme.colors.accent}`,
    };

    const sectionStyle = {
        marginBottom: '2rem',
    };

    const sectionTitleStyle = {
        color: theme.colors.primary,
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const formGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem',
    };

    const inputStyle = {
        padding: '0.8rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        fontSize: '1rem',
    };

    const fullWidthInputStyle = {
        ...inputStyle,
        gridColumn: '1 / -1',
    };

    const addressCardStyle = {
        padding: '1.5rem',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        marginBottom: '1rem',
        backgroundColor: theme.colors.white,
    };

    const defaultAddressCardStyle = {
        ...addressCardStyle,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.light_gold,
    };

    const orderCardStyle = {
        padding: '1.5rem',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        marginBottom: '1rem',
        backgroundColor: theme.colors.white,
    };

    const orderHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${theme.colors.accent}`,
    };

    const orderItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.5rem 0',
        borderBottom: `1px solid ${theme.colors.light_gold}`,
    };

    const itemImageStyle = {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: `1px solid ${theme.colors.accent}`,
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
    };

    const statCardStyle = {
        padding: '1.5rem',
        backgroundColor: theme.colors.light_gold,
        borderRadius: '8px',
        textAlign: 'center',
        border: `1px solid ${theme.colors.accent}`,
    };

    const statValueStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '0.5rem',
    };

    const statLabelStyle = {
        color: theme.colors.textLight,
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    };

    if (!user) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <h2>Please login to view your profile</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        style={componentStyles.buttons.primary}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>My Profile</h1>
                <p style={subtitleStyle}>Manage your account, addresses, and view order history</p>
            </div>

            <div style={tabContainerStyle}>
                <button 
                    style={activeTab === 'profile' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('profile')}
                >
                    <FaUser style={{ marginRight: '0.5rem' }} />
                    Profile
                </button>
                <button 
                    style={activeTab === 'addresses' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('addresses')}
                >
                    <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
                    Addresses ({addresses.length})
                </button>
                <button 
                    style={activeTab === 'orders' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('orders')}
                >
                    <FaShoppingBag style={{ marginRight: '0.5rem' }} />
                    Orders ({orders.length})
                </button>
                <button 
                    style={activeTab === 'account-settings' ? activeTabStyle : tabStyle}
                    onClick={() => setActiveTab('account-settings')}
                >
                    <FaCog style={{ marginRight: '0.5rem' }} />
                    Account Settings
                </button>
            </div>

            <div style={contentStyle}>
                {activeTab === 'profile' && (
                    <div>
                        <div style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>
                                <FaUser />
                                Personal Information
                            </h2>
                            
                            {!isEditingProfile ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <strong>Name:</strong> {profileForm.name}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {profileForm.email}
                                    </div>
                                    <div>
                                        <strong>Phone:</strong> {profileForm.phone || 'Not provided'}
                                    </div>
                                    <div>
                                        <strong>Date of Birth:</strong> {profileForm.dateOfBirth || 'Not provided'}
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                        <button 
                                            onClick={() => setIsEditingProfile(true)}
                                            style={componentStyles.buttons.secondary}
                                        >
                                            <FaEdit style={{ marginRight: '0.5rem' }} />
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={formGridStyle}>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={handleProfileUpdate}
                                            style={componentStyles.buttons.primary}
                                        >
                                            Save Changes
                                        </button>
                                        <button 
                                            onClick={() => setIsEditingProfile(false)}
                                            style={componentStyles.buttons.secondary}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>
                                <FaStar />
                                Account Statistics
                            </h2>
                            <div style={statsGridStyle}>
                                <div style={statCardStyle}>
                                    <div style={statValueStyle}>{orders.length}</div>
                                    <div style={statLabelStyle}>Total Orders</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={statValueStyle}>{addresses.length}</div>
                                    <div style={statLabelStyle}>Saved Addresses</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={statValueStyle}>
                                        ₹{orders.reduce((total, order) => total + order.total, 0).toLocaleString()}
                                    </div>
                                    <div style={statLabelStyle}>Total Spent</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={statValueStyle}>
                                        {orders.filter(order => getOrderStatus(order).status === 'Delivered').length}
                                    </div>
                                    <div style={statLabelStyle}>Completed Orders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={sectionTitleStyle}>
                                <FaMapMarkerAlt />
                                Saved Addresses
                            </h2>
                            <button 
                                onClick={() => {
                                    setAddressForm({
                                        name: '',
                                        fullName: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        zipCode: '',
                                        phone: '',
                                        isDefault: false
                                    });
                                    setSelectedAddressId(null);
                                    setIsEditingAddress(true);
                                }}
                                style={componentStyles.buttons.primary}
                            >
                                <FaPlus style={{ marginRight: '0.5rem' }} />
                                Add New Address
                            </button>
                        </div>

                        {isEditingAddress && (
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: `1px solid ${theme.colors.accent}`, borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '1rem', color: theme.colors.primary }}>
                                    {selectedAddressId ? 'Edit Address' : 'Add New Address'}
                                </h3>
                                <div style={formGridStyle}>
                                    <input
                                        type="text"
                                        placeholder="Address Name (e.g., Home, Office)"
                                        value={addressForm.name}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={addressForm.fullName}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={addressForm.address}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                        style={fullWidthInputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={addressForm.zipCode}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button 
                                        onClick={handleAddressSave}
                                        style={componentStyles.buttons.primary}
                                    >
                                        {selectedAddressId ? 'Update Address' : 'Save Address'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsEditingAddress(false);
                                            setSelectedAddressId(null);
                                        }}
                                        style={componentStyles.buttons.secondary}
                                    >
                                        Cancel
                                    </button>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={addressForm.isDefault}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        />
                                        Set as default address
                                    </label>
                                </div>
                            </div>
                        )}

                        {addresses.map(address => (
                            <div key={address.id} style={address.isDefault ? defaultAddressCardStyle : addressCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                                            {address.name}
                                            {address.isDefault && (
                                                <span style={{ 
                                                    marginLeft: '0.5rem', 
                                                    fontSize: '0.8rem', 
                                                    backgroundColor: theme.colors.primary, 
                                                    color: 'white', 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '4px' 
                                                }}>
                                                    Default
                                                </span>
                                            )}
                                        </h3>
                                        <div>
                                            <strong>{address.fullName}</strong><br />
                                            {address.address}<br />
                                            {address.city}, {address.state} {address.zipCode}<br />
                                            Phone: {address.phone}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => handleAddressEdit(address)}
                                            style={{...componentStyles.buttons.secondary, padding: '0.5rem'}}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => handleAddressDelete(address.id)}
                                            style={{...componentStyles.buttons.secondary, padding: '0.5rem', backgroundColor: theme.colors.error, color: 'white'}}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h2 style={sectionTitleStyle}>
                            <FaShoppingBag />
                            Order History
                        </h2>

                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: theme.colors.textLight }}>
                                <FaShoppingBag style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                <h3>No orders yet</h3>
                                <p>Start shopping to see your order history here</p>
                                <button 
                                    onClick={() => navigate('/catalog')}
                                    style={componentStyles.buttons.primary}
                                >
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            orders.map(order => {
                                const orderStatus = getOrderStatus(order);
                                const StatusIcon = orderStatus.icon;
                                
                                return (
                                    <div key={order.id} style={orderCardStyle}>
                                        <div style={orderHeaderStyle}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                                                    Order #{order.id}
                                                </h3>
                                                <div style={{ color: theme.colors.textLight, fontSize: '0.9rem' }}>
                                                    <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                                                    {new Date(order.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.5rem', 
                                                    color: orderStatus.color,
                                                    fontWeight: 'bold',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <StatusIcon />
                                                    {orderStatus.status}
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                                    ₹{order.total.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong>Shipping Address:</strong><br />
                                            {order.shippingAddress?.fullName}<br />
                                            {order.shippingAddress?.address}<br />
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong>Items ({order.items.length}):</strong>
                                            {order.items.map((item, index) => (
                                                <div key={index} style={orderItemStyle}>
                                                    <img 
                                                        src={item.images?.[0] || item.image} 
                                                        alt={item.name} 
                                                        style={itemImageStyle}
                                                    />
                                                    <div style={{ flexGrow: 1 }}>
                                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                        <div style={{ color: theme.colors.textLight, fontSize: '0.9rem' }}>
                                                            {item.purchaseDescription || (item.purchaseType === 'rent' ? 'Rent' : 'Purchase')}
                                                        </div>
                                                        <div style={{ color: theme.colors.textLight, fontSize: '0.9rem' }}>
                                                            Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>Total:</strong> ₹{order.total.toLocaleString()}
                                            </div>
                                            <button 
                                                onClick={() => handleRepeatOrder(order)}
                                                style={componentStyles.buttons.secondary}
                                            >
                                                <FaHeart style={{ marginRight: '0.5rem' }} />
                                                Repeat Order
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'account-settings' && (
                    <div>
                        <h2 style={sectionTitleStyle}>
                            <FaCog />
                            Account Settings
                        </h2>

                        <div style={sectionStyle}>
                            <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>
                                <FaShieldAlt style={{ marginRight: '0.5rem' }} />
                                Privacy & Data
                            </h3>
                            
                            <div style={{ 
                                padding: '1.5rem', 
                                backgroundColor: theme.colors.light_gold, 
                                borderRadius: '8px',
                                border: `1px solid ${theme.colors.accent}`,
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ color: theme.colors.primary, marginBottom: '0.5rem' }}>
                                    Export Your Data
                                </h4>
                                <p style={{ color: theme.colors.textLight, marginBottom: '1rem' }}>
                                    Download all your data before deleting your account (GDPR compliant).
                                </p>
                                <button 
                                    onClick={() => setShowAccountDeletionModal(true)}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: theme.colors.primary,
                                        color: 'white'
                                    }}
                                >
                                    <FaDownload style={{ marginRight: '0.5rem' }} />
                                    Export My Data
                                </button>
                            </div>

                            <div style={{ 
                                padding: '1.5rem', 
                                backgroundColor: '#fef3cd', 
                                borderRadius: '8px',
                                border: '1px solid #fbbf24',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>
                                    <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                                    Deactivate Account
                                </h4>
                                <p style={{ color: '#92400e', marginBottom: '1rem' }}>
                                    Temporarily deactivate your account. You can recover it within 30 days.
                                </p>
                                <button 
                                    onClick={() => setShowAccountDeletionModal(true)}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: '#f59e0b',
                                        color: 'white'
                                    }}
                                >
                                    <FaTrash style={{ marginRight: '0.5rem' }} />
                                    Deactivate Account
                                </button>
                            </div>

                            <div style={{ 
                                padding: '1.5rem', 
                                backgroundColor: '#fee2e2', 
                                borderRadius: '8px',
                                border: '1px solid #f87171'
                            }}>
                                <h4 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>
                                    <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                                    Permanently Delete Account
                                </h4>
                                <p style={{ color: '#991b1b', marginBottom: '1rem' }}>
                                    This action cannot be undone. All your data will be permanently deleted.
                                </p>
                                <button 
                                    onClick={() => setShowAccountDeletionModal(true)}
                                    style={{
                                        ...componentStyles.buttons.secondary,
                                        backgroundColor: '#dc2626',
                                        color: 'white'
                                    }}
                                >
                                    <FaTrash style={{ marginRight: '0.5rem' }} />
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>
                                <FaUser style={{ marginRight: '0.5rem' }} />
                                Account Actions
                            </h3>
                            
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={handleLogout}
                                    style={componentStyles.buttons.secondary}
                                >
                                    <FaUser style={{ marginRight: '0.5rem' }} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Account Deletion Modal */}
            <AccountDeletionModal 
                isOpen={showAccountDeletionModal}
                onClose={() => setShowAccountDeletionModal(false)}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default ProfilePage; 