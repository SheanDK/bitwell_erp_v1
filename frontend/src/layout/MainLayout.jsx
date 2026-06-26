/* Path: frontend/src/layout/MainLayout.jsx */
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    const [lang, setLang] = useState('en');

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            <Sidebar lang={lang} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    lang={lang}
                    setLang={setLang}
                />
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <Outlet context={{ darkMode, lang }} />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;