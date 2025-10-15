import React, { useState, useEffect } from 'react';
import { FaTrash, FaDownload, FaExclamationTriangle, FaTimes, FaCheck, FaUndo } from 'react-icons/fa';
import { useAuthSystem } from '../context/UnifiedAuthContext';

const AccountDeletionModal = ({ isOpen, onClose, onLogout }) => {
    const { user, deleteAccount } = useAuthSystem();
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deletionStatus, setDeletionStatus] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            // Check localStorage for deletion status
            const deletionKey = `ssbc-deletion-${user.email}`;
            const storedStatus = localStorage.getItem(deletionKey);
            
            if (storedStatus) {
                setDeletionStatus(JSON.parse(storedStatus));
            } else {
                // Set default status
                setDeletionStatus({
                    is_deletion_requested: false,
                    deletion_requested_at: null,
                    can_cancel_deletion: true,
                    can_recover: false,
                    is_deactivated: false
                });
            }
        }
    }, [isOpen, user]);



    const handleExportData = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Export user data from localStorage
            const userData = {
                profile: user,
                orders: JSON.parse(localStorage.getItem(`sundarisaj-orders-${user.email}`) || '[]'),
                cart: JSON.parse(localStorage.getItem(`sundarisaj-cart-${user.email}`) || '[]'),
                notifications: JSON.parse(localStorage.getItem(`ssbc-notifications-${user.email}`) || '[]'),
                exportDate: new Date().toISOString()
            };
            
            setSuccess('Your data has been exported successfully!');
            
            // Download the data as JSON file
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            setError('Failed to export data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestDeletion = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Store deletion request in localStorage
            const deletionKey = `ssbc-deletion-${user.email}`;
            const deletionData = {
                is_deletion_requested: true,
                deletion_requested_at: new Date().toISOString(),
                reason: reason,
                can_cancel_deletion: true,
                can_recover: false,
                is_deactivated: false
            };
            
            localStorage.setItem(deletionKey, JSON.stringify(deletionData));
            
            setSuccess('Account deletion requested. Your account will be permanently deleted in 7 days.');
            setStep(3);
            setDeletionStatus(deletionData);
        } catch (error) {
            setError('Failed to request deletion: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelDeletion = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Remove deletion request from localStorage
            const deletionKey = `ssbc-deletion-${user.email}`;
            localStorage.removeItem(deletionKey);
            
            setSuccess('Account deletion cancelled successfully!');
            setStep(1);
            setDeletionStatus({
                is_deletion_requested: false,
                deletion_requested_at: null,
                can_cancel_deletion: true,
                can_recover: false,
                is_deactivated: false
            });
        } catch (error) {
            setError('Failed to cancel deletion: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Permanently delete account using unified auth
            await deleteAccount();
            
            setSuccess('Account permanently deleted. You will be logged out.');
            setTimeout(() => {
                onLogout();
            }, 2000);
        } catch (error) {
            setError('Failed to delete account: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSoftDelete = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Store deactivation status in localStorage
            const deletionKey = `ssbc-deletion-${user.email}`;
            const deletionData = {
                is_deletion_requested: false,
                deletion_requested_at: null,
                reason: '',
                can_cancel_deletion: false,
                can_recover: true,
                is_deactivated: true,
                deactivated_at: new Date().toISOString()
            };
            
            localStorage.setItem(deletionKey, JSON.stringify(deletionData));
            
            setSuccess('Account deactivated. You can recover it within 30 days.');
            setStep(4);
            setDeletionStatus(deletionData);
        } catch (error) {
            setError('Failed to deactivate account: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoverAccount = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Remove deactivation status from localStorage
            const deletionKey = `ssbc-deletion-${user.email}`;
            localStorage.removeItem(deletionKey);
            
            setSuccess('Account recovered successfully!');
            setStep(1);
            setDeletionStatus({
                is_deletion_requested: false,
                deletion_requested_at: null,
                can_cancel_deletion: true,
                can_recover: false,
                is_deactivated: false
            });
        } catch (error) {
            setError('Failed to recover account: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {step === 1 && 'Account Settings'}
                        {step === 2 && 'Delete Account'}
                        {step === 3 && 'Deletion Requested'}
                        {step === 4 && 'Account Deactivated'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                {/* Step 1: Main Options */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Export Your Data</h3>
                            <p className="text-sm text-blue-600 mb-3">
                                Download all your data before deleting your account (GDPR compliant).
                            </p>
                            <button
                                onClick={handleExportData}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                <FaDownload />
                                Export My Data
                            </button>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 mb-2">Deactivate Account</h3>
                            <p className="text-sm text-yellow-600 mb-3">
                                Temporarily deactivate your account. You can recover it within 30 days.
                            </p>
                            <button
                                onClick={handleSoftDelete}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                            >
                                <FaUndo />
                                Deactivate Account
                            </button>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg">
                            <h3 className="font-semibold text-red-800 mb-2">Permanently Delete Account</h3>
                            <p className="text-sm text-red-600 mb-3">
                                This action cannot be undone. All your data will be permanently deleted.
                            </p>
                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                <FaTrash />
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Confirmation */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 mb-2">
                                <FaExclamationTriangle />
                                <span className="font-semibold">Warning</span>
                            </div>
                            <p className="text-sm text-red-700 mb-4">
                                This action will permanently delete your account and all associated data. 
                                This cannot be undone.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion (optional):
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                rows="3"
                                placeholder="Please tell us why you're leaving..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestDeletion}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Request Deletion'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Deletion Requested */}
                {step === 3 && deletionStatus && (
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                <FaExclamationTriangle />
                                <span className="font-semibold">Deletion Requested</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                                Your account deletion has been requested. Your account will be permanently deleted in 7 days.
                            </p>
                        </div>

                        {deletionStatus.can_cancel_deletion && (
                            <button
                                onClick={handleCancelDeletion}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                <FaCheck />
                                Cancel Deletion Request
                            </button>
                        )}
                    </div>
                )}

                {/* Step 4: Account Deactivated */}
                {step === 4 && deletionStatus && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800 mb-2">
                                <FaUndo />
                                <span className="font-semibold">Account Deactivated</span>
                            </div>
                            <p className="text-sm text-blue-700">
                                Your account has been deactivated. You can recover it within 30 days.
                            </p>
                        </div>

                        {deletionStatus.can_recover && (
                            <button
                                onClick={handleRecoverAccount}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                <FaCheck />
                                Recover Account
                            </button>
                        )}

                        <button
                            onClick={handlePermanentDelete}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            <FaTrash />
                            Permanently Delete Now
                        </button>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDeletionModal; 