import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { NotificationContext } from '../context/NotificationContext';
import { theme } from '../theme/theme';
import { generateInvoicePdf } from '../services/pdfService';

const AdminOrderList = () => {
    const { orders, updateOrderStatus } = useContext(CartContext);
    const { t } = useContext(LanguageContext);
    const { addNotification } = useContext(NotificationContext);

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        const message = t('orderStatusUpdate_notif', { orderId, status: t(newStatus.toLowerCase()) });
        addNotification(message);
    };

    const handleDownloadInvoice = (order) => {
        const placeholderUser = { name: 'N/A', address: 'N/A', phone: 'N/A' };
        generateInvoicePdf(order, placeholderUser, t);
    };

    const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' };
    const thStyle = { borderBottom: `2px solid ${theme.colors.primary}`, padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' };
    const tdStyle = { borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' };
    const selectStyle = { padding: '8px', marginRight: '10px', borderRadius: '4px' };
    const downloadButtonStyle = { 
        padding: '8px 12px', 
        cursor: 'pointer', 
        backgroundColor: theme.colors.secondary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px'
    };

    return (
        <div>
            <h2>{t('manageOrders')}</h2>
            {orders.length === 0 ? (
                <p>{t('noOrdersYet')}</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr style={thStyle}>
                            <th style={thStyle}>{t('orderId')}</th>
                            <th style={thStyle}>{t('date')}</th>
                            <th style={thStyle}>{t('total')}</th>
                            <th style={thStyle}>{t('status')}</th>
                            <th style={thStyle}>{t('items')}</th>
                            <th style={thStyle}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={tdStyle}>
                                <td style={tdStyle}>{order.id}</td>
                                <td style={tdStyle}>{new Date(order.date).toLocaleDateString()}</td>
                                <td style={tdStyle}>₹{order.total.toLocaleString()}</td>
                                <td style={tdStyle}>{t(order.status.toLowerCase())}</td>
                                <td style={tdStyle}>{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                                <td style={tdStyle}>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        style={selectStyle}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{t(status.toLowerCase())}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleDownloadInvoice(order)} 
                                        style={downloadButtonStyle}
                                    >
                                        {t('downloadInvoice')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminOrderList;
