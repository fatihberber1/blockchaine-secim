import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import TurkeyRegionMap from "../components/TurkeyRegionMap";
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

type ChartType = "pie" | "bar" | "line" | "comparison" | "map";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData>({});
  const [selectedRegion, setSelectedRegion] = useState<string>("Ulusal");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedChart, setSelectedChart] = useState<ChartType>("comparison");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bölge değiştiğinde, eğer trend analizi seçiliyse ve bölge Ulusal değilse
  // seçili grafik türünü karşılaştırmalı görünüme değiştir
  useEffect(() => {
    if (selectedChart === "line" && selectedRegion !== "Ulusal") {
      setSelectedChart("comparison");
    }
  }, [selectedRegion, selectedChart]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get<Record<string, any[]>>(
        "http://127.0.0.1:8000/chains"
      );
      const raw = response.data;
      const tally: ResultsData = {};

      Object.entries(raw).forEach(([region, blocks]) => {
        tally[region] = {};
        blocks
          .filter((b) => b.index > 0)
          .forEach((b) => {
            tally[region][b.candidate] = (tally[region][b.candidate] || 0) + 1;
          });
      });

      setResults(tally);
      setLoading(false);
    } catch (err) {
      setError("Seçim sonuçları alınamadı");
      setLoading(false);
      console.error("Zincir verisi alınamadı:", err);
    }
  };

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

  // Aday ismine göre emoji döndüren fonksiyon
  const getCandidateEmoji = (candidateName: string) => {
    const name = candidateName.toLowerCase();

    // İsim bazlı emoji eşleştirmesi
    if (name.includes("ahmet") || name.includes("ahmed")) return "👨‍💼";
    if (name.includes("mehmet") || name.includes("muhammet")) return "👨‍🎓";
    if (name.includes("ali") || name.includes("alı")) return "👨‍⚖️";
    if (name.includes("mustafa")) return "👨‍🏫";
    if (name.includes("fatma") || name.includes("hatice")) return "👩‍💼";
    if (name.includes("ayşe") || name.includes("aise")) return "👩‍🎓";
    if (name.includes("zeynep") || name.includes("zeinep")) return "👩‍⚖️";
    if (name.includes("emine")) return "👩‍🏫";
    if (name.includes("hasan") || name.includes("hüseyin")) return "👨‍💻";
    if (name.includes("ibrahim") || name.includes("ismail")) return "👨‍🔬";
    if (name.includes("ömer") || name.includes("omer")) return "👨‍🎨";
    if (name.includes("yusuf") || name.includes("yakup")) return "👨‍🚀";
    if (name.includes("murat") || name.includes("murad")) return "👨‍🏭";
    if (name.includes("kemal") || name.includes("kamal")) return "👨‍🎯";
    if (name.includes("selim") || name.includes("salim")) return "👨‍🎪";

    // Genel kategoriler
    if (name.includes("dr.") || name.includes("doktor")) return "👨‍⚕️";
    if (name.includes("prof.") || name.includes("profesör")) return "👨‍🏫";
    if (name.includes("mühendis") || name.includes("engineer")) return "👨‍💻";
    if (name.includes("avukat") || name.includes("lawyer")) return "👨‍⚖️";

    // Varsayılan emojiler (sırayla)
    const defaultEmojis = ["👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍⚖️", "👩‍⚖️", "👨‍🏫", "👩‍🏫"];
    const hash = candidateName
      .split("")
      .reduce((a, b) => a + b.charCodeAt(0), 0);
    return defaultEmojis[hash % defaultEmojis.length];
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="results-page">
        <div className="results-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Seçim Sonuçları</h1>
            <p>Bölgelere göre aday bazlı oy dağılımı ve analiz</p>
          </div>
        </div>

        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Seçim sonuçları yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="results-page">
        <div className="results-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Seçim Sonuçları</h1>
            <p>Bölgelere göre aday bazlı oy dağılımı ve analiz</p>
          </div>
        </div>

        <div className="error-container">
          <span className="error-icon">!</span>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchResults}>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

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
        {/* Modern Header */}
        <div className="results-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span>←</span>
            Geri
          </button>
          <div className="header-title">
            <h1>Seçim Sonuçları</h1>
            <p>Bölgelere göre aday bazlı oy dağılımı ve analiz</p>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="results-stats">
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
              <div
                key={cand}
                className={`candidate-card candidate-${i % COLORS.length}`}
              >
                <div className="candidate-icon">{getCandidateEmoji(cand)}</div>
                <div className="candidate-info">
                  <h3>{cand}</h3>
                  <div className="candidate-stats">
                    <span className="vote-count">
                      {total.toLocaleString()} Oy
                    </span>
                    <span className="vote-percentage">%{percentage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ana Dashboard */}
        <div className="main-dashboard">
          {/* Kontrol Paneli */}
          <div className="control-panel">
            <div className="region-selector">
              <h3>Bölge Seçimi</h3>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="region-select"
              >
                {allRegions.map((r) => (
                  <option key={r} value={r}>
                    {r === "Iç Anadolu" ? "İç Anadolu" : r}
                  </option>
                ))}
              </select>
            </div>

            <div className="chart-type-selector">
              <h3>Görünüm Türü</h3>
              <div className="chart-tabs">
                <button
                  className={`chart-tab ${
                    selectedChart === "pie" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("pie")}
                >
                  <span>○</span>
                  Pasta Grafik
                </button>
                <button
                  className={`chart-tab ${
                    selectedChart === "bar" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("bar")}
                >
                  <span>■</span>
                  Çubuk Grafik
                </button>
                {selectedRegion === "Ulusal" && (
                  <button
                    className={`chart-tab ${
                      selectedChart === "line" ? "active" : ""
                    }`}
                    onClick={() => setSelectedChart("line")}
                  >
                    <span>▲</span>
                    Trend Analizi
                  </button>
                )}
                <button
                  className={`chart-tab ${
                    selectedChart === "comparison" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("comparison")}
                >
                  <span>◆</span>
                  Karşılaştırma
                </button>
                <button
                  className={`chart-tab ${
                    selectedChart === "map" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("map")}
                >
                  <span>●</span>
                  Harita Görünümü
                </button>
              </div>
            </div>

            <div className="legend-container">
              <h3>Aday Listesi</h3>
              <div className="candidate-legend">
                {allCandidates.map((candidate, index) => (
                  <div key={candidate} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="legend-label">{candidate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grafik Paneli */}
          <div className="chart-panel">
            <div className="chart-header">
              <h2>
                {selectedRegion === "Ulusal"
                  ? "Ulusal Oy Dağılımı"
                  : `${formatRegionName(selectedRegion)} Bölgesi Oy Dağılımı`}
              </h2>
              <div className="chart-info">
                <span className="total-votes">
                  Toplam:{" "}
                  {selectedRegion === "Ulusal"
                    ? Object.values(results)
                        .reduce(
                          (sum, reg) =>
                            sum + Object.values(reg).reduce((s, v) => s + v, 0),
                          0
                        )
                        .toLocaleString()
                    : Object.values(results[selectedRegion] || {})
                        .reduce((s, v) => s + v, 0)
                        .toLocaleString()}{" "}
                  Oy
                </span>
              </div>
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

            {/* Türkiye Haritası Görünümü */}
            {selectedChart === "map" && (
              <div className="chart-single map-view">
                <TurkeyRegionMap
                  data={STATIC_REGIONS.map((region) => ({
                    region: formatRegionName(region),
                    candidates: allCandidates.map((candidate) => ({
                      name: candidate,
                      votes: results[region]?.[candidate] || 0,
                    })),
                  }))}
                  colors={COLORS}
                  onRegionClick={(region) => {
                    // Haritadan bölge seçildiğinde o bölgeyi seç
                    const originalRegionName =
                      region === "İç Anadolu" ? "Iç Anadolu" : region;
                    setSelectedRegion(originalRegionName);
                    setSelectedChart("comparison");
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
