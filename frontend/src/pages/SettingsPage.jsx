/* Path: frontend/src/pages/SettingsPage.jsx */
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const SettingsPage = () => {
    const { darkMode, lang } = useOutletContext();
    const { t } = useTranslation(lang);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');

    // Dynamic State Management
    const [settings, setSettings] = useState({
        name: '',
        logo_url: '',
        currency: 'USD',
        tax_rate: 0,
        features: { qr_tracing: false, accounting: false }
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (userRole !== 'TENANT_ADMIN') {
            navigate('/');
        } else {
            apiClient.get('/tenants/settings')
                .then(res => {
                    // Safe parsing of JSONB Features
                    let parsedFeatures = { qr_tracing: false, accounting: false };
                    if (res.data.features) {
                        parsedFeatures = typeof res.data.features === 'string'
                            ? JSON.parse(res.data.features)
                            : res.data.features;
                    }

                    setSettings({
                        ...res.data,
                        features: parsedFeatures
                    });
                })
                .catch(err => console.error("Error fetching settings:", err));
        }
    }, [userRole, navigate]);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        apiClient.post('/tenants/settings/update', settings)
            .then(() => {
                setSuccessMessage(t('settings.success'));
            })
            .catch(err => console.error("Error saving settings:", err))
            .finally(() => setLoading(false));
    };

    if (userRole !== 'TENANT_ADMIN') {
        return (
            <div className="p-6 text-center text-red-500 flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <ShieldAlert size={40} />
                <p className="font-bold">{t('settings.accessDenied')}</p>
                <p className="text-xs text-gray-400">{t('settings.noPermission')}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">{t('settings.title')}</h1>
                <p className="text-gray-400 dark:text-slate-500 text-xs">{t('settings.subtitle')}</p>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle size={16} /> {successMessage}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Side: Localization & Branding */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('settings.companyIdentity')}</h3>

                        {/* Company Legal Name */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{t('settings.businessName')}</label>
                            <input
                                required
                                type="text"
                                value={settings.name || ''}
                                onChange={e => setSettings({ ...settings, name: e.target.value })}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Localized Currency */}
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{t('settings.currency')}</label>
                                <select
                                    value={settings.currency || 'USD'}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200 cursor-pointer"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>

                            {/* Tax/VAT Rate */}
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{t('settings.taxRate')}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.tax_rate || 0}
                                    onChange={e => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Subscription & Features Overview */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('settings.activeModules')}</h3>

                        <div className="space-y-3">
                            {/* QR Tracing module status */}
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
                                <div>
                                    <p className="font-bold text-xs">{t('settings.qrTracing')}</p>
                                    <p className="text-[10px] text-gray-400">{t('settings.qrTracingDesc')}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.features?.qr_tracing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {settings.features?.qr_tracing ? 'ON' : 'OFF'}
                                </span>
                            </div>

                            {/* Accounting module status */}
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/80">
                                <div>
                                    <p className="font-bold text-xs">{t('settings.accounting')}</p>
                                    <p className="text-[10px] text-gray-400">{t('settings.accountingDesc')}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.features?.accounting ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {settings.features?.accounting ? 'ON' : 'OFF'}
                                </span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400">{t('settings.moduleInfo')}</p>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition">
                        {loading ? t('settings.saving') : t('settings.saveButton')}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SettingsPage;