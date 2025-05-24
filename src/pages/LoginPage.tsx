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
      setAdminError(err.response?.data?.detail || "Yönetici girişi başarısız.");
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
        <h1>Elektronik Seçim Sistemi Giriş Platformu</h1>
        <p>
          Güvenli blockchain teknolojisi ile desteklenen seçim sistemine giriş
          yapın. Kayıtlı değilseniz sistem kaydınızı tamamlayın.
        </p>

        <ul className="info-points">
          <li>
            Blockchain teknolojisi ile her oy şifreli olarak kayıt altına alınır
          </li>
          <li>Tüm veriler doğrulanabilir ve şeffaf bir şekilde izlenebilir</li>
          <li>Türkiye'nin tüm bölgelerinden güvenli erişim sağlanabilir</li>
          <li>Kimlik doğrulama T.C. Kimlik Numarası ile güvence altındadır</li>
          <li>Merkle ağacı teknolojisi ile veri bütünlüğü garanti edilir</li>
        </ul>
      </div>

      <div className="login-right">
        {!showAdminLogin ? (
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Seçmen Girişi</h2>

            <label>T.C. Kimlik Numarası</label>
            <input
              type="text"
              name="tc"
              value={form.tc}
              onChange={handleChange}
              maxLength={11}
              placeholder="11 haneli T.C. kimlik numaranız"
              required
            />

            <label>Bölge Seçimi</label>
            <select name="region" value={form.region} onChange={handleChange}>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label>Güvenlik Şifresi</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Kayıt sırasında oluşturduğunuz şifre"
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit">Sisteme Giriş Yap</button>

            <div className="login-links">
              <p>
                Kayıtlı değil misiniz?{" "}
                <Link to="/register">Seçmen Kaydı Yapın</Link>
              </p>
              <p>
                <button
                  type="button"
                  className="link-button"
                  onClick={toggleLoginForm}
                >
                  Yönetici Girişi
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminSubmit} className="login-form admin-form">
            <h2>Yönetici Girişi</h2>

            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={adminForm.username}
              onChange={handleAdminChange}
              placeholder="Yönetici kullanıcı adınız"
              required
            />

            <label>Yönetici Şifresi</label>
            <input
              type="password"
              name="password"
              value={adminForm.password}
              onChange={handleAdminChange}
              placeholder="Yönetici şifreniz"
              required
            />

            {adminError && <p className="error">{adminError}</p>}

            <button type="submit">Yönetici Paneline Giriş</button>

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
