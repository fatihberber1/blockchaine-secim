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
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/chains");
      const raw = response.data;

      let totalVotes = 0;
      const candidates: Record<string, number> = {};
      const regions: Record<string, Record<string, number>> = {};

      Object.entries(raw as Record<string, any[]>).forEach(
        ([region, blocks]) => {
          regions[region] = {};
          blocks
            .filter((b) => b.index > 0)
            .forEach((b) => {
              totalVotes++;
              candidates[b.candidate] = (candidates[b.candidate] || 0) + 1;
              regions[region][b.candidate] =
                (regions[region][b.candidate] || 0) + 1;
            });
        }
      );

      setStats({ total_votes: totalVotes, candidates, regions });
    } catch (err) {
      console.error("İstatistikler alınamadı:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Sistem yükleniyor...</p>
        </div>
      </div>
    );
  }

  const topCandidate = stats?.candidates
    ? Object.entries(stats.candidates).reduce((a, b) => (a[1] > b[1] ? a : b))
    : null;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Yönetici Kontrol Paneli</h1>
            <p>Seçim sistemini yönetin ve sonuçları analiz edin</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span>→</span>
            Oturumu Kapat
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}

      {/* İstatistik Kartları */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-content">
              <h3>Toplam Oy Sayısı</h3>
              <p className="stat-number">
                {stats.total_votes.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-content">
              <h3>Kayıtlı Aday</h3>
              <p className="stat-number">
                {Object.keys(stats.candidates).length}
              </p>
            </div>
          </div>

          <div className="stat-card tertiary">
            <div className="stat-content">
              <h3>Önde Gelen Aday</h3>
              <p className="stat-number">
                {topCandidate ? topCandidate[0] : "Belirlenmedi"}
              </p>
              <p className="stat-detail">
                {topCandidate ? `${topCandidate[1]} oy` : ""}
              </p>
            </div>
          </div>

          <div className="stat-card quaternary">
            <div className="stat-content">
              <h3>Aktif Bölge</h3>
              <p className="stat-number">{Object.keys(stats.regions).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ana İşlem Kartları */}
      <div className="admin-grid">
        <div className="admin-card results-card">
          <div className="card-header">
            <h2>Seçim Sonuçları</h2>
          </div>
          <p>
            Oy oranlarını bölge ve aday bazında detaylı olarak görüntüleyin.
            Grafiksel analiz ve harita görünümü ile kapsamlı raporlama.
          </p>
          <div className="card-features">
            <span className="feature">● Grafiksel Analiz Araçları</span>
            <span className="feature">● İnteraktif Harita Görünümü</span>
            <span className="feature">● Detaylı İstatistiksel Raporlar</span>
          </div>
          <button
            className="card-button primary-button"
            onClick={() => navigate("/admin/results")}
          >
            Sonuçları Görüntüle
          </button>
        </div>

        <div className="admin-card blockchain-card">
          <div className="card-header">
            <h2>Blockchain Yapısı</h2>
          </div>
          <p>
            Bölgesel blok zincirlerini ve Merkle ağacını inceleyin. Sistem
            güvenliğini ve veri bütünlüğünü kontrol edin.
          </p>
          <div className="card-features">
            <span className="feature">● Blok Zinciri Analizi</span>
            <span className="feature">● Merkle Ağacı Doğrulaması</span>
            <span className="feature">● Güvenlik Denetimi</span>
          </div>
          <button
            className="card-button secondary-button"
            onClick={() => navigate("/admin/blockchain")}
          >
            Blockchain Analizi
          </button>
        </div>
      </div>

      {/* Detaylı İstatistikler */}
      {stats && (
        <div className="detailed-stats">
          <h2>■ Detaylı İstatistiksel Analiz</h2>
          <div className="stats-grid">
            <div className="stats-section">
              <h3>● Adaylara Göre Oy Dağılımı</h3>
              <div className="candidate-list">
                {Object.entries(stats.candidates)
                  .sort(([, a], [, b]) => b - a)
                  .map(([candidate, votes], index) => {
                    const percentage = (
                      (votes / stats.total_votes) *
                      100
                    ).toFixed(1);
                    return (
                      <div className="candidate-item" key={candidate}>
                        <div className="candidate-rank">#{index + 1}</div>
                        <div className="candidate-info">
                          <span className="candidate-name">{candidate}</span>
                          <div className="vote-bar">
                            <div
                              className="vote-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="candidate-stats">
                          <span className="vote-count">
                            {votes.toLocaleString()}
                          </span>
                          <span className="vote-percentage">%{percentage}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
