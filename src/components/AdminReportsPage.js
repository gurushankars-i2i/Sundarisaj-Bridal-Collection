import React, { useContext, useMemo, useState } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { theme } from '../theme/theme';
import { subDays, format, eachDayOfInterval, startOfToday, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

const AdminReportsPage = () => {
    const { products } = useContext(ProductContext);
    const { orders } = useContext(CartContext);
    const { t } = useContext(LanguageContext);
    const [startDate, setStartDate] = useState(subDays(new Date(), 29));
    const [endDate, setEndDate] = useState(new Date());

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }, [orders, startDate, endDate]);

    const handleDatePreset = (period) => {
        const now = new Date();
        switch (period) {
            case 'daily': setStartDate(subDays(now, 1)); setEndDate(now); break;
            case 'weekly': setStartDate(subDays(now, 7)); setEndDate(now); break;
            case 'monthly': setStartDate(startOfMonth(now)); setEndDate(now); break;
            case 'quarterly': setStartDate(startOfQuarter(now)); setEndDate(now); break;
            case 'yearly': setStartDate(startOfYear(now)); setEndDate(now); break;
            default: break;
        }
    };
    
    const COLORS = [theme.colors.primary, theme.colors.secondary, '#FFBB28', '#FF8042', '#00C49F'];

    const categoryRevenue = useMemo(() => {
        const revenue = filteredOrders.reduce((acc, order) => {
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const categoryName = t(product.category.toLowerCase()) || product.category;
                    acc[categoryName] = (acc[categoryName] || 0) + (item.price * item.quantity);
                }
            });
            return acc;
        }, {});

        return Object.keys(revenue).map(key => ({ name: key, revenue: revenue[key] }));
    }, [filteredOrders, products, t]);
    
    const orderStatusData = useMemo(() => {
        const statusCounts = filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(statusCounts).map(key => ({
            name: t(key.toLowerCase()) || key,
            value: statusCounts[key]
        }));
    }, [filteredOrders, t]);

    // Refund Statistics
    const refundStatistics = useMemo(() => {
        const refundedOrders = filteredOrders.filter(order => 
            order.status === 'refunded' || order.refund?.status === 'refunded'
        );
        
        const totalRefunds = refundedOrders.length;
        const totalRefundAmount = refundedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const refundRate = filteredOrders.length > 0 ? (totalRefunds / filteredOrders.length * 100).toFixed(2) : 0;
        
        return {
            totalRefunds,
            totalRefundAmount,
            refundRate,
            refundedOrders
        };
    }, [filteredOrders]);

    const salesOverTime = useMemo(() => {
        const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
        const salesByDay = filteredOrders.reduce((acc, order) => {
            const orderDate = format(new Date(order.date), 'yyyy-MM-dd');
            acc[orderDate] = (acc[orderDate] || 0) + order.total;
            return acc;
        }, {});

        return intervalDays.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            return {
                date: format(day, 'MMM d'),
                sales: salesByDay[formattedDate] || 0
            };
        });
    }, [filteredOrders, startDate, endDate]);

    const containerStyle = { padding: '2rem' };
    const filterContainerStyle = { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' };
    const chartContainerStyle = { padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'};

    return (
        <div style={containerStyle}>
            <h2 style={{marginBottom: '1rem'}}>{t('dashboard')}</h2>
            
            <div style={filterContainerStyle}>
                <button onClick={() => handleDatePreset('daily')}>{t('daily')}</button>
                <button onClick={() => handleDatePreset('weekly')}>{t('weekly')}</button>
                <button onClick={() => handleDatePreset('monthly')}>{t('monthly')}</button>
                <button onClick={() => handleDatePreset('quarterly')}>{t('quarterly')}</button>
                <button onClick={() => handleDatePreset('yearly')}>{t('yearly')}</button>
            </div>
            
            <div style={gridStyle}>
                <div style={chartContainerStyle}>
                    <h3>{t('revenueByCategory')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryRevenue}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="revenue" fill={theme.colors.primary} /></BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={chartContainerStyle}>
                    <h3>{t('ordersByStatus')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{...chartContainerStyle, gridColumn: '1 / -1'}}>
                    <h3>{t('salesOverTime')} ({format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesOverTime}><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="sales" stroke={theme.colors.secondary} strokeWidth={2} /></LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Refund Statistics Section */}
                <div style={{...chartContainerStyle, gridColumn: '1 / -1', backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107'}}>
                    <h3 style={{color: '#856404', marginBottom: '1.5rem'}}>💰 Refund Analytics</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
                        <div style={{padding: '1rem', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center'}}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc3545'}}>{refundStatistics.totalRefunds}</div>
                            <div style={{color: '#6c757d'}}>Total Refunds</div>
                        </div>
                        <div style={{padding: '1rem', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center'}}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc3545'}}>
                                ₹{refundStatistics.totalRefundAmount.toLocaleString()}
                            </div>
                            <div style={{color: '#6c757d'}}>Refund Amount</div>
                        </div>
                        <div style={{padding: '1rem', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center'}}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc3545'}}>{refundStatistics.refundRate}%</div>
                            <div style={{color: '#6c757d'}}>Refund Rate</div>
                        </div>
                    </div>

                    {/* Refunded Orders List */}
                    {refundStatistics.refundedOrders.length > 0 && (
                        <div>
                            <h4 style={{color: '#856404', marginBottom: '1rem'}}>Refunded Orders</h4>
                            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                {refundStatistics.refundedOrders.map(order => (
                                    <div key={order.id} style={{
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid #ffc107'
                                    }}>
                                        <div>
                                            <strong>Order #{order.id}</strong>
                                            <div style={{fontSize: '0.9rem', color: '#6c757d'}}>
                                                {order.userName} - {format(new Date(order.date), 'MMM d, yyyy')}
                                            </div>
                                            {order.refund?.reason && (
                                                <div style={{fontSize: '0.85rem', color: '#856404', marginTop: '0.25rem'}}>
                                                    Reason: {order.refund.reason}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545'}}>
                                                ₹{order.total.toLocaleString()}
                                            </div>
                                            <div style={{fontSize: '0.85rem', color: '#6c757d'}}>
                                                {order.refund?.method || 'Original Payment Method'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage; 