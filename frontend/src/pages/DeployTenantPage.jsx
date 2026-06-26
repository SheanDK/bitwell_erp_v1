/* Path: frontend/src/pages/DeployTenantPage.jsx */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Building, Layers, Phone } from 'lucide-react';

const DeployTenantPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', slug: '', phone: '', ownerEmail: '', ownerPass: '', planId: 1 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await apiClient.post('/tenants/create', formData);
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Provisioning failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
                <ArrowLeft size={16} /> Back to Command Center
            </button>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm transition-colors duration-300">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Deploy Namespace Cluster</h2>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Provision a clean database schema and default administrator account.</p>
                </div>

                {message && (
                    <div className={`p-4 mb-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Business Details (With Phone Input) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Business Information</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Building className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                <input required type="text" placeholder="Entity Name (e.g. Keells)" onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200" />
                            </div>
                            <div className="relative">
                                <Building className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                <input required type="text" placeholder="Workspace Slug (e.g. keells)" onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200" />
                            </div>
                        </div>

                        {/* Contact Number Input Field */}
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input required type="text" placeholder="Contact/Telephone Number" onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200" />
                        </div>
                    </div>

                    {/* Section 2: Owner Credentials */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Workspace Owner Credentials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                <input required type="email" placeholder="Owner Email Address" onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                <input required type="password" placeholder="Default Password" onChange={e => setFormData({ ...formData, ownerPass: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-200" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Subscription Plans */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Subscription Tier</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {['Basic', 'Pro', 'Enterprise'].map((plan, index) => (
                                <button key={index} type="button" onClick={() => setFormData({ ...formData, planId: index + 1 })} className={`p-4 border rounded-2xl text-left transition-all ${formData.planId === index + 1 ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-slate-800 bg-transparent'}`}>
                                    <Layers size={18} className="mb-2" />
                                    <p className="font-bold text-xs">{plan}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition">
                            {loading ? 'Deploying...' : 'Confirm and Deploy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeployTenantPage;