/* Path: frontend/src/pages/ManageUsersPage.jsx */
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Plus, UserCheck, ShieldAlert, Mail, Lock, PlusCircle, Trash2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ManageUsersPage = () => {
    const { darkMode, lang } = useOutletContext();
    const { t } = useTranslation(lang);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', pass: '', role: 'USER' });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        apiClient.get('/auth/tenant-users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        setSuccessMessage('');
        apiClient.post('/auth/tenant-users/create', newUser)
            .then(() => {
                setIsModalOpen(false);
                fetchUsers();
                setSuccessMessage('Staff member added successfully!');
                setNewUser({ email: '', pass: '', role: 'USER' });
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Staff Management</h1>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">Manage user credentials and warehouse access levels for your organization.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5">
                    <Plus size={16} /> Add Staff Member
                </button>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs font-semibold">
                    {successMessage}
                </div>
            )}

            {/* Users Directory Table */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase bg-gray-50 dark:bg-slate-900/10 font-bold">
                            <th className="p-4">Email Identity</th>
                            <th className="p-4">Workspace Access Level</th>
                            <th className="p-4">Joined Date</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-950/40 transition">
                                <td className="p-4 font-bold text-gray-800 dark:text-slate-200">{user.email}</td>
                                <td className="p-4">
                                    {user.role === 'TENANT_ADMIN' ? (
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold text-[10px]">Manager</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px]">Warehouse Staff</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    {user.is_active ? (
                                        <span className="text-green-500 font-semibold">Active</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold">Suspended</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
                    <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-4 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add New Staff Member</h3>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input required type="email" placeholder="Email Address" onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none" />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input required type="password" placeholder="Default Password" onChange={e => setNewUser({ ...newUser, pass: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Access Level</label>
                            <select onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs outline-none cursor-pointer">
                                <option value="USER">Warehouse Staff (Standard Access)</option>
                                <option value="TENANT_ADMIN">Co-Manager (Full Access)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs dark:text-white">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20">Add User</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManageUsersPage;