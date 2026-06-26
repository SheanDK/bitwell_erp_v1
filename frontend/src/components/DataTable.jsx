/* Path: frontend/src/components/DataTable.jsx */
import { useReactTable, getCoreRowModel, flexRender, getFilteredRowModel } from '@tanstack/react-table';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export const DataTable = ({ data, columns, renderRowDetails }) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const toggleRow = (rowId) => {
        setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    return (
        <div className="space-y-4">
            {/* Netvisor Quick Search Bar */}
            <div className="flex justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search items, SKU, or rack..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>
            </div>

            {/* Main Table Grid */}
            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm bg-white">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                                <th className="p-4 w-10"></th>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.map(row => (
                            <>
                                <tr key={row.id} className="hover:bg-gray-50/50 transition duration-150">
                                    <td className="p-4 text-center">
                                        <button onClick={() => toggleRow(row.id)} className="text-gray-400 hover:text-gray-600">
                                            {expandedRows[row.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                    </td>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4 font-medium text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                                {/* Expandable Row Detail Panel */}
                                {expandedRows[row.id] && renderRowDetails && (
                                    <tr className="bg-blue-50/20">
                                        <td colSpan={columns.length + 1} className="p-6 border-l-4 border-blue-500">
                                            {renderRowDetails(row.original)}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};