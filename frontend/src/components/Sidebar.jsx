import { LayoutDashboard, Package, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-64 bg-slate-900 text-white h-screen p-5">
            <h1 className="text-2xl font-bold mb-10">Bitwell ERP</h1>
            <ul className="space-y-4">
                <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                    <LayoutDashboard size={20} /> Dashboard
                </li>
                <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                    <Package size={20} /> Inventory
                </li>
                <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                    <BarChart3 size={20} /> Reports
                </li>
                <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                    <Settings size={20} /> Settings
                </li>
            </ul>
        </div>
    );
};
export default Sidebar;