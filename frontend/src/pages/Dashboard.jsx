/* Path: frontend/src/pages/Dashboard.jsx */
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/apiClient';
import TenantDashboard from '../components/TenantDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const { lang } = useOutletContext();
    const [role, setRole] = useState('');

    // Scanner States
    const [scanStep, setScanStep] = useState('idle');
    const [scannedItem, setScannedItem] = useState('');
    const [scannedRack, setScannedRack] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    // QR Scanner Starting Logic 
    const startScanner = (step) => {
        setScanStep(step);
        setStatusMessage('');

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            });

            scanner.render(
                (decodedText) => {
                    scanner.clear();

                    if (step === 'scanning_item') {
                        setScannedItem(decodedText);
                        setScanStep('scanning_rack');
                    } else if (step === 'scanning_rack') {
                        setScannedRack(decodedText);
                        submitQrMapping(scannedItem, decodedText);
                    }
                },
                (error) => {
                }
            );
        }, 100);
    };

    const submitQrMapping = (itemSku, rackCode) => {
        setScanStep('submitting');
        apiClient.post('/inventory/map-qr', { itemSku, rackCode })
            .then(res => {
                if (res.data.error) {
                    setScanStep('idle');
                    setStatusMessage({ type: 'error', text: res.data.error });
                } else {
                    setScanStep('success');
                    setStatusMessage({ type: 'success', text: `Mapped Successfully to ${rackCode}` });
                }
            })
            .catch(() => {
                setScanStep('idle');
                setStatusMessage({ type: 'error', text: 'Server connection failed.' });
            });
    };

    // Warehouse Staff Portal UI Layout
    const StaffUserView = () => (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-800 dark:text-white">Warehouse Staff Portal</h1>
                <p className="text-xs text-gray-400 dark:text-slate-500">Live inventory tracing and physical rack mapping.</p>
            </div>

            {statusMessage && (
                <div className={`p-4 mb-6 rounded-xl text-xs font-semibold flex items-center gap-2 ${statusMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {statusMessage.text}
                </div>
            )}

            {/* Live Camera Scanner Box */}
            {(scanStep === 'scanning_item' || scanStep === 'scanning_rack') && (
                <div className="border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 text-center">
                    <p className="text-xs font-bold mb-3 text-indigo-600 dark:text-indigo-400 animate-pulse">
                        {scanStep === 'scanning_item' ? "STEP 1: SCAN PRODUCT BARCODE/QR" : "STEP 2: SCAN PHYSICAL RACK CODE"}
                    </p>
                    <div id="reader" className="mx-auto max-w-sm rounded-2xl overflow-hidden"></div>
                </div>
            )}

            {/* Normal State Options */}
            {scanStep === 'idle' && (
                <div className="p-6 bg-blue-50 dark:bg-slate-950 rounded-2xl border border-blue-100 dark:border-slate-800/80 flex flex-col justify-between">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                        <QrCode size={18} /> Scan & Trace Item
                    </h3>
                    <p className="text-xs text-blue-600/80 dark:text-slate-400 my-3">
                        Use your device camera to scan item QR codes and verify rack placements. This will update the database in real-time.
                    </p>
                    <button
                        onClick={() => startScanner('scanning_item')}
                        className="bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        Start Tracing Process
                    </button>
                </div>
            )}

            {/* Success Animation Area */}
            {scanStep === 'success' && (
                <div className="p-8 text-center space-y-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto animate-bounce" />
                    <h4 className="font-bold text-gray-800 dark:text-white">Mapping Complete!</h4>
                    <p className="text-xs text-gray-400">Database relation has been updated across isolated tenant schemas.</p>
                    <button
                        onClick={() => setScanStep('idle')}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-xs font-bold rounded-xl transition"
                    >
                        Scan Another Item
                    </button>
                </div>
            )}
        </div>
    );

    // Dynamic View Selection
    switch (role) {
        case 'SUPER_ADMIN':
            return <SuperAdminDashboard />;
        case 'TENANT_ADMIN':
            return <TenantDashboard />;
        case 'USER':
            return <StaffUserView />;
        default:
            return <div className="p-6">Loading Portal...</div>;
    }
};

export default Dashboard;