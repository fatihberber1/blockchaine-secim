import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  LineChart,
  Line,
} from "recharts";
import "./ResultsPage.css";

interface ResultsData {
  [region: string]: {
    [candidate: string]: number;
  };
}

// Backend'deki orijinal bölge isimleri
const STATIC_REGIONS = [
  "Marmara",
  "Ege",
  "Akdeniz",
  "Iç Anadolu",
  "Karadeniz",
  "Doğu Anadolu",
  "Güneydoğu Anadolu",
];

const COLORS = [
  "#4f46e5",
  "#9333ea",
  "#f97316",
  "#06b6d4",
  "#10b981",
  "#ef4444",
  "#f59e0b",
];

type ChartType = "pie" | "bar" | "line" | "comparison";

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultsData>({});
  const [selectedRegion, setSelectedRegion] = useState<string>("Ulusal");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedChart, setSelectedChart] = useState<ChartType>("comparison");

  // Bölge değiştiğinde, eğer trend analizi seçiliyse ve bölge Ulusal değilse
  // seçili grafik türünü karşılaştırmalı görünüme değiştir
  useEffect(() => {
    if (selectedChart === "line" && selectedRegion !== "Ulusal") {
      setSelectedChart("comparison");
    }
  }, [selectedRegion, selectedChart]);

  useEffect(() => {
    axios
      .get<Record<string, any[]>>("http://127.0.0.1:8000/chains")
      .then((res) => {
        const raw = res.data;
        const tally: ResultsData = {};

        Object.entries(raw).forEach(([region, blocks]) => {
          tally[region] = {};
          blocks
            .filter((b) => b.index > 0)
            .forEach((b) => {
              tally[region][b.candidate] =
                (tally[region][b.candidate] || 0) + 1;
            });
        });

        setResults(tally);
      })
      .catch(() => console.error("Zincir verisi alınamadı"));
  }, []);

  const allRegions = ["Ulusal", ...STATIC_REGIONS];
  const allCandidates = Array.from(
    new Set(Object.values(results).flatMap((r) => Object.keys(r)))
  );

  // Bölge ismini görüntüleme için düzeltme fonksiyonu
  const formatRegionName = (regionName: string) => {
    if (regionName === "Iç Anadolu") {
      return "İç Anadolu";
    }
    return regionName;
  };

  // Grafik verileri için bölge isimlerini düzelt
  const multiSeriesData = STATIC_REGIONS.map((region) => ({
    region,
    formattedRegion: formatRegionName(region), // Görüntülemek için kullanılacak düzeltilmiş isim
    ...results[region],
  }));

  // Bar chart için data
  const singleSeriesData = allCandidates.map((name) => ({
    name,
    oy: results[selectedRegion]?.[name] || 0,
  }));

  // Pie chart için data
  const calculatePieData = (region: string) => {
    // Tüm ülke verisi için tüm bölgelerdeki oyları topluyoruz
    if (region === "Ulusal") {
      const totalData = allCandidates.map((cand) => {
        const total = Object.values(results).reduce(
          (sum, reg) => sum + (reg[cand] || 0),
          0
        );
        return { name: cand, value: total };
      });
      const total = totalData.reduce((sum, item) => sum + item.value, 0);
      return totalData.map((item) => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0",
      }));
    }

    // Bölgesel veriler için
    const regionVotes = results[region] || {};
    const total = Object.values(regionVotes).reduce(
      (sum, votes) => sum + votes,
      0
    );

    return Object.entries(regionVotes).map(([name, votes]) => ({
      name,
      value: votes,
      percentage: total > 0 ? ((votes / total) * 100).toFixed(1) : "0",
    }));
  };

  // Line chart için data (son durum yüzdesel değişimi)
  const prepareLineChartData = () => {
    const lineData: any[] = [];

    // Her bölge için bir veri noktası oluşturuyoruz
    STATIC_REGIONS.forEach((region, index) => {
      const regionData: any = {
        region,
        formattedRegion: formatRegionName(region), // Görüntülemek için düzeltilmiş isim
      };

      // Her aday için o bölgedeki oy yüzdesini hesaplıyoruz
      allCandidates.forEach((candidate) => {
        const votes = results[region]?.[candidate] || 0;
        const totalRegionVotes = Object.values(results[region] || {}).reduce(
          (sum, v) => sum + v,
          0
        );
        const percentage =
          totalRegionVotes > 0 ? (votes / totalRegionVotes) * 100 : 0;
        regionData[candidate] = percentage;
      });

      lineData.push(regionData);
    });

    return lineData;
  };

  const pieData = calculatePieData(selectedRegion);
  const lineData = prepareLineChartData();

  // Aktif veri değişikliği için handler (pie chart için)
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Pie chart için aktif sektör render fonksiyonu
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
      percentage,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy - 15}
          dy={8}
          textAnchor="middle"
          fill={fill}
          fontSize="16px"
          fontWeight="bold"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fill="#333"
          fontSize="14px"
        >
          {value} Oy ({percentage}%)
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // X ekseni etiketlerini özelleştiren fonksiyon
  const renderCustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    // Eğer formattedRegion varsa onu kullan, yoksa direk payload.value'yu göster
    const displayText =
      payload.value === "Iç Anadolu" ? "İç Anadolu" : payload.value;

    // Daha kısa gösterim için bölge isimlerini kısalt
    let shortText = displayText;
    if (displayText === "Güneydoğu Anadolu") shortText = "G.doğu Anadolu";
    if (displayText === "Doğu Anadolu") shortText = "D.Anadolu";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-45)"
          style={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          {shortText}
        </text>
      </g>
    );
  };

  // Tooltip için formatlayıcı
  const renderTooltipContent = (tooltipProps: any) => {
    const { active, payload } = tooltipProps;

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${data.name}`}</p>
          <p className="value">{`${data.value} Oy`}</p>
          <p className="percentage">{`(${data.percentage}%)`}</p>
        </div>
      );
    }

    return null;
  };

  // Bölgesel grafikler için tooltip
  const renderRegionBarTooltip = (tooltipProps: any) => {
    const { active, payload, label } = tooltipProps;

    if (active && payload && payload.length) {
      // Kısaltılmış isimleri tam isimlere çevir
      let fullRegionName = label;
      if (label === "G.doğu Anadolu") fullRegionName = "Güneydoğu Anadolu";
      if (label === "D.Anadolu") fullRegionName = "Doğu Anadolu";

      // Iç Anadolu ise İç Anadolu olarak göster
      if (fullRegionName === "Iç Anadolu") fullRegionName = "İç Anadolu";

      return (
        <div className="custom-tooltip">
          <p className="label">{`${fullRegionName} Bölgesi`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} Oy`}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  // Line chart tooltip
  const renderLineTooltip = (tooltipProps: any) => {
    const { active, payload, label } = tooltipProps;

    if (active && payload && payload.length) {
      // Düzeltilmiş bölge ismi için
      const regionLabel = formatRegionName(label);

      return (
        <div className="custom-tooltip">
          <p className="label">{`${regionLabel} Bölgesi`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: %${entry.value.toFixed(1)}`}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  // Dropdown'da görünen bölge ismini düzeltme
  const formatRegionLabel = (regionName: string) => {
    if (regionName === "Iç Anadolu") {
      return "İç Anadolu";
    }
    return regionName;
  };

  return (
    <div className="results-page">
      <div className="page-container">
        <header className="results-header">
          <h1>Seçim Sonuçları</h1>
          <p>Bölgelere göre aday bazlı oy dağılımı ve toplamlar</p>
        </header>

        <section className="summary-cards">
          {allCandidates.map((cand, i) => {
            const total = Object.values(results).reduce(
              (sum, reg) => sum + (reg[cand] || 0),
              0
            );
            const totalVotes = allCandidates.reduce((sum, candidate) => {
              return (
                sum +
                Object.values(results).reduce(
                  (candSum, reg) => candSum + (reg[candidate] || 0),
                  0
                )
              );
            }, 0);
            const percentage =
              totalVotes > 0 ? ((total / totalVotes) * 100).toFixed(1) : "0";

            return (
              <div key={cand} className={`card card-${i % COLORS.length}`}>
                <div className="card-icon">👤</div>
                <h3>{cand}</h3>
                <div className="card-details">
                  <p className="card-votes">{total} Oy</p>
                  <p className="card-percentage">%{percentage}</p>
                </div>
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
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {allRegions.map((r) => (
                <option key={r} value={r}>
                  {r === "Iç Anadolu" ? "İç Anadolu" : r}
                </option>
              ))}
            </select>

            <div className="legend-container">
              <h3>Adaylar</h3>
              <ul className="custom-legend">
                {allCandidates.map((candidate, index) => (
                  <li key={candidate} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="legend-label">{candidate}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="chart-panel">
            <h2>
              {selectedRegion === "Ulusal"
                ? "Ulusal Oy Dağılımı"
                : `${formatRegionName(
                    selectedRegion
                  )} Bölgesindeki Oy Dağılımı`}
            </h2>

            <div className="chart-tabs">
              <button
                className={selectedChart === "pie" ? "active" : ""}
                onClick={() => setSelectedChart("pie")}
              >
                Pasta Grafik
              </button>
              <button
                className={selectedChart === "bar" ? "active" : ""}
                onClick={() => setSelectedChart("bar")}
              >
                Çubuk Grafik
              </button>
              {selectedRegion === "Ulusal" && (
                <button
                  className={selectedChart === "line" ? "active" : ""}
                  onClick={() => setSelectedChart("line")}
                >
                  Trend Analizi
                </button>
              )}
              <button
                className={selectedChart === "comparison" ? "active" : ""}
                onClick={() => setSelectedChart("comparison")}
              >
                Karşılaştırmalı Görünüm
              </button>
            </div>

            {/* Karşılaştırmalı Görünüm - Tüm grafikler yan yana */}
            {selectedChart === "comparison" && (
              <div className="charts-container">
                {/* Pie Chart */}
                <div className="chart-wrapper pie-chart">
                  <h3>Oy Oranları</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltipContent} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="chart-wrapper bar-chart">
                  <h3>Oy Sayıları</h3>
                  {selectedRegion === "Ulusal" ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={multiSeriesData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="region"
                          height={70}
                          tick={renderCustomAxisTick}
                          interval={0}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={renderRegionBarTooltip} />
                        <Legend />
                        {allCandidates.map((cand, i) => (
                          <Bar
                            key={cand}
                            dataKey={cand}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={singleSeriesData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="oy" fill={COLORS[0]}>
                          {singleSeriesData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Pasta Grafik - Sadece pasta grafik göster */}
            {selectedChart === "pie" && (
              <div className="chart-single">
                <h3>Oy Oranları - Pasta Grafik</h3>
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltipContent} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Çubuk Grafik - Sadece çubuk grafik göster */}
            {selectedChart === "bar" && (
              <div className="chart-single">
                <h3>Oy Sayıları - Çubuk Grafik</h3>
                {selectedRegion === "Ulusal" ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                      data={multiSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="region"
                        height={70}
                        tick={renderCustomAxisTick}
                        interval={0}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={renderRegionBarTooltip} />
                      <Legend />
                      {allCandidates.map((cand, i) => (
                        <Bar
                          key={cand}
                          dataKey={cand}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                      data={singleSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="oy" name="Oy Sayısı" fill={COLORS[0]}>
                        {singleSeriesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Trend Analizi - Çizgi grafik göster (sadece Ulusal seçiliyken) */}
            {selectedChart === "line" && selectedRegion === "Ulusal" && (
              <div className="chart-single">
                <h3>Bölgelere Göre Oy Eğilimi (%)</h3>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart
                    data={lineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="region"
                      height={70}
                      tick={renderCustomAxisTick}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip content={renderLineTooltip} />
                    <Legend />
                    {allCandidates.map((candidate, index) => (
                      <Line
                        key={candidate}
                        type="monotone"
                        dataKey={candidate}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResultsPage;
