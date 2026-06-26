//frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiClient.post('/auth/login', { email, pass: password });


            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('tenant_id', res.data.tenant_id || 'superadmin');
            localStorage.setItem('user_email', email);

            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4">
            {/* Animated Card */}
            <motion.div
                initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <h2 className="text-3xl font-extrabold text-white text-center mb-2">Bitwell ERP</h2>
                <p className="text-blue-200 text-center mb-8">Login to your workspace</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 text-blue-300 group-focus-within:text-white transition" size={18} />
                        <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-blue-300 group-focus-within:text-white transition" size={18} />
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg flex justify-center">
                        {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                    </button>
                </form>
            </motion.div>

            {/* Footer */}
            <footer className="absolute bottom-6 text-blue-300/60 text-sm">
                &copy; {new Date().getFullYear()} Bitwell ERP Solutions. All rights reserved.
            </footer>
        </div>
    );
};
export default LoginPage;