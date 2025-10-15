import React, { useState, useEffect } from 'react';
import { FaTrash, FaUndo, FaDownload, FaChartBar, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { authService, adminService } from '../services/supabaseService';

const AdminAccountDeletionManager = () => {
    const [deletionStats, setDeletionStats] = useState(null);
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadDeletionStats();
        loadDeletedUsers();
    }, []);

    const loadDeletionStats = async () => {
        try {
            const { data, error } = await adminService.getDeletionStatistics();
            if (error) throw error;
            setDeletionStats(data);
        } catch (error) {
            console.error('Error loading deletion stats:', error);
        }
    };

    const loadDeletedUsers = async () => {
        try {
            const { data, error } = await adminService.getAllUsers();
            if (error) throw error;
            
            // Filter for deleted users and deletion requests
            const filteredUsers = data.filter(user => 
                user.deleted_at || user.deletion_requested_at
            );
            
            // Sort by deleted_at descending
            filteredUsers.sort((a, b) => {
                const dateA = a.deleted_at || a.deletion_requested_at;
                const dateB = b.deleted_at || b.deletion_requested_at;
                return new Date(dateB) - new Date(dateA);
            });
            
            setDeletedUsers(filteredUsers);
        } catch (error) {
            console.error('Error loading deleted users:', error);
        }
    };

    const handleCleanupOldAccounts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data, error } = await adminService.cleanupOldDeletedAccounts();
            if (error) throw error;
            
            setSuccess(`Cleanup completed: ${data.accounts_deleted} accounts permanently deleted`);
            loadDeletionStats();
            loadDeletedUsers();
        } catch (error) {
            setError('Failed to cleanup old accounts: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoverUser = async (userId) => {
        setIsLoading(true);
        setError('');
        try {
            const { data, error } = await authService.recoverAccount(userId);
            if (error) throw error;
            
            setSuccess('User account recovered successfully!');
            loadDeletedUsers();
        } catch (error) {
            setError('Failed to recover user: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermanentlyDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const { data, error } = await authService.permanentlyDeleteAccount(userId);
            if (error) throw error;
            
            setSuccess('User account permanently deleted!');
            loadDeletedUsers();
            loadDeletionStats();
        } catch (error) {
            setError('Failed to delete user: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportUserData = async (userId, userEmail) => {
        setIsLoading(true);
        setError('');
        try {
            const { data, error } = await authService.exportUserData(userId);
            if (error) throw error;
            
            // Download the data as JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin-user-data-${userEmail}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setSuccess('User data exported successfully!');
        } catch (error) {
            setError('Failed to export user data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Account Deletion Management</h2>
                <button
                    onClick={handleCleanupOldAccounts}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    <FaTrash />
                    Cleanup Old Accounts
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* Statistics */}
            {deletionStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2">
                            <FaChartBar className="text-blue-600" />
                            <span className="text-sm text-gray-600">Total Users</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{deletionStats.total_users}</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2">
                            <FaCheck className="text-green-600" />
                            <span className="text-sm text-gray-600">Active Users</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{deletionStats.active_users}</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2">
                            <FaTrash className="text-red-600" />
                            <span className="text-sm text-gray-600">Deleted Users</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{deletionStats.deleted_users}</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-yellow-600" />
                            <span className="text-sm text-gray-600">Deletion Requests</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{deletionStats.deletion_requests}</div>
                    </div>
                </div>
            )}

            {/* Deleted Users List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Deleted Users & Deletion Requests</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {deletedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.deleted_at ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Deleted
                                            </span>
                                        ) : user.deletion_requested_at ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Deletion Requested
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Unknown
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.deleted_at ? 
                                            new Date(user.deleted_at).toLocaleDateString() :
                                            user.deletion_requested_at ?
                                            new Date(user.deletion_requested_at).toLocaleDateString() :
                                            'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.deletion_reason || 'No reason provided'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleExportUserData(user.id, user.email)}
                                                disabled={isLoading}
                                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                title="Export User Data"
                                            >
                                                <FaDownload />
                                            </button>
                                            
                                            {user.deleted_at && (
                                                <button
                                                    onClick={() => handleRecoverUser(user.id)}
                                                    disabled={isLoading}
                                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                    title="Recover User"
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => handlePermanentlyDeleteUser(user.id)}
                                                disabled={isLoading}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                title="Permanently Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {deletedUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No deleted users or deletion requests found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAccountDeletionManager; 