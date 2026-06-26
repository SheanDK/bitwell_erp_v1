/* Path: frontend/src/pages/InventoryPage.jsx */
import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { DataTable } from '../components/DataTable';
import { QrGenerator } from '../components/QrGenerator';
import { Plus, Trash2, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';

const InventoryPage = () => {
    const { darkMode, lang } = useOutletContext();
    const { t } = useTranslation(lang);

    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        sku: '',
        quantity: 0,
        price: 0,
        cost_price: 0,
        barcode: '',
        weight: 0
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchInventory = () => {
        apiClient.get('/inventory/list')
            .then(res => setItems(res.data))
            .catch(err => console.error("Error fetching inventory:", err));
    };

    const handleAddItem = (e) => {
        e.preventDefault();

        // 2. Real-time Save & Dynamic Popup Closing
        apiClient.post('/inventory/add', newItem)
            .then(() => {
                setIsModalOpen(false);
                fetchInventory();
                showNotification('success', t('inventory.success') || 'Product added successfully.');

                setNewItem({
                    name: '',
                    sku: '',
                    quantity: 0,
                    price: 0,
                    cost_price: 0,
                    barcode: '',
                    weight: 0
                });
            })
            .catch(err => {
                console.error("Error adding product:", err);
                showNotification('error', 'Failed to add product. Check authorization or DB schema.');
            });
    };

    // Status Badges logic with Translation
    const getStockStatus = (qty) => {
        if (qty === 0) return <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">{t('inventory.outOfStockBadge')}</span>;
        if (qty < 20) return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold">{t('inventory.lowStockBadge')}</span>;
        return <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">{t('inventory.inStockBadge')}</span>;
    };

    // Columns Definition
    const columns = useMemo(() => [
        {
            header: t('inventory.product'),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {/* Placeholder image issue fixed: SVG Avatar */}
                    {row.original.image_url ? (
                        <img
                            src={row.original.image_url}
                            alt={row.original.name}
                            className="w-10 h-10 object-cover rounded-xl shadow-sm border border-gray-100 dark:border-slate-800"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm">
                            {row.original.name ? row.original.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-slate-200">{row.original.name}</p>
                        <p className="text-xs text-gray-400">SKU: {row.original.sku}</p>
                    </div>
                </div>
            )
        },
        { header: t('inventory.acquisitionPrice'), cell: ({ row }) => `USD ${row.original.price || '0.00'}` },
        { header: t('inventory.inStock'), accessorKey: 'quantity' },
        {
            header: t('inventory.status'),
            cell: ({ row }) => getStockStatus(row.original.quantity)
        },
        {
            header: t('superAdmin.actions'),
            cell: () => (
                <div className="flex gap-2 justify-end">
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg transition" title="Scan Rack Location">
                        <MapPin size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], [lang]);

    const renderRowDetails = (item) => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-600 dark:text-slate-400 items-center">
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">{t('inventory.locationInfo')}</h4>
                <p>{t('inventory.warehouse')}</p>
                <p>{t('inventory.rackSection')}: {item.rack_code || t('inventory.notAssigned')}</p>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">{t('inventory.financialValuation')}</h4>
                <p>{t('inventory.assetValue')}: USD {item.price * item.quantity || 0}</p>
                <p>{t('inventory.costPrice')}: USD {item.price || 0}</p>
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">{t('inventory.quickActions')}</h4>
                <button className="text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border dark:border-slate-700 transition">
                    {t('inventory.changeLocation')}
                </button>
            </div>
            <div className="flex justify-end md:col-span-1">
                <QrGenerator value={item.sku} title={item.name} />
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 relative">

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md transition-all ${notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title Section */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">{t('inventory.title')}</h1>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">{t('inventory.subtitle')}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2">
                    <Plus size={18} /> {t('inventory.createOne')}
                </button>
            </div>

            {/* Table */}
            <DataTable data={items} columns={columns} renderRowDetails={renderRowDetails} />

            {/* Quick Adding Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50 p-4">
                    <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl w-full max-w-2xl space-y-6 shadow-xl transition-all">

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('inventory.addTitle')}</h3>
                            <p className="text-xs text-gray-400">Register product specifications, global identity codes, and cost structures.</p>
                        </div>

                        {/* Grid Layout (Two Columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Product Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{t('inventory.prodName')}</label>
                                <input
                                    required type="text"
                                    value={newItem.name}
                                    placeholder="e.g. M3 Nut Steel"
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* SKU */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{t('inventory.sku')}</label>
                                <input
                                    required type="text"
                                    value={newItem.sku}
                                    placeholder="e.g. SKU-1001"
                                    onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Universal Barcode */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Universal Barcode (EAN/UPC)</label>
                                <input
                                    type="text"
                                    value={newItem.barcode}
                                    placeholder="e.g. 794120341"
                                    onChange={e => setNewItem({ ...newItem, barcode: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Product Weight */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Product Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newItem.weight || ''}
                                    placeholder="e.g. 0.45"
                                    onChange={e => setNewItem({ ...newItem, weight: Number(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Acquisition Cost */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Acquisition Cost (Cost Price)</label>
                                <input
                                    required type="number"
                                    step="0.01"
                                    value={newItem.cost_price || ''}
                                    placeholder="USD 0.00"
                                    onChange={e => setNewItem({ ...newItem, cost_price: Number(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Sales Price */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Sales Price (MSRP)</label>
                                <input
                                    required type="number"
                                    step="0.01"
                                    value={newItem.price || ''}
                                    placeholder="USD 0.00"
                                    onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        {/* Inventory Stock Quantity */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{t('inventory.quantity')}</label>
                            <input
                                required type="number"
                                value={newItem.quantity || ''}
                                placeholder="Initial On-Hand Stock Qty"
                                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 border border-gray-200 dark:border-slate-800 rounded-xl text-xs dark:text-white font-semibold"
                            >
                                {t('inventory.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
                            >
                                {t('inventory.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;