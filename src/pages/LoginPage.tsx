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
  const [tcError, setTcError] = useState<string | null>(null);

  const validateTC = (tc: string): boolean => {
    // TC kimlik numarası 11 haneli olmalı ve 0 ile başlamamalı
    if (tc.length !== 11 || tc[0] === "0") {
      return false;
    }

    const digits = tc.split("").map(Number);

    // 1, 3, 5, 7, 9. hanelerin toplamı
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];

    // 2, 4, 6, 8. hanelerin toplamı
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    // 10. hane kontrolü: (oddSum * 7 - evenSum) % 10 = 10. hane
    const tenthDigit = (oddSum * 7 - evenSum) % 10;
    if (tenthDigit !== digits[9]) {
      return false;
    }

    // 11. hane kontrolü: (ilk 10 hanenin toplamı) % 10 = 11. hane
    const first10Sum = digits
      .slice(0, 10)
      .reduce((sum, digit) => sum + digit, 0);
    const eleventhDigit = first10Sum % 10;
    if (eleventhDigit !== digits[10]) {
      return false;
    }

    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tc") {
      setTcError(null);
      // TC kimlik numarası için sadece sayılara izin ver
      const filteredValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: filteredValue });

      // TC doğrulaması - sadece 11 haneli tam sayı varsa kontrol et
      if (filteredValue.length === 11 && !validateTC(filteredValue)) {
        setTcError("Geçersiz T.C. kimlik numarası");
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTcError(null);

    if (!validateTC(form.tc)) {
      setTcError("Geçersiz T.C. kimlik numarası");
      return;
    }

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
    setTcError(null);
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
              placeholder="T.C. kimlik numaranız"
              required
            />
            {tcError && <p className="error">{tcError}</p>}

            <label>Bölge Seçimi</label>
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
              placeholder="Şifreniz"
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
