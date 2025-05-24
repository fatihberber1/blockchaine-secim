import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./BlockchainPage.css";

interface Block {
  index: number;
  previous_hash: string;
  timestamp: number;
  voter_id_hash: string;
  candidate: string;
  hash: string;
  signature?: string;
}

interface RegionEntry {
  region: string;
  status: string;
  live_root: string;
  signatures_valid?: boolean;
  updated_at?: string;
  blocks: Block[];
}

interface MerkleStructure {
  root: string;
  regions: RegionEntry[];
  stored_merkle_root: string;
  live_merkle_root: string;
  stored_signature?: string;
  signature_valid?: boolean;
  match: boolean;
}

type ViewMode = "list" | "tree";

interface SelectedDetail {
  type: "block" | "region" | "root";
  data: any;
}

const BlockchainPage: React.FC = () => {
  const navigate = useNavigate();
  const [structure, setStructure] = useState<MerkleStructure | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(
    null
  );
  // Bölge div'leri için referansları tutacak nesne
  const blocksContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );

  useEffect(() => {
    fetchBlockchain();
  }, []);

  // Eklenmiş yeni bölge blok konteynırlarını her render sonrası kontrol et
  useEffect(() => {
    // Her bir blok konteynırını üste kaydır
    Object.values(blocksContainerRefs.current).forEach((ref) => {
      if (ref) {
        ref.scrollTop = 0;
      }
    });
  }, [viewMode, structure]); // viewMode veya structure değiştiğinde çalıştır

  const fetchBlockchain = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<MerkleStructure>(
        "http://127.0.0.1:8000/structure",
        { headers }
      );
      setStructure(response.data);
      setLoading(false);
    } catch (err) {
      setError("Blockchain verisi alınamadı.");
      setLoading(false);
    }
  };

  const handleDetailClick = (type: "block" | "region" | "root", data: any) => {
    // Eğer aynı öğeye tıklanmışsa detayı kapat
    if (
      selectedDetail &&
      selectedDetail.type === type &&
      selectedDetail.data === data
    ) {
      setSelectedDetail(null);
    } else {
      setSelectedDetail({ type, data });
    }
  };

  if (loading) {
    return (
      <div className="blockchain-container">
        <div className="blockchain-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Blockchain Yapısı</h1>
            <p>Blok zinciri ve Merkle ağacı analizi</p>
          </div>
        </div>

        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Blockchain verisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-container">
        <div className="blockchain-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Blockchain Yapısı</h1>
            <p>Blok zinciri ve Merkle ağacı analizi</p>
          </div>
        </div>

        <div className="error-container">
          <span className="error-icon">!</span>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchBlockchain}>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="blockchain-container">
        <div className="blockchain-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Blockchain Yapısı</h1>
            <p>Blok zinciri ve Merkle ağacı analizi</p>
          </div>
        </div>

        <div className="no-data-container">
          <span className="no-data-icon">-</span>
          <p>Blockchain verisi bulunamadı</p>
        </div>
      </div>
    );
  }

  // Blok detaylarını gösteren modal
  const renderDetailModal = () => {
    if (!selectedDetail) return null;

    // Detay gösterim yerini ayarla
    let modalClassName = "detail-modal";

    switch (selectedDetail.type) {
      case "block":
        const block = selectedDetail.data as Block;
        return (
          <div
            className={modalClassName}
            onClick={() => setSelectedDetail(null)}
          >
            <div
              className="detail-content block-detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="detail-header">
                <h3>Blok #{block.index} Detayları</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedDetail(null)}
                >
                  ✕
                </button>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Aday:</span>
                  <span className="detail-value candidate-name">
                    {block.candidate}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Zaman:</span>
                  <span className="detail-value">
                    {new Date(block.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seçmen Hash:</span>
                  <span className="detail-value hash-text">
                    {block.voter_id_hash}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Blok Hash:</span>
                  <span className="detail-value hash-text">{block.hash}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Önceki Hash:</span>
                  <span className="detail-value hash-text">
                    {block.previous_hash}
                  </span>
                </div>
                {block.signature && (
                  <div className="detail-item">
                    <span className="detail-label">İmza:</span>
                    <span className="detail-value hash-text">
                      {block.signature}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "region":
        const region = selectedDetail.data as RegionEntry;
        return (
          <div
            className={modalClassName}
            onClick={() => setSelectedDetail(null)}
          >
            <div
              className="detail-content region-detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="detail-header">
                <h3>Bölge Detayları: {region.region}</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedDetail(null)}
                >
                  ✕
                </button>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Durum:</span>
                  <span
                    className={`detail-value status-badge ${
                      region.status === "OK" ? "status-ok" : "status-broken"
                    }`}
                  >
                    {region.status === "OK" ? "✓ Geçerli" : "✗ Geçersiz"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Merkle Root:</span>
                  <span className="detail-value hash-text">
                    {region.live_root}
                  </span>
                </div>
                {region.signatures_valid !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label">İmzalar:</span>
                    <span
                      className={`detail-value status-badge ${
                        region.signatures_valid ? "status-ok" : "status-broken"
                      }`}
                    >
                      {region.signatures_valid ? "✓ Geçerli" : "✗ Geçersiz"}
                    </span>
                  </div>
                )}
                {region.updated_at && (
                  <div className="detail-item">
                    <span className="detail-label">Güncelleme:</span>
                    <span className="detail-value">{region.updated_at}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Blok Sayısı:</span>
                  <span className="detail-value block-count">
                    {region.blocks.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "root":
        const merkle = selectedDetail.data;
        return (
          <div
            className={modalClassName}
            onClick={() => setSelectedDetail(null)}
          >
            <div
              className="detail-content root-detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="detail-header">
                <h3>Merkle Ağacı Detayları</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedDetail(null)}
                >
                  ✕
                </button>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Canlı Merkle Root:</span>
                  <span className="detail-value hash-text">
                    {merkle.live_merkle_root}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Kayıtlı Merkle Root:</span>
                  <span className="detail-value hash-text">
                    {merkle.stored_merkle_root}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Eşleşme Durumu:</span>
                  <span
                    className={`detail-value status-badge ${
                      merkle.match ? "match-valid" : "match-invalid"
                    }`}
                  >
                    {merkle.match ? "✓ Tutarlı" : "✗ Tutarsız"}
                  </span>
                </div>
                {merkle.stored_signature && (
                  <div className="detail-item">
                    <span className="detail-label">İmza:</span>
                    <span className="detail-value hash-text">
                      {merkle.stored_signature}
                    </span>
                  </div>
                )}
                {merkle.signature_valid !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label">İmza Doğrulaması:</span>
                    <span
                      className={`detail-value status-badge ${
                        merkle.signature_valid
                          ? "valid-signature"
                          : "invalid-signature"
                      }`}
                    >
                      {merkle.signature_valid ? "✓ Geçerli" : "✗ Geçersiz"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Blok kartını render eden yardımcı fonksiyon
  const renderBlockCard = (block: Block) => (
    <div
      className="block-card"
      key={block.index}
      onClick={() => handleDetailClick("block", block)}
    >
      <div className="block-header">
        <span className="block-index">#{block.index}</span>
        <span className="block-candidate">{block.candidate}</span>
      </div>

      <div className="block-info">
        <div className="block-detail">
          <span className="block-label">Zaman:</span>
          <span className="block-value">
            {new Date(block.timestamp * 1000).toLocaleString()}
          </span>
        </div>

        <div className="block-detail">
          <span className="block-label">Seçmen Hash:</span>
          <span className="block-value hash-short">
            {block.voter_id_hash.substring(0, 12)}...
          </span>
        </div>

        <div className="block-detail">
          <span className="block-label">Hash:</span>
          <span className="block-value hash-short">
            {block.hash.substring(0, 12)}...
          </span>
        </div>

        {block.signature && (
          <div className="block-detail">
            <span className="block-label">İmza:</span>
            <span className="block-value signature-indicator">✓ Mevcut</span>
          </div>
        )}
      </div>
    </div>
  );

  // Bölge kartını render eden yardımcı fonksiyon (liste görünümü için)
  const renderRegionCardListView = (regionData: RegionEntry) => (
    <div className="region-card" key={regionData.region}>
      <div className="region-header">
        <div className="region-title">
          <h2>Bölge: {regionData.region}</h2>
          <span className="block-count-badge">
            {regionData.blocks.length} Blok
          </span>
        </div>

        <button
          className="region-detail-button"
          onClick={() => handleDetailClick("region", regionData)}
        >
          <span>→</span>
          Detaylar
        </button>
      </div>

      <div className="region-info">
        <div className="region-stat">
          <span className="region-label">Durum:</span>
          <span
            className={`region-value status-badge ${
              regionData.status === "OK" ? "status-ok" : "status-broken"
            }`}
          >
            {regionData.status === "OK" ? "✓ Geçerli" : "✗ Geçersiz"}
          </span>
        </div>

        <div className="region-stat">
          <span className="region-label">Merkle Root:</span>
          <span className="region-value hash-display">
            {regionData.live_root}
          </span>
        </div>

        {regionData.signatures_valid !== undefined && (
          <div className="region-stat">
            <span className="region-label">İmza Doğrulaması:</span>
            <span
              className={`region-value status-badge ${
                regionData.signatures_valid ? "status-ok" : "status-broken"
              }`}
            >
              {regionData.signatures_valid ? "✓ Geçerli" : "✗ Geçersiz"}
            </span>
          </div>
        )}

        {regionData.updated_at && (
          <div className="region-stat">
            <span className="region-label">Güncellendi:</span>
            <span className="region-value">{regionData.updated_at}</span>
          </div>
        )}
      </div>

      <div className="block-list">
        {regionData.blocks.map((block) => renderBlockCard(block))}
      </div>
    </div>
  );

  // Ağaç görünümü
  const renderTreeView = () => {
    if (!structure) return null;

    return (
      <div className="tree-view">
        {/* Ana Merkle Root (Kök) */}
        <div className="tree-node root-node">
          <div
            className="node-content"
            onClick={() => handleDetailClick("root", structure)}
          >
            <h3>Ana Merkle Kökü</h3>
            <p className="node-hash">{structure.live_merkle_root}</p>
            <p className={structure.match ? "match-valid" : "match-invalid"}>
              {structure.match ? "✓ Tutarlı" : "✗ Tutarsız"}
            </p>
          </div>

          {/* Bölge Düğümleri */}
          <div className="tree-children">
            {structure.regions.map((region) => (
              <div className="tree-node region-node" key={region.region}>
                <div
                  className="node-content"
                  onClick={() => handleDetailClick("region", region)}
                >
                  <h4>{region.region}</h4>
                  <p className="node-hash">
                    {region.live_root.substring(0, 8)}...
                  </p>
                  <p
                    className={
                      region.status === "OK" ? "status-ok" : "status-broken"
                    }
                  >
                    {region.status === "OK" ? "✓ Geçerli" : "✗ Geçersiz"}
                  </p>
                </div>

                {/* Blok Düğümleri */}
                <div
                  className="tree-children blocks-container"
                  ref={(el) => {
                    blocksContainerRefs.current[region.region] = el;
                    return undefined;
                  }}
                >
                  {region.blocks.map((block) => (
                    <div className="tree-node block-node" key={block.index}>
                      <div
                        className="node-content"
                        onClick={() => handleDetailClick("block", block)}
                      >
                        <h5>Blok #{block.index}</h5>
                        <p className="block-candidate">{block.candidate}</p>
                        <p className="block-hash">
                          {block.hash.substring(0, 6)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="blockchain-container">
      <div className="blockchain-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
          Geri
        </button>
        <div className="header-title">
          <h1>Blockchain Yapısı</h1>
          <p>Blok zinciri ve Merkle ağacı analizi</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="blockchain-stats">
        <div className="stat-card primary">
          <div className="stat-content">
            <h3>Merkle Durumu</h3>
            <p
              className={`stat-status ${
                structure.match ? "status-ok" : "status-error"
              }`}
            >
              {structure.match ? "✓ Tutarlı" : "✗ Tutarsız"}
            </p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-content">
            <h3>Bölge Sayısı</h3>
            <p className="stat-number">{structure.regions.length}</p>
          </div>
        </div>

        <div className="stat-card tertiary">
          <div className="stat-content">
            <h3>Toplam Blok</h3>
            <p className="stat-number">
              {structure.regions.reduce(
                (total, region) => total + region.blocks.length,
                0
              )}
            </p>
          </div>
        </div>

        <div className="stat-card quaternary">
          <div className="stat-content">
            <h3>İmza Durumu</h3>
            <p
              className={`stat-status ${
                structure.signature_valid ? "status-ok" : "status-error"
              }`}
            >
              {structure.signature_valid !== undefined
                ? structure.signature_valid
                  ? "✓ Geçerli"
                  : "✗ Geçersiz"
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Görünüm Seçenekleri */}
      <div className="view-controls">
        <h2>Blockchain Görünümü</h2>
        <div className="view-options">
          <button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <span>■</span>
            Liste Görünümü
          </button>
          <button
            className={`view-button ${viewMode === "tree" ? "active" : ""}`}
            onClick={() => setViewMode("tree")}
          >
            <span>●</span>
            Ağaç Görünümü
          </button>
        </div>
      </div>

      {/* Merkle Özet Kartı */}
      <div className="merkle-summary">
        <div className="summary-header">
          <h2>Ulusal Merkle Ağacı</h2>
          <button
            className="detail-button"
            onClick={() => handleDetailClick("root", structure)}
          >
            <span>→</span>
            Detayları Gör
          </button>
        </div>

        <div className="merkle-info">
          <div className="merkle-item">
            <span className="merkle-label">Canlı Merkle Root:</span>
            <span className="merkle-value hash-display">
              {structure.live_merkle_root}
            </span>
          </div>

          <div className="merkle-item">
            <span className="merkle-label">Kayıtlı Merkle Root:</span>
            <span className="merkle-value hash-display">
              {structure.stored_merkle_root}
            </span>
          </div>

          {structure.stored_signature && (
            <div className="merkle-item">
              <span className="merkle-label">İmza:</span>
              <div className="signature-container">
                <span className="merkle-value signature-text">
                  {structure.stored_signature.substring(0, 20)}...
                </span>
                <span
                  className={`signature-status ${
                    structure.signature_valid
                      ? "valid-signature"
                      : "invalid-signature"
                  }`}
                >
                  {structure.signature_valid ? "✓ Geçerli" : "✗ Geçersiz"}
                </span>
              </div>
            </div>
          )}

          <div className="merkle-item">
            <span className="merkle-label">Eşleşme Durumu:</span>
            <span
              className={`merkle-value match-status ${
                structure.match ? "match-valid" : "match-invalid"
              }`}
            >
              {structure.match ? "✓ Tutarlı" : "✗ Tutarsız"}
            </span>
          </div>
        </div>
      </div>

      {/* İçerik gösterimi (ya liste ya da ağaç görünümü) */}
      <div className="blockchain-content">
        {viewMode === "list" ? (
          <div className="region-blocks">
            {structure.regions.map((regionData) =>
              renderRegionCardListView(regionData)
            )}
          </div>
        ) : (
          renderTreeView()
        )}
      </div>

      {/* Detay Modalı */}
      {renderDetailModal()}
    </div>
  );
};

export default BlockchainPage;
