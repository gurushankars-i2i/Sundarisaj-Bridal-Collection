import React, { useState, useEffect, useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CategoryContext } from '../context/CategoryContext';
import { theme } from '../theme/theme';
import { componentStyles } from '../theme/componentStyles';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaSearch, 
    FaFilter, 
    FaSort, 
    FaEye,
    FaImage,
    FaRupeeSign,
    FaBox,
    FaCalendar,
    FaTag
} from 'react-icons/fa';

const AdminProductManager = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
    const { categories = [] } = useContext(CategoryContext) || { categories: [] };
    
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        isRental: false,
        rentalDays: 1,
        stock: '',
        tags: []
    });

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'price') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleAddProduct = () => {
        setEditingProduct({
            name: '',
            description: '',
            price: '',
            category: '',
            images: [],
            isRental: false,
            rentalDays: 1,
            stock: '',
            tags: []
        });
        setShowAddModal(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            images: product.images || [],
            isRental: product.isRental || false,
            rentalDays: product.rentalDays || 1,
            stock: product.stock?.toString() || '',
            tags: product.tags || []
        });
        setShowEditModal(true);
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(productId);
        }
    };

    const handleSaveProduct = () => {
        const productData = {
            ...editingProduct,
            price: parseFloat(editingProduct.price),
            stock: parseInt(editingProduct.stock) || 0,
            id: showEditModal ? selectedProduct?.id : `PROD_${Date.now()}`,
            createdAt: showEditModal ? selectedProduct?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (showEditModal) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }

        setShowAddModal(false);
        setShowEditModal(false);
        setEditingProduct({
            name: '',
            description: '',
            price: '',
            category: '',
            images: [],
            isRental: false,
            rentalDays: 1,
            stock: '',
            tags: []
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imagePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(images => {
            setEditingProduct(prev => ({
                ...prev,
                images: [...prev.images, ...images]
            }));
        });
    };

    const removeImage = (index) => {
        setEditingProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addTag = (tag) => {
        if (tag.trim() && !editingProduct.tags.includes(tag.trim())) {
            setEditingProduct(prev => ({
                ...prev,
                tags: [...prev.tags, tag.trim()]
            }));
        }
    };

    const removeTag = (tagToRemove) => {
        setEditingProduct(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

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

    const controlsStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
    };

    const productGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
    };

    const productCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        transition: 'transform 0.2s, box-shadow 0.2s'
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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={{ margin: 0, color: theme.colors.primary }}>
                        Product Management
                    </h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: theme.colors.textLight }}>
                        Manage your product catalog, pricing, and inventory
                    </p>
                </div>
                <button
                    onClick={handleAddProduct}
                    style={componentStyles.buttons.primary}
                >
                    <FaPlus style={{ marginRight: '0.5rem' }} />
                    Add Product
                </button>
            </div>

            <div style={controlsStyle}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search products..."
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
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
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
                        <option value="price">Price</option>
                        <option value="category">Category</option>
                        <option value="createdAt">Date Added</option>
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

            <div style={productGridStyle}>
                {filteredProducts.map(product => (
                    <div key={product.id} style={productCardStyle}>
                        <div style={{ marginBottom: '1rem' }}>
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999'
                                }}>
                                    <FaImage size={40} />
                                </div>
                            )}
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>
                            {product.name}
                        </h3>
                        
                        <p style={{ 
                            margin: '0 0 1rem 0', 
                            color: theme.colors.textLight,
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                            {product.description.length > 100 
                                ? `${product.description.substring(0, 100)}...` 
                                : product.description
                            }
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Price:</strong> ₹{product.price}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Category:</strong> {product.category}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Stock:</strong> {product.stock || 0}
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Type:</strong> {product.isRental ? 'Rental' : 'Sale'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleViewProduct(product)}
                                style={componentStyles.buttons.secondary}
                            >
                                <FaEye style={{ marginRight: '0.5rem' }} />
                                View
                            </button>
                            <button
                                onClick={() => handleEditProduct(product)}
                                style={componentStyles.buttons.secondary}
                            >
                                <FaEdit style={{ marginRight: '0.5rem' }} />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                style={{
                                    ...componentStyles.buttons.secondary,
                                    backgroundColor: '#dc3545',
                                    borderColor: '#dc3545',
                                    color: 'white'
                                }}
                            >
                                <FaTrash style={{ marginRight: '0.5rem' }} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || showEditModal) && (
                <div style={modalStyle} onClick={() => setShowAddModal(false) || setShowEditModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 1.5rem 0', color: theme.colors.primary }}>
                            {showAddModal ? 'Add New Product' : 'Edit Product'}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Category *
                                </label>
                                <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Description *
                            </label>
                            <textarea
                                value={editingProduct.description}
                                onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter product description"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    value={editingProduct.stock}
                                    onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    Product Type
                                </label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="radio"
                                            name="productType"
                                            checked={!editingProduct.isRental}
                                            onChange={() => setEditingProduct(prev => ({ 
                                                ...prev, 
                                                isRental: false 
                                            }))}
                                        />
                                        Sale
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="radio"
                                            name="productType"
                                            checked={editingProduct.isRental}
                                            onChange={() => setEditingProduct(prev => ({ 
                                                ...prev, 
                                                isRental: true 
                                            }))}
                                        />
                                        Rental
                                    </label>
                                    {editingProduct.isRental && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>Days:</span>
                                            <input
                                                type="number"
                                                value={editingProduct.rentalDays}
                                                onChange={(e) => setEditingProduct(prev => ({ 
                                                    ...prev, 
                                                    rentalDays: parseInt(e.target.value) || 1 
                                                }))}
                                                style={{
                                                    width: '60px',
                                                    padding: '0.5rem',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px'
                                                }}
                                                min="1"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Product Images
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                            {editingProduct.images.length > 0 && (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                                    gap: '0.5rem', 
                                    marginTop: '1rem' 
                                }}>
                                    {editingProduct.images.map((image, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={image}
                                                alt={`Product ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Tags
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Add a tag"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addTag(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            {editingProduct.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {editingProduct.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                backgroundColor: theme.colors.accent,
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAddModal(false) || setShowEditModal(false)}
                                style={componentStyles.buttons.secondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={!editingProduct.name || !editingProduct.description || !editingProduct.price || !editingProduct.category}
                                style={componentStyles.buttons.primary}
                            >
                                {showAddModal ? 'Add Product' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Product Modal */}
            {showViewModal && selectedProduct && (
                <div style={modalStyle} onClick={() => setShowViewModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: theme.colors.primary }}>
                                {selectedProduct.name}
                            </h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <img
                                        src={selectedProduct.images[0]}
                                        alt={selectedProduct.name}
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '300px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#999'
                                    }}>
                                        <FaImage size={60} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 style={{ color: theme.colors.primary, marginBottom: '1rem' }}>Product Details</h3>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Description:</strong>
                                    <p style={{ margin: '0.5rem 0', lineHeight: '1.5' }}>
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <strong>Price:</strong> ₹{selectedProduct.price}
                                    </div>
                                    <div>
                                        <strong>Category:</strong> {selectedProduct.category}
                                    </div>
                                    <div>
                                        <strong>Stock:</strong> {selectedProduct.stock || 0}
                                    </div>
                                    <div>
                                        <strong>Type:</strong> {selectedProduct.isRental ? 'Rental' : 'Sale'}
                                    </div>
                                </div>

                                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong>Tags:</strong>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            {selectedProduct.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        backgroundColor: theme.colors.accent,
                                                        color: 'white',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Created:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleEditProduct(selectedProduct);
                                        }}
                                        style={componentStyles.buttons.primary}
                                    >
                                        <FaEdit style={{ marginRight: '0.5rem' }} />
                                        Edit Product
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(selectedProduct.id)}
                                        style={{
                                            ...componentStyles.buttons.secondary,
                                            backgroundColor: '#dc3545',
                                            borderColor: '#dc3545',
                                            color: 'white'
                                        }}
                                    >
                                        <FaTrash style={{ marginRight: '0.5rem' }} />
                                        Delete Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductManager; 