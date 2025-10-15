import React, { useState, useEffect } from 'react';
import sharedDataService from '../services/sharedDataService';
import { theme } from '../theme/theme';
import { FaStar, FaCheck, FaTimes, FaEye, FaImage, FaVideo, FaUser } from 'react-icons/fa';

const AdminReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        loadReviews();
        loadStatistics();
    }, []);

    const loadReviews = () => {
        const allReviews = sharedDataService.getAllReviews();
        setReviews(allReviews);
    };

    const loadStatistics = () => {
        const stats = sharedDataService.getReviewStatistics();
        setStatistics(stats);
    };

    const handleApprove = (reviewId) => {
        sharedDataService.updateReviewStatus(reviewId, 'approved');
        loadReviews();
        loadStatistics();
        alert('Review approved successfully!');
    };

    const handleReject = (reviewId) => {
        if (window.confirm('Are you sure you want to reject this review?')) {
            sharedDataService.updateReviewStatus(reviewId, 'rejected');
            loadReviews();
            loadStatistics();
            alert('Review rejected successfully!');
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                        key={star}
                        style={{
                            color: star <= rating ? '#ffc107' : '#e0e0e0',
                            fontSize: '1rem'
                        }}
                    />
                ))}
            </div>
        );
    };

    const containerStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };

    const headerStyle = {
        marginBottom: '2rem'
    };

    const statsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        textAlign: 'center'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem'
    };

    const filterButtonStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        backgroundColor: isActive ? theme.colors.primary : theme.colors.white,
        color: isActive ? theme.colors.white : theme.colors.text,
        border: `1px solid ${theme.colors.primary}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.3s ease'
    });

    const reviewListStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    };

    const reviewCardStyle = {
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease'
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            pending: { bg: '#fff3cd', color: '#856404' },
            approved: { bg: '#d4edda', color: '#155724' },
            rejected: { bg: '#f8d7da', color: '#721c24' }
        };
        const style = colors[status] || colors.pending;
        return {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            backgroundColor: style.bg,
            color: style.color,
            textTransform: 'capitalize'
        };
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
    };

    const modalStyle = {
        backgroundColor: theme.colors.white,
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={{ color: theme.colors.primary, marginBottom: '0.5rem' }}>Review Management</h2>
                <p style={{ color: theme.colors.textLight, marginBottom: 0 }}>
                    Moderate customer reviews and feedback
                </p>
            </div>

            {/* Statistics */}
            {statistics && (
                <div style={statsContainerStyle}>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.primary }}>
                            {statistics.total}
                        </div>
                        <div style={{ color: theme.colors.textLight }}>Total Reviews</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                            {statistics.averageRating}
                        </div>
                        <div style={{ color: theme.colors.textLight }}>Average Rating</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                            {statistics.pending}
                        </div>
                        <div style={{ color: theme.colors.textLight }}>Pending</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                            {statistics.approved}
                        </div>
                        <div style={{ color: theme.colors.textLight }}>Approved</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={filterContainerStyle}>
                <button
                    style={filterButtonStyle(filter === 'all')}
                    onClick={() => setFilter('all')}
                >
                    All Reviews ({reviews.length})
                </button>
                <button
                    style={filterButtonStyle(filter === 'pending')}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({reviews.filter(r => r.status === 'pending').length})
                </button>
                <button
                    style={filterButtonStyle(filter === 'approved')}
                    onClick={() => setFilter('approved')}
                >
                    Approved ({reviews.filter(r => r.status === 'approved').length})
                </button>
                <button
                    style={filterButtonStyle(filter === 'rejected')}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected ({reviews.filter(r => r.status === 'rejected').length})
                </button>
            </div>

            {/* Review List */}
            <div style={reviewListStyle}>
                {filteredReviews.length > 0 ? (
                    filteredReviews.map(review => (
                        <div key={review.id} style={reviewCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FaUser style={{ color: theme.colors.textLight }} />
                                        <strong>{review.userName}</strong>
                                        {review.isVerifiedPurchase && (
                                            <span style={{ fontSize: '0.8rem', color: '#28a745' }}>✓ Verified Purchase</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                        {review.productName}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: theme.colors.textLight }}>
                                        {new Date(review.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <span style={statusBadgeStyle(review.status)}>{review.status}</span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                {renderStars(review.rating)}
                            </div>

                            <p style={{ marginBottom: '1rem', color: theme.colors.text }}>
                                {review.comment}
                            </p>

                            {/* Media Preview */}
                            {(review.images?.length > 0 || review.videos?.length > 0) && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        {review.images?.length > 0 && (
                                            <span style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                <FaImage /> {review.images.length} photo(s)
                                            </span>
                                        )}
                                        {review.videos?.length > 0 && (
                                            <span style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                                                <FaVideo /> {review.videos.length} video(s)
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {review.images?.slice(0, 3).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Review ${idx + 1}`}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setSelectedReview(review);
                                                    setShowDetailModal(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        setSelectedReview(review);
                                        setShowDetailModal(true);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        backgroundColor: theme.colors.info,
                                        color: theme.colors.white,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <FaEye /> View Details
                                </button>
                                {review.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: theme.colors.success,
                                                color: theme.colors.white,
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(review.id)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: theme.colors.error,
                                                color: theme.colors.white,
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textLight }}>
                        <p>No reviews found for the selected filter.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedReview && (
                <div style={modalOverlayStyle} onClick={() => setShowDetailModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: theme.colors.primary }}>Review Details</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: theme.colors.textLight
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Customer:</strong> {selectedReview.userName} ({selectedReview.userEmail})
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Product:</strong> {selectedReview.productName}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Order ID:</strong> {selectedReview.orderId}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Rating:</strong> {renderStars(selectedReview.rating)}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Date:</strong> {new Date(selectedReview.createdAt).toLocaleString()}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Status:</strong> <span style={statusBadgeStyle(selectedReview.status)}>{selectedReview.status}</span>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong>Review:</strong>
                            <p style={{ marginTop: '0.5rem', color: theme.colors.text }}>{selectedReview.comment}</p>
                        </div>

                        {/* All Images */}
                        {selectedReview.images?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <strong>Photos:</strong>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {selectedReview.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Review ${idx + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Videos */}
                        {selectedReview.videos?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <strong>Videos:</strong>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {selectedReview.videos.map((video, idx) => (
                                        <video
                                            key={idx}
                                            src={video}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedReview.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => {
                                        handleApprove(selectedReview.id);
                                        setShowDetailModal(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: theme.colors.success,
                                        color: theme.colors.white,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <FaCheck /> Approve Review
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(selectedReview.id);
                                        setShowDetailModal(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: theme.colors.error,
                                        color: theme.colors.white,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <FaTimes /> Reject Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviewManager;

