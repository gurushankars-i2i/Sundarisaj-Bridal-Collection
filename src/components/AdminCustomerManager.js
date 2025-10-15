import React, { useState, useEffect } from 'react';
import sharedDataService from '../services/sharedDataService';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { 
    FaUsers, 
    FaSearch, 
    FaFilter, 
    FaSort, 
    FaEye, 
    FaEdit, 
    FaTrash, 
    FaUserCheck,
    FaUserTimes,
    FaUserCog,
    FaShoppingBag,
    FaRupeeSign,
    FaCalendar,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaChartLine,
    FaChartPie,
    FaDownload,
    FaUpload
} from 'react-icons/fa';

const AdminCustomerManager = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        loadCustomers();
        
        // Listen for data changes
        const handleDataChange = (data) => {
            setCustomers(data.users || []);
        };
        
        sharedDataService.addListener('dataChanged', handleDataChange);
        
        return () => {
            sharedDataService.removeListener('dataChanged', handleDataChange);
        };
    }, []);

    useEffect(() => {
        filterAndSortCustomers();
    }, [customers, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

    const loadCustomers = () => {
        const allCustomers = sharedDataService.getAllUsers();
        setCustomers(allCustomers);
    };

    const filterAndSortCustomers = () => {
        let filtered = customers.filter(customer => {
            const matchesSearch = !searchTerm || 
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone?.includes(searchTerm);
            
            const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' ? customer.isActive : !customer.isActive);
            
            return matchesSearch && matchesRole && matchesStatus;
        });

        // Sort customers
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredCustomers(filtered);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer({ ...customer });
        setShowEditModal(true);
    };

    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerModal(true);
    };

    const handleDeleteCustomer = (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            sharedDataService.updateUser(customerId, { isDeleted: true, isActive: false });
            loadCustomers();
        }
    };

    const handleToggleCustomerStatus = (customerId, currentStatus) => {
        const customer = customers.find(c => c.id === customerId);
        
        // Prevent admins from deactivating themselves
        if (customer.role === 'admin') {
            alert('❌ Admins cannot be deactivated for security reasons.');
            return;
        }
        
        const newStatus = !currentStatus;
        sharedDataService.updateUser(customerId, { isActive: newStatus });
        loadCustomers();
        
        // Show confirmation message
        alert(`✅ Customer ${customer.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    };

    const handleSaveCustomer = () => {
        if (editingCustomer) {
            sharedDataService.updateUser(editingCustomer.id, editingCustomer);
            setShowEditModal(false);
            setEditingCustomer(null);
            loadCustomers();
        }
    };

    const getCustomerStats = () => {
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => c.isActive).length;
        const inactiveCustomers = totalCustomers - activeCustomers;
        const userCustomers = customers.filter(c => c.role === 'user').length;
        const adminCustomers = customers.filter(c => c.role === 'admin').length;
        const staffCustomers = customers.filter(c => c.role === 'staff').length;

        // Calculate total orders and sales across all customers
        const totalOrders = customers.reduce((sum, customer) => {
            const customerOrders = getCustomerOrders(customer.id);
            return sum + customerOrders.length;
        }, 0);

        const totalSales = customers.reduce((sum, customer) => {
            return sum + getCustomerTotalSpent(customer.id);
        }, 0);

        return {
            totalCustomers,
            activeCustomers,
            inactiveCustomers,
            userCustomers,
            adminCustomers,
            staffCustomers,
            totalOrders,
            totalSales
        };
    };

    const getCustomerOrders = (customerId) => {
        return sharedDataService.getUserOrders(customerId);
    };

    const getCustomerTotalSpent = (customerId) => {
        const orders = getCustomerOrders(customerId);
        return orders.reduce((sum, order) => sum + (order.total || 0), 0);
    };

    const exportCustomerData = () => {
        const data = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            role: customer.role,
            isActive: customer.isActive,
            createdAt: customer.createdAt,
            lastLogin: customer.lastLogin,
            totalOrders: getCustomerOrders(customer.id).length,
            totalSpent: getCustomerTotalSpent(customer.id)
        }));

        const csvContent = [
            ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created', 'Last Login', 'Total Orders', 'Total Spent'],
            ...data.map(row => [
                row.id,
                row.name,
                row.email,
                row.phone,
                row.role,
                row.isActive ? 'Active' : 'Inactive',
                new Date(row.createdAt).toLocaleDateString(),
                row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never',
                row.totalOrders,
                `₹${row.totalSpent.toLocaleString()}`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const stats = getCustomerStats();

    const containerStyle = {
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    };

    const controlsStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
    };

    const customerGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
    };

    const customerCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={{ margin: 0, color: theme.colors.primary }}>
                        Customer Management
                    </h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: theme.colors.textLight }}>
                        Manage customer accounts, view order history, and analyze customer data
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        style={componentStyles.buttons.secondary}
                    >
                        <FaChartLine style={{ marginRight: '0.5rem' }} />
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </button>
                    <button
                        onClick={exportCustomerData}
                        style={componentStyles.buttons.secondary}
                    >
                        <FaDownload style={{ marginRight: '0.5rem' }} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Customer Statistics */}
            <div style={statsGridStyle}>
                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onClick={() => setStatusFilter('all')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaUsers size={40} color={theme.colors.primary} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                        {stats.totalCustomers}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Customers</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Click to view all
                    </div>
                </div>
                
                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onClick={() => setStatusFilter('active')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaUserCheck size={40} color={theme.colors.success} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.success }}>
                        {stats.activeCustomers}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Active Customers</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Click to filter active
                    </div>
                </div>
                
                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onClick={() => setStatusFilter('inactive')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaUserTimes size={40} color={theme.colors.warning} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.warning }}>
                        {stats.inactiveCustomers}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Inactive Customers</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Click to filter inactive
                    </div>
                </div>
                
                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onClick={() => setRoleFilter('user')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaShoppingBag size={40} color={theme.colors.info} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.info }}>
                        {stats.userCustomers}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Regular Users</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Click to filter users
                    </div>
                </div>

                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaShoppingBag size={40} color={theme.colors.success} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.success }}>
                        {stats.totalOrders}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Orders</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Across all customers
                    </div>
                </div>

                <div 
                    style={{...statCardStyle, cursor: 'pointer'}}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <FaRupeeSign size={40} color={theme.colors.warning} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.warning }}>
                        ₹{stats.totalSales.toLocaleString()}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Sales</p>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight, marginTop: '0.5rem' }}>
                        Revenue generated
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={controlsStyle}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '200px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaFilter />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaFilter />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaSort />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                        <option value="createdAt">Date Created</option>
                        <option value="lastLogin">Last Login</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        style={{
                            ...componentStyles.buttons.secondary,
                            padding: '0.5rem',
                            minWidth: 'auto'
                        }}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Customer Grid */}
            <div style={customerGridStyle}>
                {filteredCustomers.map(customer => (
                    <div key={customer.id} style={customerCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                                    {customer.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FaEnvelope size={14} />
                                    <span style={{ fontSize: '0.9rem' }}>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FaPhone size={14} />
                                        <span style={{ fontSize: '0.9rem' }}>{customer.phone}</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '20px',
                                backgroundColor: customer.isActive ? '#28a745' : '#dc3545',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {customer.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Role:</strong> {customer.role}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Member Since:</strong> {new Date(customer.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Orders:</strong> {getCustomerOrders(customer.id).length}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Total Spent:</strong> ₹{getCustomerTotalSpent(customer.id).toLocaleString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleViewCustomer(customer)}
                                style={componentStyles.buttons.secondary}
                            >
                                <FaEye style={{ marginRight: '0.5rem' }} />
                                View
                            </button>
                            <button
                                onClick={() => handleEditCustomer(customer)}
                                style={componentStyles.buttons.secondary}
                            >
                                <FaEdit style={{ marginRight: '0.5rem' }} />
                                Edit
                            </button>
                            <button
                                onClick={() => handleToggleCustomerStatus(customer.id, customer.isActive)}
                                style={{
                                    ...componentStyles.buttons.secondary,
                                    backgroundColor: customer.isActive ? '#dc3545' : '#28a745',
                                    borderColor: customer.isActive ? '#dc3545' : '#28a745',
                                    color: 'white'
                                }}
                            >
                                {customer.isActive ? <FaUserTimes /> : <FaUserCheck />}
                                {customer.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer Detail Modal */}
            {showCustomerModal && selectedCustomer && (
                <div style={modalStyle} onClick={() => setShowCustomerModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: theme.colors.primary }}>
                                Customer Details: {selectedCustomer.name}
                            </h2>
                            <button
                                onClick={() => setShowCustomerModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Profile Information</h3>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Name:</strong> {selectedCustomer.name}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Email:</strong> {selectedCustomer.email}
                                </div>
                                {selectedCustomer.phone && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong>Phone:</strong> {selectedCustomer.phone}
                                    </div>
                                )}
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Role:</strong> {selectedCustomer.role}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Status:</strong> 
                                    <span style={{ 
                                        color: selectedCustomer.isActive ? '#28a745' : '#dc3545',
                                        fontWeight: 'bold',
                                        marginLeft: '0.5rem'
                                    }}>
                                        {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Member Since:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Last Login:</strong> {selectedCustomer.lastLogin ? new Date(selectedCustomer.lastLogin).toLocaleDateString() : 'Never'}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Order History</h3>
                                {getCustomerOrders(selectedCustomer.id).length > 0 ? (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {getCustomerOrders(selectedCustomer.id).map(order => (
                                            <div key={order.id} style={{ 
                                                padding: '1rem', 
                                                border: '1px solid #e0e0e0', 
                                                borderRadius: '6px', 
                                                marginBottom: '1rem' 
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <strong>Order #{order.id}</strong>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.5rem', 
                                                        borderRadius: '12px',
                                                        backgroundColor: theme.colors.accent,
                                                        color: 'white',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                    Date: {new Date(order.date).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                    Total: ₹{order.total.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: theme.colors.textLight }}>No orders found.</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button
                                onClick={() => {
                                    setShowCustomerModal(false);
                                    handleEditCustomer(selectedCustomer);
                                }}
                                style={componentStyles.buttons.primary}
                            >
                                <FaEdit style={{ marginRight: '0.5rem' }} />
                                Edit Customer
                            </button>
                            <button
                                onClick={() => setShowCustomerModal(false)}
                                style={componentStyles.buttons.secondary}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && editingCustomer && (
                <div style={modalStyle} onClick={() => setShowEditModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 1.5rem 0', color: theme.colors.primary }}>
                            Edit Customer: {editingCustomer.name}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={editingCustomer.name}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, name: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={editingCustomer.email}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, email: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={editingCustomer.phone || ''}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Role *
                                </label>
                                <select
                                    value={editingCustomer.role}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, role: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="user">User</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={editingCustomer.isActive}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                                Active Account
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={componentStyles.buttons.secondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCustomer}
                                disabled={!editingCustomer.name || !editingCustomer.email}
                                style={componentStyles.buttons.primary}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerManager; 