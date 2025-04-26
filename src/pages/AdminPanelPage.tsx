import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanelPage.css";

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <h2>Seçim Sonuçları</h2>
          <p>Oy oranlarını bölge ve aday bazında görüntüleyin.</p>
          <button onClick={() => navigate("/admin/results")}>Sonuçları Gör</button>
        </div>
        <div className="admin-card">
          <h2>Blockchain Yapısı</h2>
          <p>Bölgesel blok zincirlerini ve Merkle ağacını inceleyin.</p>
          <button onClick={() => navigate("/admin/blockchain")}>Blockchain'i Gör</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
