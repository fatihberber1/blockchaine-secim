import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResultsPage.css";

interface VerifiedResults {
  [candidate: string]: number;
}

interface InvalidBlock {
  region: string;
  index: number;
  candidate: string;
  hash_in_db: string;
  expected_hash: string;
}

const ResultsPage: React.FC = () => {
  const [verifiedResults, setVerifiedResults] = useState<VerifiedResults>({});
  const [invalidBlocks, setInvalidBlocks] = useState<InvalidBlock[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifiedResults();
  }, []);

  const fetchVerifiedResults = async () => {
    try {
      const response = await axios.get<{
        verified_results: VerifiedResults;
        invalid_blocks: InvalidBlock[];
      }>("http://127.0.0.1:8000/results/verified");

      setVerifiedResults(response.data.verified_results);
      setInvalidBlocks(response.data.invalid_blocks);
    } catch (err) {
      console.error(err);
      setError("Sonuçlar yüklenemedi.");
    }
  };

  return (
    <div className="results-container">
      <h1>Doğrulanmış Seçim Sonuçları</h1>
      {error && <p className="error">{error}</p>}

      {/* 1) Global verified sonuçlar */}
      <div className="verified-results">
        <h2>Geçerli Oy Sayımı</h2>
        <ul>
          {Object.entries(verifiedResults).map(([candidate, count]) => (
            <li key={candidate}>
              <strong>{candidate}</strong>: {count} oy
            </li>
          ))}
        </ul>
      </div>

      {/* 2) Invalid bloklar */}
      {invalidBlocks.length > 0 && (
        <div className="anomalies">
          <h2>Geçersiz Bloklar / Uyarılar</h2>
          <ul>
            {invalidBlocks.map((blk) => (
              <li key={`${blk.region}-${blk.index}`}>
                Bölge <strong>{blk.region}</strong>, blok #{blk.index} —{" "}
                <em>{blk.candidate}</em>
                <br />
                <small>
                  DB hash: {blk.hash_in_db.slice(0, 8)}… vs Beklenen:{" "}
                  {blk.expected_hash.slice(0, 8)}…
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
