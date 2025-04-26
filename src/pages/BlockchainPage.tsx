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

interface MerkleStructure {
  root: string;
  merkle_root: string;
  children: {
    region: string;
    blocks: Block[];
  }[];
}

const BlockchainPage: React.FC = () => {
  const [structure, setStructure] = useState<MerkleStructure | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockchain();
  }, []);

  const fetchBlockchain = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/structure");
      setStructure(response.data);
    } catch (err) {
      setError("Blockchain verisi alınamadı.");
    }
  };

  return (
    <div className="blockchain-container">
      <h1>Blockchain Yapısı</h1>
      {error && <p className="error">{error}</p>}

      {structure && (
        <>
          <p className="merkle-root">
            <strong>Merkle Root:</strong> {structure.merkle_root}
          </p>

          <div className="region-blocks">
            {structure.children.map((regionData) => (
              <div className="region-card" key={regionData.region}>
                <h2>{regionData.region}</h2>
                <div className="block-list">
                  {regionData.blocks.map((block, i) => (
                    <div className="block-card" key={i}>
                      <p><strong>Index:</strong> {block.index}</p>
                      <p><strong>Aday:</strong> {block.candidate}</p>
                      <p><strong>Timestamp:</strong> {new Date(block.timestamp * 1000).toLocaleString()}</p>
                      <p><strong>Voter ID Hash:</strong> {block.voter_id_hash}</p>
                      <p><strong>Prev Hash:</strong> {block.previous_hash}</p>
                      <p><strong>Hash:</strong> {block.hash}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BlockchainPage;
