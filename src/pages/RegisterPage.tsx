import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

const regions = [
  "Marmara", "Ege", "Akdeniz", "İç Anadolu", "Karadeniz", "Doğu Anadolu", "Güneydoğu Anadolu"
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tc: "",
    full_name: "",
    region: "Marmara",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/register", {
        tc: form.tc,
        full_name: form.full_name,
        region: form.region,
        password: form.password
      });
      navigate("/"); // login sayfasına yönlendir
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt başarısız.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <h1>E-Seçim'e Katılmak İçin Kayıt Olun</h1>
        <ul className="info-points">
          <li>Kayıt işlemi sadece 1 dakika sürer.</li>
          <li>Kimlik doğrulamanız güvenli bir şekilde gerçekleştirilir.</li>
          <li>Tüm bilgileriniz şifreli olarak saklanır.</li>
          <li>Oy verme işlemi için kayıt zorunludur.</li>
        </ul>
      </div>

      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Kayıt Ol</h2>

          <label>T.C. Kimlik No</label>
          <input
            type="text"
            name="tc"
            value={form.tc}
            onChange={handleChange}
            maxLength={11}
            required
          />

          <label>Ad Soyad</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <label>Bölge</label>
          <select name="region" value={form.region} onChange={handleChange}>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <label>Şifre Oluştur</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Şifreyi Onayla</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">Kayıt Ol</button>

          <div className="register-links">
            <p>
              Zaten bir hesabınız var mı? <Link to="/">Giriş Yap</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
