import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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

interface LoginForm {
  tc: string;
  region: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    tc: "",
    region: "Marmara",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/login", form);
      const { access_token } = response.data;

      localStorage.setItem("token", access_token);
      navigate("/vote");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Giriş başarısız");
    }
  };


  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Giriş Yap</h2>

        <label htmlFor="tc">T.C. Kimlik No</label>
        <input
          type="text"
          name="tc"
          id="tc"
          maxLength={11}
          value={form.tc}
          onChange={handleChange}
          required
        />

        <label htmlFor="region">Bölge</label>
        <select name="region" id="region" value={form.region} onChange={handleChange}>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label htmlFor="password">Şifre</label>
        <input
          type="password"
          name="password"
          id="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Giriş Yap</button>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          Hesabın yok mu?{" "}
          <Link to="/register" style={{ color: "#4f46e5", fontWeight: "500" }}>
            Kayıt Ol
          </Link>
        </p>
        <p style={{ textAlign: "center", fontSize: "14px" }}>Yetkili girişi için{" "}
        <Link to="/admin" style={{ color: "#4f46e5", fontWeight: "500" }}>
            Yetkili Girişi
          </Link>
          </p>
      </form>
    </div>
  );
};

export default LoginPage;
