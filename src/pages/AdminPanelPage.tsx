import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPanelPage.css";

interface ElectionStats {
  total_votes: number;
  candidates: Record<string, number>;
  regions: Record<string, Record<string, number>>;
}

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin");
        return;
      }

      // Token doğrulaması için basit bir istek
      await axios.get("http://127.0.0.1:8000/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
    } catch (err: any) {
      setError(
        "Yetkili erişimi doğrulanamadı: " +
          (err.response?.data?.detail || "Bilinmeyen hata")
      );
      setLoading(false);
      // Hata durumunda 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Yetkili Paneli</h1>
        <button className="logout-button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Seçim Sonuçları</h2>
          <p>Oy oranlarını bölge ve aday bazında görüntüleyin.</p>
          <button onClick={() => navigate("/admin/results")}>
            Sonuçları Gör
          </button>
        </div>

        <div className="admin-card">
          <h2>Blockchain Yapısı</h2>
          <p>Bölgesel blok zincirlerini ve Merkle ağacını inceleyin.</p>
          <button onClick={() => navigate("/admin/blockchain")}>
            Blockchain'i Gör
          </button>
        </div>

        {stats && (
          <div className="admin-card stats-card">
            <h2>Genel İstatistikler</h2>
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-label">Toplam Oy:</span>
                <span className="stat-value">{stats.total_votes}</span>
              </div>

              <h3>Adaylara Göre Oylar</h3>
              <div className="candidate-stats">
                {Object.entries(stats.candidates || {}).map(
                  ([candidate, votes]) => (
                    <div className="stat-item" key={candidate}>
                      <span className="stat-label">{candidate}:</span>
                      <span className="stat-value">{votes}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
