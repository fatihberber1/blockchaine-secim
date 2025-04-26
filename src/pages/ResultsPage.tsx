import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResultsPage.css";

interface Results {
  [region: string]: {
    [candidate: string]: number;
  };
}

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Results>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/results");
      setResults(response.data);
    } catch (err) {
      setError("Sonuçlar yüklenemedi.");
    }
  };

  return (
    <div className="results-container">
      <h1>Seçim Sonuçları</h1>
      {error && <p className="error">{error}</p>}

      <div className="results-grid">
        {Object.entries(results).map(([region, candidates]) => (
          <div className="result-card" key={region}>
            <h2>{region}</h2>
            <ul>
              {Object.entries(candidates).map(([name, count]) => (
                <li key={name}>
                  <strong>{name}</strong>: {count} oy
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
