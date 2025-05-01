import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import "./ResultsPage.css";

interface ResultsData {
  [region: string]: {
    [candidate: string]: number;
  };
}

const STATIC_REGIONS = [
  "Marmara", "Ege", "Akdeniz",
  "İç Anadolu", "Karadeniz",
  "Doğu Anadolu", "Güneydoğu Anadolu"
];

const COLORS = ["#4f46e5", "#9333ea", "#f97316", "#06b6d4"];

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultsData>({});
  const [selectedRegion, setSelectedRegion] = useState<string>("Ulusal");

  useEffect(() => {
    axios.get<Record<string, any[]>>("http://127.0.0.1:8000/chains")
      .then(res => {
        const raw = res.data;
        const tally: ResultsData = {};

        Object.entries(raw).forEach(([region, blocks]) => {
          tally[region] = {};
          blocks
            .filter(b => b.index > 0)
            .forEach(b => {
              tally[region][b.candidate] = (tally[region][b.candidate] || 0) + 1;
            });
        });

        setResults(tally);
      })
      .catch(() => console.error("Zincir verisi alınamadı"));
  }, []);

  const allRegions = ["Ulusal", ...STATIC_REGIONS];
  const allCandidates = Array.from(
    new Set(Object.values(results).flatMap(r => Object.keys(r)))
  );

  const multiSeriesData = STATIC_REGIONS.map(region => ({
    region,
    ...results[region]
  }));

  const singleSeriesData = allCandidates.map(name => ({
    name,
    oy: (results[selectedRegion]?.[name] || 0)
  }));

  return (
    <div className="results-page">
      <div className="page-container">
        <header className="results-header">
          <h1>Seçim Sonuçları</h1>
          <p>Bölgelere göre aday bazlı oy dağılımı ve toplamlar</p>
        </header>

        <section className="summary-cards">
          {allCandidates.map((cand, i) => {
            const total = Object.values(results)
              .reduce((sum, reg) => sum + (reg[cand] || 0), 0);
            return (
              <div key={cand} className={`card card-${i % COLORS.length}`}>
                <div className="card-icon">👤</div>
                <h3>{cand}</h3>
                <p className="card-votes">{total} Oy</p>
              </div>
            );
          })}
        </section>

        <section className="main-dashboard">
          <aside className="filter-panel">
            <label htmlFor="region">Bölge Seç:</label>
            <select
              id="region"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
            >
              {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </aside>

          <div className="chart-panel">
            {selectedRegion === "Ulusal" ? (
              <>
                <h2>Bölgesel Oy Dağılımı</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={multiSeriesData}
                    margin={{ top:20, right:30, left:10, bottom:10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {allCandidates.map((cand, i) => (
                      <Bar key={cand} dataKey={cand}
                        fill={COLORS[i % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <h2>{selectedRegion} Bölgesindeki Oy Dağılımı</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={singleSeriesData}
                    margin={{ top:20, right:30, left:10, bottom:10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="oy" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ResultsPage;
