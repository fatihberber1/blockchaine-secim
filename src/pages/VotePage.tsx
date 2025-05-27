import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./VotePage.css";

interface Candidate {
  name: string;
}

const VotePage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Aday resimlerini eşleştiren fonksiyon
  const getCandidateImage = (candidateName: string): string => {
    const imageMap: { [key: string]: string } = {
      "Ahmet Yılmaz": "/Ahmet Yılmaz.png",
      "Ayşe Demir": "/Ayşe Demir.png",
      "Mehmet Kaya": "/Mehmet Kaya.png",
    };
    return imageMap[candidateName] || "/vite.svg"; // Varsayılan resim
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/candidates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const candidateList = response.data.candidates.map((name: string) => ({
        name,
      }));
      setCandidates(candidateList);
    } catch {
      setError("Adaylar yüklenemedi.");
    }
  };

  const handleVoteClick = (candidateName: string) => {
    setSelectedCandidate(candidateName);
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/vote",
        { candidate: selectedCandidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Başarıyla ${selectedCandidate} için oy kullandınız!`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Oy kullanılamadı.");
    } finally {
      setShowConfirm(false);
      setSelectedCandidate(null);
    }
  };

  const cancelVote = () => {
    setShowConfirm(false);
    setSelectedCandidate(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="vote-wrapper">
      {/* Sayfanın sağ üstüne taşınmış Logout butonu */}
      <button className="logout-btn" onClick={handleLogout}>
        Çıkış Yap
      </button>

      <div className="vote-sheet">
        <h2>Oy Kullan</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="candidates-grid">
          {candidates.map((candidate, idx) => (
            <div className="candidate-card" key={idx}>
              <img
                src={getCandidateImage(candidate.name)}
                alt={candidate.name}
                className="candidate-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/vite.svg"; // Resim yüklenemezse varsayılan
                }}
              />
              <h3>{candidate.name}</h3>
              <button onClick={() => handleVoteClick(candidate.name)}>
                Oy Ver
              </button>
            </div>
          ))}
        </div>
      </div>

      {showConfirm && selectedCandidate && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <img
              src={getCandidateImage(selectedCandidate)}
              alt={selectedCandidate}
              className="confirm-candidate-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/vite.svg";
              }}
            />
            <h3>
              {selectedCandidate} isimli adaya oy vermek istediğinize emin
              misiniz?
            </h3>
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={confirmVote}>
                Evet
              </button>
              <button className="confirm-no" onClick={cancelVote}>
                Hayır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotePage;
