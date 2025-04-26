import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

interface RegisterForm {
  tc: string;
  full_name: string;
  region: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    tc: "",
    full_name: "",
    region: "Marmara",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post("/api/register", form);
      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt başarısız");
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Kayıt Ol</h2>

        <label htmlFor="tc">T.C. Kimlik No</label>
        <input type="text" name="tc" id="tc" value={form.tc} onChange={handleChange} required maxLength={11} />

        <label htmlFor="full_name">Ad Soyad</label>
        <input type="text" name="full_name" id="full_name" value={form.full_name} onChange={handleChange} required />

        <label htmlFor="region">Bölge</label>
        <select name="region" id="region" value={form.region} onChange={handleChange}>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label htmlFor="password">Şifre</label>
        <input type="password" name="password" id="password" value={form.password} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default RegisterPage;
