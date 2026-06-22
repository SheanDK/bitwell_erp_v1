import { Bell, User } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
            <h2 className="font-semibold text-gray-700">Bitwell Dashboard</h2>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Bell size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        U
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;