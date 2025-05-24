import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

const regions = [
  "Marmara",
  "Ege",
  "Akdeniz",
  "İç Anadolu",
  "Karadeniz",
  "Doğu Anadolu",
  "Güneydoğu Anadolu",
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tc: "",
    full_name: "",
    region: "Marmara",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
        password: form.password,
      });
      navigate("/"); // login sayfasına yönlendir
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt başarısız.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <h1>Elektronik Seçim Sistemi Kayıt Platformu</h1>
        <ul className="info-points">
          <li>Güvenli blockchain teknolojisi ile şeffaf seçim süreci</li>
          <li>
            Kimlik doğrulama işlemleri güvenli protokollerle gerçekleştirilir
          </li>
          <li>Kişisel verileriniz şifreli olarak korunur</li>
          <li>Seçim sürecine katılım için kayıt işlemi zorunludur</li>
          <li>Merkle ağacı teknolojisi ile veri bütünlüğü sağlanır</li>
        </ul>
      </div>

      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Seçmen Kaydı</h2>

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

          <label>Ad Soyad</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Tam adınız ve soyadınız"
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
            placeholder="Güçlü bir şifre oluşturun"
            required
          />

          <label>Şifre Onayı</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Şifrenizi tekrar girin"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">Kayıt İşlemini Tamamla</button>

          <div className="register-links">
            <p>
              Mevcut hesabınız var mı? <Link to="/">Sisteme Giriş Yapın</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
