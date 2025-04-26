import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VotePage from "./pages/VotePage";
import AdminPanelPage from './pages/AdminPanelPage';
import ResultsPage from "./pages/ResultsPage";
import BlockchainPage from "./pages/BlockchainPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/admin/results" element={<ResultsPage />} />
        <Route path="/admin/blockchain" element={<BlockchainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
