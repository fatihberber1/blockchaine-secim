import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const regions = [
  "Marmara",
  "Ege",
  "Akdeniz",
  "İç Anadolu",
  "Karadeniz",
  "Doğu Anadolu",
  "Güneydoğu Anadolu",
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tc: "", region: "Marmara", password: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/login", form);
      localStorage.setItem("token", response.data.access_token);
      navigate("/vote");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Giriş başarısız.");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/login",
        adminForm
      );
      localStorage.setItem("token", response.data.access_token);
      navigate("/admin");
    } catch (err: any) {
      setAdminError(err.response?.data?.detail || "Admin girişi başarısız.");
    }
  };

  const toggleLoginForm = () => {
    setShowAdminLogin(!showAdminLogin);
    setError(null);
    setAdminError(null);
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>E-Seçim Sistemine Hoş Geldiniz</h1>
        <p>
          Güvenli ve şeffaf oy kullanma deneyimi için giriş yapın veya kaydınız
          yoksa kayıt olun.
        </p>

        <ul className="info-points">
          <li>
            <strong>Blockchain Tabanlı</strong> — Her oy şifreli olarak kayıt
            altına alınır.
          </li>
          <li>
            <strong>Şeffaflık</strong> — Tüm veriler doğrulanabilir ve
            izlenebilir.
          </li>
          <li>
            <strong>Erişilebilirlik</strong> — Türkiye'nin her bölgesinden
            katılım sağlanabilir.
          </li>
          <li>
            <strong>Yetkili Doğrulama</strong> — Girişler T.C. Kimlik No ile
            güvence altındadır.
          </li>
        </ul>
      </div>

      <div className="login-right">
        {!showAdminLogin ? (
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Seçmen Girişi</h2>

            <label>T.C. Kimlik No</label>
            <input
              type="text"
              name="tc"
              value={form.tc}
              onChange={handleChange}
              maxLength={11}
              required
            />

            <label>Bölge</label>
            <select name="region" value={form.region} onChange={handleChange}>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit">Giriş Yap</button>

            <div className="login-links">
              <p>
                Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
              </p>
              <p>
                <button
                  type="button"
                  className="link-button"
                  onClick={toggleLoginForm}
                >
                  Yetkili Girişi
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminSubmit} className="login-form admin-form">
            <h2>Yetkili Girişi</h2>

            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={adminForm.username}
              onChange={handleAdminChange}
              required
            />

            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={adminForm.password}
              onChange={handleAdminChange}
              required
            />

            {adminError && <p className="error">{adminError}</p>}

            <button type="submit">Yetkili Girişi</button>

            <div className="login-links">
              <p>
                <button
                  type="button"
                  className="link-button"
                  onClick={toggleLoginForm}
                >
                  Seçmen Girişine Dön
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;