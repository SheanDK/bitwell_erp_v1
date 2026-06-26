/* Path: frontend/src/components/Header.jsx */
import { LogOut, Bell, User, Sun, Moon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Header = ({ darkMode, setDarkMode, lang, setLang }) => {
    const navigate = useNavigate();
    const { t } = useTranslation(lang);
    const userEmail = localStorage.getItem('user_email') || 'user@bitwell.com';
    const userRole = localStorage.getItem('role') || 'USER';
    const userInitial = userEmail.charAt(0).toUpperCase();

    const formatRoleName = (role) => {
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        if (role === 'TENANT_ADMIN') return 'Tenant Admin';
        return 'Warehouse Staff';
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm transition-colors duration-300">
            <h2 className="font-semibold text-gray-700 dark:text-slate-200">{t('header.title')}</h2>

            <div className="flex items-center gap-4">
                {/* 1. Global Language Switcher */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 transition">
                    <Globe size={16} className="text-indigo-500 dark:text-indigo-400" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent text-xs outline-none cursor-pointer text-gray-700 dark:text-slate-300 font-medium"
                    >
                        <option value="en" className="bg-white dark:bg-slate-900">EN</option>
                        <option value="fi" className="bg-white dark:bg-slate-900">FN</option>
                        <option value="sw" className="bg-white dark:bg-slate-900">SW</option>
                    </select>
                </div>

                {/* 2. Theme Toggle (Sun/Moon) */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                    {darkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-slate-600" />}
                </button>

                {/* 3. Notifications (Bell) */}
                <button className="p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition">
                    <Bell size={16} />
                </button>

                {/* 4. Live User Profile Info (Highly Professional Layout) */}
                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-slate-800 pl-4">
                    <div className="text-right hidden sm:block">
                        {/* the logged in user's actual email address */}
                        <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{userEmail}</p>
                        {/* the logged in user's actual role */}
                        <p className="text-[10px] text-gray-400 font-semibold">{formatRoleName(userRole)}</p>
                    </div>
                    {/* User Initial Avatar (Letter Avatar) */}
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md uppercase">
                        {userInitial}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;