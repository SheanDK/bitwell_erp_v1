/* Path: frontend/src/pages/SuperAdminDashboard.jsx */
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useTranslation } from '../hooks/useTranslation';
import { Users, Shield, Plus, Database, ToggleLeft, ToggleRight, Download, Search, ChevronLeft, ChevronRight, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const SuperAdminDashboard = () => {
    const { darkMode } = useOutletContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Notification State
    const [notification, setNotification] = useState(null);

    // Edit Modal States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState({ id: '', name: '', slug: '', phone: '', planId: 1 });

    // Custom Delete Confirmation States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, tenantId: null, tenantName: '' });

    // Live Server Stats State
    const [stats, setStats] = useState({
        totalTenants: 0,
        totalUsers: 0,
        revenue: 'EUR 0.00',
        status: 'Connecting...'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        fetchTenants();
        fetchServerStats();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const safeParseFeatures = (features) => {
        if (!features) return { qr_tracing: false, accounting: false };
        if (typeof features === 'object') return features;
        try {
            const parsed = JSON.parse(features);
            return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        } catch (e) {
            return { qr_tracing: false, accounting: false };
        }
    };

    const fetchTenants = () => {
        apiClient.get('/tenants/list')
            .then(res => {
                const parsedData = res.data.map(tenant => ({
                    ...tenant,
                    features: safeParseFeatures(tenant.features)
                }));
                setTenants(parsedData);
            })
            .catch(err => console.error("Error fetching tenants:", err));
    };

    const fetchServerStats = () => {
        apiClient.get('/tenants/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    };

    const handleDeleteClick = (tenantId, name) => {
        setDeleteModal({ isOpen: true, tenantId, tenantName: name });
    };

    const handleConfirmDelete = () => {
        const { tenantId, tenantName } = deleteModal;
        apiClient.post('/tenants/delete', { id: tenantId })
            .then(() => {
                setTenants(prev => prev.filter(t => t.id !== tenantId));
                showNotification('success', t('superAdmin.toastDeleteSuccess').replace('{{name}}', tenantName));
                fetchServerStats();
            })
            .catch(() => showNotification('error', t('superAdmin.toastDeleteError')))
            .finally(() => setDeleteModal({ isOpen: false, tenantId: null, tenantName: '' }));
    };

    const handleUpdateTenant = (e) => {
        e.preventDefault();
        apiClient.post('/tenants/update-info', editingTenant)
            .then(() => {
                setIsEditOpen(false);
                fetchTenants();
                showNotification('success', t('superAdmin.toastUpdateSuccess'));
            })
            .catch(() => showNotification('error', t('superAdmin.toastUpdateError')));
    };

    const handlePackageTransfer = (tenantId, newPlanId) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        apiClient.post('/tenants/update-info', {
            id: tenantId,
            name: tenant.name,
            slug: tenant.slug,
            phone: tenant.phone || '',
            planId: Number(newPlanId)
        })
            .then(() => {
                setTenants(prev => prev.map(t => {
                    if (t.id === tenantId) {
                        return { ...t, plan_id: Number(newPlanId) };
                    }
                    return t;
                }));
                const planNames = {
                    1: t('plans.basic'),
                    2: t('plans.pro'),
                    3: t('plans.enterprise')
                };
                showNotification('success', t('superAdmin.toastStatusUpdate').replace('{{name}}', tenant.name).replace('{{status}}', planNames[newPlanId]));
            })
            .catch(() => showNotification('error', 'Failed to update subscription package.'));
    };

    const toggleFeature = (tenantId, featureKey) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const updatedFeatures = { ...tenant.features, [featureKey]: !tenant.features[featureKey] };

        apiClient.post('/tenants/update-features', { id: tenantId, features: updatedFeatures })
            .then(() => {
                setTenants(prev => prev.map(t => {
                    if (t.id === tenantId) {
                        return { ...t, features: updatedFeatures };
                    }
                    return t;
                }));
                showNotification('success', t('superAdmin.toastFeatureUpdate').replace('{{name}}', tenant.name));
            })
            .catch(() => showNotification('error', 'Failed to update features.'));
    };

    const handleToggleStatus = (tenantId, currentStatus) => {
        const isActiveStatus = currentStatus === true || currentStatus === 1 || currentStatus === 'true';
        const newStatus = !isActiveStatus;
        const tenant = tenants.find(t => t.id === tenantId);

        apiClient.post('/tenants/toggle-status', { id: tenantId, isActive: newStatus })
            .then(() => {
                setTenants(prev => prev.map(t => {
                    if (t.id === tenantId) {
                        return { ...t, is_active: newStatus };
                    }
                    return t;
                }));
                const statusLabel = newStatus ? t('superAdmin.activate') : t('superAdmin.suspend');
                showNotification('success', t('superAdmin.toastStatusUpdate').replace('{{name}}', tenant.name).replace('{{status}}', statusLabel));
            })
            .catch(() => showNotification('error', 'Failed to change status.'));
    };

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTenants = filteredTenants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

    return (
        <div className="p-6 space-y-6 relative">

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, tenantId: null, tenantName: '' })}
                onConfirm={handleConfirmDelete}
                title={t('superAdmin.confirmTitle')}
                message={t('superAdmin.confirmMessage').replace('{{name}}', deleteModal.tenantName)}
                confirmText={t('superAdmin.confirmButton')}
                cancelText={t('superAdmin.cancelButton')}
            />

            {/* Custom Toast Notification Banner (Centered at the Top with Correct Color Policy) */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md transition-all duration-200 ${notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 size={16} className="shrink-0" />
                        ) : (
                            <AlertTriangle size={16} className="shrink-0" />
                        )}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">{t('superAdmin.title')}</h1>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">{t('superAdmin.subtitle')}</p>
                </div>
                <button onClick={() => navigate('/deploy')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5">
                    <Plus size={14} /> {t('superAdmin.deployTenant')}
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: t('superAdmin.totalTenants'),
                        val: stats.totalTenants,
                        icon: <Users className="text-indigo-600 dark:text-indigo-400" />,
                        desc: t('superAdmin.totalTenantsDesc') // Dynamic Translation
                    },
                    {
                        title: t('superAdmin.globalRevenue'),
                        val: stats.revenue,
                        icon: <Shield className="text-emerald-600 dark:text-emerald-400" />,
                        desc: t('superAdmin.globalRevenueDesc')
                    },
                    {
                        title: t('superAdmin.coreServer'),
                        val: stats.status,
                        icon: <Database className="text-cyan-600 dark:text-cyan-400" />,
                        desc: t('superAdmin.coreServerDesc')
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm transition-colors duration-300">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</span>
                            <div className="p-2 bg-gray-50 dark:bg-slate-800/60 rounded-lg">{stat.icon}</div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stat.val}</h3>
                        <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Main Table Grid */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[400px] transition-colors duration-300">
                <div>
                    {/* Filters Panel */}
                    <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-slate-900/30">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder={t('superAdmin.filterPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-slate-200 transition"
                            />
                        </div>
                        <button className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 text-gray-600 dark:text-slate-300 transition">
                            <Download size={12} /> {t('superAdmin.exportLog')}
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-slate-800/80 text-gray-400 dark:text-slate-500 uppercase bg-gray-50 dark:bg-slate-900/10 font-bold">
                                    <th className="p-4">{t('superAdmin.workspaceInfo')}</th>
                                    <th className="p-4">{t('superAdmin.contactNumber')}</th>
                                    <th className="p-4">{t('superAdmin.subscriptionPackage')}</th>
                                    <th className="p-4">{t('superAdmin.qrTracingFlag')}</th>
                                    <th className="p-4">{t('superAdmin.accountingFlag')}</th>
                                    <th className="p-4 text-right">{t('superAdmin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                {currentTenants.map(tenant => (
                                    <tr key={tenant.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-950/40 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800 dark:text-slate-200">{tenant.name}</p>
                                            <p className="text-gray-400 dark:text-slate-500">{tenant.slug}.bitwellerp.com</p>
                                        </td>

                                        <td className="p-4 font-semibold text-gray-500 dark:text-slate-400">
                                            {tenant.phone || <span className="text-[10px] text-gray-400 italic">{t('superAdmin.noContactInfo')}</span>}
                                        </td>

                                        {/* Translated Segmented Pill Badges */}
                                        <td className="p-4">
                                            <div className="flex bg-gray-100 dark:bg-slate-950 p-1 rounded-xl w-max border border-gray-200/50 dark:border-slate-800/50">
                                                {[
                                                    { id: 1, label: t('plans.basic') },
                                                    { id: 2, label: t('plans.pro') },
                                                    { id: 3, label: t('plans.enterprise') }
                                                ].map((tier) => (
                                                    <button
                                                        key={tier.id}
                                                        onClick={() => handlePackageTransfer(tenant.id, tier.id)}
                                                        className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all duration-150 ${(tenant.plan_id || 1) === tier.id
                                                            ? 'bg-indigo-600 text-white shadow-md'
                                                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {tier.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>

                                        {/* QR Tracing Flag */}
                                        <td className="p-4">
                                            <button onClick={() => toggleFeature(tenant.id, 'qr_tracing')} className="transition">
                                                {tenant.features?.qr_tracing === true ? <ToggleRight className="text-emerald-500" size={26} /> : <ToggleLeft className="text-gray-400 dark:text-slate-600" size={26} />}
                                            </button>
                                        </td>

                                        {/* Accounting Flag */}
                                        <td className="p-4">
                                            <button onClick={() => toggleFeature(tenant.id, 'accounting')} className="transition">
                                                {tenant.features?.accounting === true ? <ToggleRight className="text-emerald-500" size={26} /> : <ToggleLeft className="text-gray-400 dark:text-slate-600" size={26} />}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right flex justify-end items-center gap-3">
                                            <button
                                                onClick={() => { setEditingTenant({ id: tenant.id, name: tenant.name, slug: tenant.slug, phone: tenant.phone || '', planId: tenant.plan_id || 1 }); setIsEditOpen(true); }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 rounded-lg transition"
                                                title="Edit Workspace"
                                            >
                                                <Edit2 size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(tenant.id, tenant.name)}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-lg transition"
                                                title="Delete Workspace"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(tenant.id, tenant.is_active)}
                                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition duration-150 ${(tenant.is_active === true || tenant.is_active === 1 || tenant.is_active === 'true')
                                                    ? "bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/40 px-3 py-1.5 rounded-xl transition font-semibold"
                                                    : 'bg-green-50 dark:bg-green-950/20 text-green-500 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-900/40 px-3 py-1.5 rounded-xl transition font-semibold'
                                                    }`}
                                            >
                                                {(tenant.is_active === true || tenant.is_active === 1 || tenant.is_active === 'true') ? t('superAdmin.suspend') : t('superAdmin.activate')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Custom & Sticky Pagination Panel at the Bottom */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-slate-900/20">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 dark:text-slate-500 text-xs">{t('superAdmin.rowsPerPage')}</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-lg p-1 outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-slate-500 text-xs mr-2">{t('superAdmin.pageOf')} {currentPage} of {totalPages || 1}</span>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1 border border-gray-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-1 border border-gray-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Tenant Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-50 p-4">
                    <form onSubmit={handleUpdateTenant} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-4 shadow-xl transition-all">
                        <h3 className="text-lg font-black text-gray-800 dark:text-white">{t('superAdmin.editTitle')}</h3>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('superAdmin.entityName')}</label>
                            <input required type="text" value={editingTenant.name} onChange={e => setEditingTenant({ ...editingTenant, name: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-white" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('superAdmin.subdomainSlug')}</label>
                            <input required type="text" value={editingTenant.slug} onChange={e => setEditingTenant({ ...editingTenant, slug: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-white" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('superAdmin.contactNumber')}</label>
                            <input type="text" value={editingTenant.phone} onChange={e => setEditingTenant({ ...editingTenant, phone: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-white" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('superAdmin.subscriptionPackage')}</label>
                            <div className="flex bg-gray-100 dark:bg-slate-950 p-1.5 rounded-2xl w-full border border-gray-200 dark:border-slate-800">
                                {[
                                    { id: 1, label: t('plans.basic') },
                                    { id: 2, label: t('plans.pro') },
                                    { id: 3, label: t('plans.enterprise') }
                                ].map((tier) => (
                                    <button
                                        key={tier.id}
                                        type="button"
                                        onClick={() => setEditingTenant({ ...editingTenant, planId: tier.id })}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all duration-150 ${editingTenant.planId === tier.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {tier.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">{t('superAdmin.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">{t('superAdmin.saveChanges')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;