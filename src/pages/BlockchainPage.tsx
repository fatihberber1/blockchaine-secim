import React, { useEffect, useState } from "react";
import axios from "axios";
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

const BlockchainPage: React.FC = () => {
  const [structure, setStructure] = useState<MerkleStructure | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchain();
  }, []);

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

  if (loading) {
    return (
      <div className="blockchain-container">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="blockchain-container">
        <p>Veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="blockchain-container">
      <h1>Blockchain Yapısı</h1>

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

      <div className="region-blocks">
        {structure.regions.map((regionData) => (
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
                      regionData.signatures_valid
                        ? "status-ok"
                        : "status-broken"
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
              {regionData.blocks.map((block) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainPage;
