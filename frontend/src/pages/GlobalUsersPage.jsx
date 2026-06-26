/* Path: frontend/src/pages/GlobalUsersPage.jsx */
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Search, ShieldAlert, ShieldCheck, Mail, Loader2 } from 'lucide-react';

const GlobalUsersPage = () => {
    const { darkMode } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingUserId, setLoadingUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        apiClient.get('/auth/users/list')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    };


    const handleToggleUserStatus = (userId, currentStatus) => {
        setLoadingUserId(userId);
        const newStatus = !currentStatus;

        apiClient.post('/auth/users/toggle-status', { id: userId, isActive: newStatus })
            .then(() => {
                setUsers(prev => prev.map(u => {
                    if (u.id === userId) {
                        return { ...u, is_active: newStatus };
                    }
                    return u;
                }));
            })
            .catch(err => console.error("Error toggling user status:", err))
            .finally(() => setLoadingUserId(null));
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">Super Admin</span>;
            case 'TENANT_ADMIN':
                return <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">Tenant Admin</span>;
            default:
                return <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full text-xs font-bold">Staff / User</span>;
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.tenant_name && u.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">Global User Directory</h1>
                <p className="text-gray-400 dark:text-slate-500 text-xs">Manage authentication identities and access levels across all organizations.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/30">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by email, role or tenant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-slate-200 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase bg-gray-50 dark:bg-slate-900/10 font-bold">
                                <th className="p-4">User Identity</th>
                                <th className="p-4">Access Level (Role)</th>
                                <th className="p-4">Assigned Workspace</th>
                                <th className="p-4">Joined Date</th>
                                <th className="p-4">Account Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-950/40 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className={`font-bold ${user.is_active ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 line-through'}`}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{getRoleBadge(user.role)}</td>
                                    <td className="p-4 font-semibold text-gray-500 dark:text-slate-400">
                                        {user.tenant_name || <span className="text-xs text-slate-500 italic">SaaS Platform</span>}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    {/* Account Status Badge */}
                                    <td className="p-4">
                                        {user.is_active ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-bold text-[10px]">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-bold text-[10px]">Suspended</span>
                                        )}
                                    </td>
                                    {/* Action Buttons */}
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {loadingUserId === user.id ? (
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        ) : (
                                            <button
                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                className={`p-1.5 rounded-lg transition ${user.is_active
                                                    ? 'hover:bg-red-50 text-red-500'
                                                    : 'hover:bg-green-50 text-green-500'
                                                    }`}
                                                title={user.is_active ? "Suspend User" : "Activate User"}
                                            >
                                                {user.is_active ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GlobalUsersPage;