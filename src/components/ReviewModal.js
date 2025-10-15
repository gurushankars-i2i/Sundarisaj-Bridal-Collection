import React, { useState } from 'react';
import { FaStar, FaTimes, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { theme } from '../theme/theme';

const ReviewModal = ({ isOpen, onClose, order, onSubmitReview }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }

        if (comment.trim().length < 10) {
            alert('Please write a review with at least 10 characters.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const review = {
                id: `review-${Date.now()}`,
                orderId: order.id,
                productId: order.items[0]?.id, // Assuming single product for simplicity
                productName: order.items[0]?.name,
                userId: order.userId,
                userName: order.userName,
                userEmail: order.userEmail,
                rating: rating,
                comment: comment.trim(),
                images: images,
                videos: videos,
                isVerifiedPurchase: true,
                createdAt: new Date().toISOString(),
                helpful: 0,
                reported: false,
                status: 'pending' // pending, approved, rejected
            };

            await onSubmitReview(review);
            onClose();
            setRating(0);
            setComment('');
            setImages([]);
            setVideos([]);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const readers = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(readers).then(results => {
            setImages(prev => [...prev, ...results].slice(0, 5)); // Limit to 5 images
        });
    };

    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const readers = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(readers).then(results => {
            setVideos(prev => [...prev, ...results].slice(0, 2)); // Limit to 2 videos
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setRating(0);
            setComment('');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
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
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: theme.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FaStar />
                        Write a Review
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            color: '#6c757d'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Order Information */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Order Details</h3>
                    <div style={{ fontSize: '0.9rem' }}>
                        <div><strong>Order ID:</strong> {order.id}</div>
                        <div><strong>Product:</strong> {order.items[0]?.name}</div>
                        <div><strong>Delivered:</strong> {order.delivery?.deliveredAt ? new Date(order.delivery.deliveredAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>

                {/* Rating Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: theme.colors.text
                    }}>
                        Your Rating *
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                size={30}
                                style={{
                                    cursor: 'pointer',
                                    color: star <= (hoverRating || rating) ? '#ffc107' : '#e0e0e0',
                                    transition: 'color 0.2s ease'
                                }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            />
                        ))}
                        <span style={{
                            marginLeft: '1rem',
                            fontSize: '0.9rem',
                            color: '#6c757d'
                        }}>
                            {rating > 0 && (
                                rating === 1 ? 'Poor' :
                                rating === 2 ? 'Fair' :
                                rating === 3 ? 'Good' :
                                rating === 4 ? 'Very Good' :
                                'Excellent'
                            )}
                        </span>
                    </div>
                </div>

                {/* Review Comment */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: theme.colors.text
                    }}>
                        Your Review *
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product. What did you like or dislike? How does it compare to your expectations?"
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                        disabled={isSubmitting}
                    />
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#6c757d',
                        marginTop: '0.25rem'
                    }}>
                        Minimum 10 characters. {comment.length}/500
                    </div>
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: theme.colors.text
                    }}>
                        Add Photos (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isSubmitting || images.length >= 5}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                        }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
                        Upload up to 5 images (JPG, PNG)
                    </div>
                    {images.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                            {images.map((img, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img src={img} alt={`Review ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
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
                                            cursor: 'pointer',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Upload */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                        color: theme.colors.text
                    }}>
                        Add Videos (Optional)
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        disabled={isSubmitting || videos.length >= 2}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                        }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
                        Upload up to 2 videos (MP4, MOV)
                    </div>
                    {videos.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                            {videos.map((video, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <video src={video} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} controls />
                                    <button
                                        onClick={() => removeVideo(index)}
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
                                            cursor: 'pointer',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Verified Purchase Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#e8f5e8',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1.5rem',
                    border: '1px solid #c3e6cb'
                }}>
                    <FaShieldAlt color="#28a745" />
                    <span style={{ fontSize: '0.9rem', color: '#155724' }}>
                        <strong>Verified Purchase</strong> - This review is from a verified customer who purchased this item.
                    </span>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #ccc',
                            background: 'white',
                            color: '#6c757d',
                            borderRadius: '4px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: rating === 0 || comment.trim().length < 10 ? '#ccc' : theme.colors.primary,
                            color: 'white',
                            borderRadius: '4px',
                            cursor: rating === 0 || comment.trim().length < 10 || isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #ffffff3d',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FaCheck />
                                Submit Review
                            </>
                        )}
                    </button>
                </div>

                {/* CSS for spinner animation */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ReviewModal; 