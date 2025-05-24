import React, { useState, useEffect } from "react";
import "./TurkeyRegionMap.css";

interface Candidate {
  name: string;
  votes: number;
}

interface ResultData {
  region: string;
  candidates: Candidate[];
}

interface TurkeyRegionMapProps {
  data: ResultData[];
  colors: string[];
  onRegionClick?: (region: string) => void;
}

// Şehir-bölge eşleştirmesi
const cityToRegion: { [key: string]: string } = {
  // Marmara Bölgesi
  Istanbul: "Marmara",
  Tekirdağ: "Marmara",
  Edirne: "Marmara",
  Kırklareli: "Marmara",
  Çanakkale: "Marmara",
  Balıkesir: "Marmara",
  Bursa: "Marmara",
  BIlecik: "Marmara", // SVG'de "BIlecik" olarak yazılmış
  Kocaeli: "Marmara",
  Sakarya: "Marmara",
  Yalova: "Marmara",

  // Ege Bölgesi
  Izmir: "Ege",
  Aydin: "Ege", // SVG'de "Aydin" olarak yazılmış
  Denizli: "Ege",
  Muğla: "Ege",
  Manisa: "Ege",
  Afyonkarahisar: "Ege",
  Kütahya: "Ege",
  Usak: "Ege", // SVG'de "Usak" olarak yazılmış

  // Akdeniz Bölgesi
  Antalya: "Akdeniz",
  Mersin: "Akdeniz",
  Adana: "Akdeniz",
  Hatay: "Akdeniz",
  Kahramanmaraş: "Akdeniz",
  Osmaniye: "Akdeniz",
  Burdur: "Akdeniz",
  Isparta: "Akdeniz",

  // İç Anadolu Bölgesi
  Ankara: "İç Anadolu",
  Konya: "İç Anadolu",
  Eskisehir: "İç Anadolu",
  Çankırı: "İç Anadolu",
  Kırıkkale: "İç Anadolu",
  Kirsehir: "İç Anadolu",
  Nevsehir: "İç Anadolu",
  Nigde: "İç Anadolu",
  Aksaray: "İç Anadolu",
  Karaman: "İç Anadolu",
  Yozgat: "İç Anadolu",
  Sivas: "İç Anadolu",
  Kayseri: "İç Anadolu",

  // Karadeniz Bölgesi
  Zonguldak: "Karadeniz",
  Düzce: "Karadeniz",
  Karabük: "Karadeniz",
  Bartın: "Karadeniz",
  Kastamonu: "Karadeniz",
  Çorum: "Karadeniz",
  Sinop: "Karadeniz",
  Samsun: "Karadeniz",
  Amasya: "Karadeniz",
  Tokat: "Karadeniz",
  Ordu: "Karadeniz",
  Giresun: "Karadeniz",
  Trabzon: "Karadeniz",
  Rize: "Karadeniz",
  Artvin: "Karadeniz",
  Gümüşhane: "Karadeniz",
  Bayburt: "Karadeniz",
  Bolu: "Karadeniz", // SVG'de var

  // Doğu Anadolu Bölgesi
  Erzurum: "Doğu Anadolu",
  Erzincan: "Doğu Anadolu",
  Tunceli: "Doğu Anadolu",
  Bingöl: "Doğu Anadolu",
  Elazig: "Doğu Anadolu",
  Malatya: "Doğu Anadolu",
  Hakkari: "Doğu Anadolu",
  Van: "Doğu Anadolu",
  Bitlis: "Doğu Anadolu",
  Mus: "Doğu Anadolu",
  Agri: "Doğu Anadolu",
  Iğdır: "Doğu Anadolu",
  Kars: "Doğu Anadolu",
  Ardahan: "Doğu Anadolu",

  // Güneydoğu Anadolu Bölgesi
  Gaziantep: "Güneydoğu Anadolu",
  Adiyaman: "Güneydoğu Anadolu",
  Kilis: "Güneydoğu Anadolu",
  Sanliurfa: "Güneydoğu Anadolu",
  Diyarbakır: "Güneydoğu Anadolu",
  Mardin: "Güneydoğu Anadolu",
  Batman: "Güneydoğu Anadolu",
  Sirnak: "Güneydoğu Anadolu",
  Siirt: "Güneydoğu Anadolu",
};

const TurkeyRegionMap: React.FC<TurkeyRegionMapProps> = ({
  data,
  colors,
  onRegionClick,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    // SVG dosyasını yükle
    console.log("SVG dosyası yükleniyor...");
    fetch("/MapChart_Map.svg")
      .then((response) => response.text())
      .then((svgText) => {
        console.log("SVG dosyası yüklendi, boyut:", svgText.length);
        setSvgContent(svgText);
      })
      .catch((error) => {
        console.error("SVG dosyası yüklenemedi:", error);
      });
  }, []);

  // Her bölge için kazanan adayı bul
  const getRegionWinner = (regionName: string) => {
    const regionData = data.find((item) => item.region === regionName);
    if (!regionData) return null;

    let maxVotes = 0;
    let winner = "";
    let winnerIndex = 0;

    regionData.candidates.forEach((candidate: Candidate, index: number) => {
      if (candidate.votes > maxVotes) {
        maxVotes = candidate.votes;
        winner = candidate.name;
        winnerIndex = index;
      }
    });

    return { winner, color: colors[winnerIndex], index: winnerIndex };
  };

  // Bölge için renk al
  const getRegionColor = (regionName: string) => {
    const winner = getRegionWinner(regionName);
    return winner ? winner.color : "#e5e7eb";
  };

  // Bölge tıklama işlevi
  const handleRegionClick = (regionName: string) => {
    if (onRegionClick) {
      onRegionClick(regionName);
    }
  };

  // SVG'yi işle ve bölge renklerini uygula
  const processedSvg = React.useMemo(() => {
    if (!svgContent) return "";

    console.log("SVG işleniyor, bölge sayısı:", data.length);
    let processedContent = svgContent;

    // Her şehir için bölgesini bul ve rengini uygula
    Object.entries(cityToRegion).forEach(([cityName, regionName]) => {
      const regionColor = getRegionColor(regionName);
      console.log(`${cityName} -> ${regionName} -> ${regionColor}`);

      // SVG'deki path elementinin fill attribute'ını değiştir veya ekle
      // Önce mevcut fill attribute'ını değiştirmeye çalış
      const fillRegex = new RegExp(
        `(<path[^>]*id="${cityName}"[^>]*?)fill="[^"]*"([^>]*>)`,
        "g"
      );
      if (processedContent.match(fillRegex)) {
        processedContent = processedContent.replace(
          fillRegex,
          `$1fill="${regionColor}"$2`
        );
      } else {
        // Eğer fill attribute'ı yoksa ekle
        const pathRegex = new RegExp(
          `(<path[^>]*id="${cityName}"[^>]*?)>`,
          "g"
        );
        processedContent = processedContent.replace(
          pathRegex,
          `$1 fill="${regionColor}">`
        );
      }

      // Style içindeki fill'i de değiştir (varsa)
      const styleRegex = new RegExp(
        `(<path[^>]*id="${cityName}"[^>]*style="[^"]*?)fill:[^;]*([^"]*")`,
        "g"
      );
      processedContent = processedContent.replace(
        styleRegex,
        `$1fill:${regionColor}$2`
      );
    });

    console.log("SVG işleme tamamlandı");
    return processedContent;
  }, [svgContent, data, colors]);

  // SVG'ye event listener'ları ekle
  useEffect(() => {
    if (!processedSvg) return;

    const svgElement = document.querySelector(".turkey-svg-container svg");
    if (!svgElement) return;

    const handlePathClick = (event: Event) => {
      const target = event.target as SVGPathElement;
      const cityId = target.id;
      const regionName = cityToRegion[cityId];

      if (regionName) {
        handleRegionClick(regionName);
      }
    };

    const handlePathMouseEnter = (event: Event) => {
      const target = event.target as SVGPathElement;
      const cityId = target.id;
      const regionName = cityToRegion[cityId];

      if (regionName) {
        target.style.cursor = "pointer";
      }
    };

    // Tüm path elementlerine event listener ekle
    const paths = svgElement.querySelectorAll("path[id]");
    paths.forEach((path) => {
      path.addEventListener("click", handlePathClick);
      path.addEventListener("mouseenter", handlePathMouseEnter);
    });

    return () => {
      paths.forEach((path) => {
        path.removeEventListener("click", handlePathClick);
        path.removeEventListener("mouseenter", handlePathMouseEnter);
      });
    };
  }, [processedSvg]);

  const regions = [
    "Marmara",
    "Ege",
    "Akdeniz",
    "İç Anadolu",
    "Karadeniz",
    "Doğu Anadolu",
    "Güneydoğu Anadolu",
  ];

  return (
    <div className="turkey-region-map">
      <div className="map-container">
        {/* Gerçek SVG Türkiye Haritası */}
        <div
          className="turkey-svg-container"
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      </div>

      {/* Bölge Detayları */}
      <div className="region-details">
        <h3>Bölge Sonuçları</h3>
        <div className="region-grid">
          {regions.map((regionName) => {
            const regionData = data.find((item) => item.region === regionName);
            const winner = getRegionWinner(regionName);

            if (!regionData || !winner) return null;

            const totalVotes = regionData.candidates.reduce(
              (sum, candidate) => sum + candidate.votes,
              0
            );

            return (
              <div
                key={regionName}
                className="region-card"
                style={{ borderLeftColor: winner.color }}
                onClick={() => handleRegionClick(regionName)}
              >
                <h4>{regionName}</h4>
                <div className="candidates-list">
                  {regionData.candidates
                    .map((candidate, index) => ({
                      ...candidate,
                      originalIndex: index,
                    }))
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate) => {
                      const isWinner = candidate.originalIndex === winner.index;
                      const percentage = (
                        (candidate.votes / totalVotes) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={candidate.name}
                          className={`candidate-info ${
                            isWinner ? "winner" : ""
                          }`}
                          style={
                            isWinner
                              ? { backgroundColor: winner.color + "20" }
                              : {}
                          }
                        >
                          <div className="candidate-row">
                            <div className="candidate-name">
                              {candidate.name}
                            </div>
                            <div className="vote-count">
                              {candidate.votes} oy
                            </div>
                            <div className="vote-percentage">%{percentage}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TurkeyRegionMap;
