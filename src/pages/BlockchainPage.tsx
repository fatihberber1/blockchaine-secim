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
              <h3>Blok #{block.index} Detayları</h3>
              <div className="detail-item">
                <span>Aday:</span>
                <span>{block.candidate}</span>
              </div>
              <div className="detail-item">
                <span>Zaman:</span>
                <span>{new Date(block.timestamp * 1000).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>Seçmen Hash:</span>
                <span className="hash-text">{block.voter_id_hash}</span>
              </div>
              <div className="detail-item">
                <span>Hash:</span>
                <span className="hash-text">{block.hash}</span>
              </div>
              <div className="detail-item">
                <span>Önceki Hash:</span>
                <span className="hash-text">{block.previous_hash}</span>
              </div>
              {block.signature && (
                <div className="detail-item">
                  <span>İmza:</span>
                  <span className="hash-text">{block.signature}</span>
                </div>
              )}
              <button
                className="close-button"
                onClick={() => setSelectedDetail(null)}
              >
                Kapat
              </button>
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
              <h3>{region.region} Bölgesi Detayları</h3>
              <div className="detail-item">
                <span>Durum:</span>
                <span
                  className={
                    region.status === "OK" ? "status-ok" : "status-broken"
                  }
                >
                  {region.status === "OK" ? "✓ Geçerli" : "✗ Geçersiz"}
                </span>
              </div>
              <div className="detail-item">
                <span>Merkle Root:</span>
                <span className="hash-text">{region.live_root}</span>
              </div>
              {region.signatures_valid !== undefined && (
                <div className="detail-item">
                  <span>İmzalar:</span>
                  <span
                    className={
                      region.signatures_valid ? "status-ok" : "status-broken"
                    }
                  >
                    {region.signatures_valid ? "✓ Geçerli" : "✗ Geçersiz"}
                  </span>
                </div>
              )}
              {region.updated_at && (
                <div className="detail-item">
                  <span>Güncelleme:</span>
                  <span>{region.updated_at}</span>
                </div>
              )}
              <div className="detail-item">
                <span>Blok Sayısı:</span>
                <span>{region.blocks.length}</span>
              </div>
              <button
                className="close-button"
                onClick={() => setSelectedDetail(null)}
              >
                Kapat
              </button>
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
              <h3>Merkle Ağacı Detayları</h3>
              <div className="detail-item">
                <span>Canlı Merkle Root:</span>
                <span className="hash-text">{merkle.live_merkle_root}</span>
              </div>
              <div className="detail-item">
                <span>Kayıtlı Merkle Root:</span>
                <span className="hash-text">{merkle.stored_merkle_root}</span>
              </div>
              <div className="detail-item">
                <span>Eşleşme Durumu:</span>
                <span
                  className={merkle.match ? "match-valid" : "match-invalid"}
                >
                  {merkle.match ? "✓ Tutarlı" : "✗ Tutarsız"}
                </span>
              </div>
              {merkle.stored_signature && (
                <div className="detail-item">
                  <span>İmza:</span>
                  <span className="hash-text">{merkle.stored_signature}</span>
                </div>
              )}
              {merkle.signature_valid !== undefined && (
                <div className="detail-item">
                  <span>İmza Doğrulaması:</span>
                  <span
                    className={
                      merkle.signature_valid
                        ? "valid-signature"
                        : "invalid-signature"
                    }
                  >
                    {merkle.signature_valid ? "✓ Geçerli" : "✗ Geçersiz"}
                  </span>
                </div>
              )}
              <button
                className="close-button"
                onClick={() => setSelectedDetail(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Blok kartını render eden yardımcı fonksiyon
  const renderBlockCard = (block: Block) => (
    <div className="block-card" key={block.index}>
      <p>
        <strong>Index:</strong> {block.index}
      </p>
      <p>
        <strong>Aday:</strong> {block.candidate}
      </p>
      <p>
        <strong>Zaman:</strong>{" "}
        {new Date(block.timestamp * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Seçmen Hash:</strong> {block.voter_id_hash}
      </p>
      <p>
        <strong>Önceki Hash:</strong> {block.previous_hash}
      </p>
      <p>
        <strong>Hash:</strong> {block.hash}
      </p>

      {block.signature && (
        <p className="signature">
          <strong>İmza:</strong>
          <span className="signature-text">
            {block.signature.substring(0, 15)}...
          </span>
        </p>
      )}
    </div>
  );

  // Bölge kartını render eden yardımcı fonksiyon (liste görünümü için)
  const renderRegionCardListView = (regionData: RegionEntry) => (
    <div className="region-card" key={regionData.region}>
      <h2>{regionData.region}</h2>
      <div className="region-header">
        <p>
          <strong>Durum:</strong>{" "}
          <span
            className={
              regionData.status === "OK" ? "status-ok" : "status-broken"
            }
          >
            {regionData.status === "OK" ? "✓ Geçerli" : "✗ Geçersiz"}
          </span>
        </p>
        <p>
          <strong>Bölge Merkle Root:</strong> {regionData.live_root}
        </p>

        {regionData.signatures_valid !== undefined && (
          <p>
            <strong>İmza Doğrulaması:</strong>{" "}
            <span
              className={
                regionData.signatures_valid ? "status-ok" : "status-broken"
              }
            >
              {regionData.signatures_valid ? "✓ Geçerli" : "✗ Geçersiz"}
            </span>
          </p>
        )}

        {regionData.updated_at && (
          <p>
            <strong>Güncellendi:</strong> {regionData.updated_at}
          </p>
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

  if (loading) {
    return (
      <div className="blockchain-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Geri
        </button>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Geri
        </button>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="blockchain-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Geri
        </button>
        <p>Veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="blockchain-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Geri
      </button>
      <h1>Blockchain Yapısı</h1>

      {/* Görünüm seçenekleri */}
      <div className="view-options">
        <button
          className={`view-button ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          Liste Görünümü
        </button>
        <button
          className={`view-button ${viewMode === "tree" ? "active" : ""}`}
          onClick={() => setViewMode("tree")}
        >
          Ağaç Görünümü
        </button>
      </div>

      <div className="merkle-summary">
        <h2>Ulusal Merkle Ağacı</h2>
        <div className="merkle-info">
          <p>
            <strong>Canlı Merkle Root:</strong> {structure.live_merkle_root}
          </p>
          <p>
            <strong>Kayıtlı Merkle Root:</strong> {structure.stored_merkle_root}
          </p>

          {structure.stored_signature && (
            <p>
              <strong>İmza:</strong>
              <span className="signature-text">
                {structure.stored_signature.substring(0, 20)}...
              </span>
              <span
                className={
                  structure.signature_valid
                    ? "valid-signature"
                    : "invalid-signature"
                }
              >
                {structure.signature_valid ? "✓ Geçerli" : "✗ Geçersiz"}
              </span>
            </p>
          )}

          <p className={structure.match ? "match-valid" : "match-invalid"}>
            <strong>Eşleşme Durumu:</strong>
            {structure.match ? "✓ Tutarlı" : "✗ Tutarsız"}
          </p>
        </div>
      </div>

      {/* İçerik gösterimi (ya liste ya da ağaç görünümü) */}
      {viewMode === "list" ? (
        <div className="region-blocks">
          {structure.regions.map((regionData) =>
            renderRegionCardListView(regionData)
          )}
        </div>
      ) : (
        renderTreeView()
      )}

      {/* Detay Modalı */}
      {renderDetailModal()}
    </div>
  );
};

export default BlockchainPage;
