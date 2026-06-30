/* Path: frontend/src/components/Sidebar.jsx */
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Users, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Sidebar = ({ lang }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const { t } = useTranslation(lang);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const superAdminMenu = [
        { name: t('sidebar.superAdmin'), icon: <Shield size={20} />, path: '/' },
        { name: t('sidebar.globalUsers'), icon: <Users size={20} />, path: '/users' },
        { name: t('sidebar.systemAudit'), icon: <Activity size={20} />, path: '/audit' },
    ];
    const tenantMenu = [
        { name: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} />, path: '/' },
        { name: t('sidebar.inventory'), icon: <Package size={20} />, path: '/inventory' },
        { name: t('sidebar.manageUsers'), icon: <Users size={20} />, path: '/manage-users' },
        { name: t('sidebar.settings'), icon: <Settings size={20} />, path: '/settings' },
    ];

    const currentMenu = role === 'SUPER_ADMIN' ? superAdminMenu : tenantMenu;

    return (
        <div className="w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 h-screen p-5 flex flex-col justify-between border-r border-gray-200 dark:border-slate-800/80 transition-colors duration-300">
            <div>
                <h1 className="text-xl font-black mb-10 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Package className="text-indigo-600 dark:text-indigo-400" /> Bitwell ERP
                </h1>
                <ul className="space-y-2">
                    {currentMenu.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all duration-150 text-sm font-semibold text-gray-500 dark:text-slate-400"
                        >
                            {item.icon} {item.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 dark:text-red-400 hover:text-red-600 w-full p-3 rounded-xl hover:bg-red-50/10 transition-all duration-150 text-sm font-bold">
                    <LogOut size={20} /> {t('sidebar.logout')}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;