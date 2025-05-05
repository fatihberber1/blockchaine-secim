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
}

interface RegionEntry {
  region: string;
  status: string;
  live_root: string;
  updated_at?: string;
  blocks: Block[];
}

interface MerkleStructure {
  root: string; // "Ulusal Seçim Zinciri"
  regions: RegionEntry[]; // children yerine regions
  stored_merkle_root: string; // eğer kullanıyorsan
  live_merkle_root: string;
  match: boolean;
}

const BlockchainPage: React.FC = () => {
  const [structure, setStructure] = useState<MerkleStructure | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockchain();
  }, []);

  const fetchBlockchain = async () => {
    try {
      const response = await axios.get<MerkleStructure>(
        "http://127.0.0.1:8000/structure"
      );
      setStructure(response.data);
    } catch (err) {
      setError("Blockchain verisi alınamadı.");
    }
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!structure) {
    return <p>Yükleniyor…</p>;
  }

  return (
    <div className="blockchain-container">
      <h1>Blockchain Yapısı</h1>

      <p className="merkle-root">
        <strong>Ulusal Merkle Root:</strong> {structure.live_merkle_root}
      </p>

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
                  {regionData.status}
                </span>
              </p>
              <p>
                <strong>Bölge Merkle Root:</strong> {regionData.live_root}
              </p>
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
                    <strong>Voter ID Hash:</strong> {block.voter_id_hash}
                  </p>
                  <p>
                    <strong>Önceki Hash:</strong> {block.previous_hash}
                  </p>
                  <p>
                    <strong>Hash:</strong> {block.hash}
                  </p>
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
