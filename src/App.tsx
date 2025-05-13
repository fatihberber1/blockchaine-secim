import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VotePage from "./pages/VotePage";
import AdminPanelPage from "./pages/AdminPanelPage";
import ResultsPage from "./pages/ResultsPage";
import BlockchainPage from "./pages/BlockchainPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    // Sayfa yenilendiğinde token silme işlemini gerçekleştir
    const handlePageRefresh = () => {
      localStorage.removeItem("token");
    };

    // Sayfa yüklendiğinde mevcut tokenleri temizle
    handlePageRefresh();

    // Sayfa yenilenmeden önce çalışacak event listener
    window.addEventListener("beforeunload", handlePageRefresh);

    // Component unmount olduğunda event listener'ı temizle
    return () => {
      window.removeEventListener("beforeunload", handlePageRefresh);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Korumalı oy verme sayfası - normal kullanıcı tokeni gerektirir */}
        <Route
          path="/vote"
          element={
            <ProtectedRoute>
              <VotePage />
            </ProtectedRoute>
          }
        />

        {/* Korumalı admin sayfaları - admin tokeni gerektirir */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute adminOnly={true}>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blockchain"
          element={
            <ProtectedRoute adminOnly={true}>
              <BlockchainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
