/* Path: frontend/src/pages/SystemAuditPage.jsx */
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Activity, ShieldAlert, CheckCircle, Search, Info, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemAuditPage = () => {
    const { darkMode } = useOutletContext();
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = () => {
        apiClient.get('/tenants/audit-logs')
            .then(res => setLogs(res.data))
            .catch(err => console.error("Error fetching audit logs:", err));
    };

    // Action එක අනුව වර්ණය සහ Icon එක තේරීම
    const getActionBadge = (action) => {
        switch (action) {
            case 'CREATE_TENANT':
                return <span className="px-2.5 py-1 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={12} /> Provision</span>;
            case 'SUSPEND_USER':
                return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><ShieldAlert size={12} /> Security</span>;
            default:
                return <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><Info size={12} /> System</span>;
        }
    };

    const filteredLogs = logs.filter(l =>
        l.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Platform Audit Log</h1>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">Immutable system-wide ledger tracking user activities and network actions.</p>
                </div>
            </div>

            {/* Filters Panel */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/30">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter logs by email or action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-slate-200 transition"
                        />
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase bg-gray-50 dark:bg-slate-900/10 font-bold">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Actor</th>
                                <th className="p-4">Event Group</th>
                                <th className="p-4">System Details</th>
                                <th className="p-4 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-950/40 transition">
                                    <td className="p-4 font-semibold text-gray-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-800 dark:text-slate-200">{log.user_email}</td>
                                    <td className="p-4">{getActionBadge(log.action)}</td>
                                    <td className="p-4 text-gray-600 dark:text-slate-300 font-medium">{log.details}</td>
                                    <td className="p-4 text-right font-mono text-gray-400">{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemAuditPage;