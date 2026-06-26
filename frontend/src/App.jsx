/* Path: frontend/src/App.jsx */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DeployTenantPage from './pages/DeployTenantPage';
import GlobalUsersPage from './pages/GlobalUsersPage';
import SystemAuditPage from './pages/SystemAuditPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="super-admin" element={<SuperAdminDashboard />} />
                    <Route path="deploy" element={<DeployTenantPage />} />
                    <Route path="users" element={<GlobalUsersPage />} />
                    <Route path="audit" element={<SystemAuditPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;