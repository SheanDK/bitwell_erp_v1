import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout'; // 'src/layout/MainLayout.jsx' වෙත යොමු කරයි
import InventoryPage from './pages/InventoryPage'; // 'src/pages/InventoryPage.jsx' වෙත යොමු කරයි

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<InventoryPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;