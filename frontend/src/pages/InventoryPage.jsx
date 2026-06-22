// frontend/src/pages/InventoryPage.jsx

import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const InventoryPage = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        apiClient.get('/inventory/list')
            .then(res => setItems(res.data))
            .catch(err => console.error("Error fetching inventory:", err));
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Item Name</th>
                        <th className="py-2">SKU</th>
                        <th className="py-2">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">{item.name}</td>
                            <td className="py-2">{item.sku}</td>
                            <td className="py-2">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default InventoryPage;