/* Path: frontend/src/components/ConfirmModal.jsx */
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4 transition-colors duration-300"
                >
                    {/* Warning Header */}
                    <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                        <AlertTriangle size={20} className="shrink-0" />
                        <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400">{title || "Are you sure?"}</h3>
                    </div>

                    {/* Detailed Message */}
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-red-600/20 transition"
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;