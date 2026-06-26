//frontend/src/components/TenantDashboard.jsx


import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, TrendingUp, AlertTriangle, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

const TenantDashboard = () => {
    const { t } = useTranslation();
    const data = [
        { name: 'Mon', stock: 40 }, { name: 'Tue', stock: 30 },
        { name: 'Wed', stock: 65 }, { name: 'Thu', stock: 45 },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Quick Action Bar */}
            <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition">
                    <QrCode size={18} /> {t('dashboard.quickActions')}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: t('dashboard.totalInventory'), val: '1,240', icon: <Package />, color: 'text-blue-500' },
                    { title: t('dashboard.monthlySales'), val: 'USD 450k', icon: <TrendingUp />, color: 'text-green-500' },
                    { title: t('dashboard.lowStockAlerts'), val: '12 Items', icon: <AlertTriangle />, color: 'text-red-500' },
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                        <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                        <p className="text-2xl font-bold">{stat.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-6">Stock Movement Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} />
                            <YAxis axisLine={false} />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} />
                            <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
export default TenantDashboard;