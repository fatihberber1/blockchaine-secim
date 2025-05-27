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
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [tcError, setTcError] = useState<string | null>(null);

  const validateFullName = (name: string): boolean => {
    // En az 2 kelime (ad + soyad) veya daha fazla (örn: Ahmet Ali Yılmaz)
    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ]+(\s[a-zA-ZçÇğĞıİöÖşŞüÜ]+)+$/;
    return nameRegex.test(name.trim());
  };

  const validatePassword = (password: string): boolean => {
    // En az bir büyük harf, bir küçük harf ve bir sayı içermeli
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber && password.length >= 8;
  };

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

    if (name === "full_name") {
      setNameError(null);
      // Sadece harflere ve boşluğa izin ver
      const filteredValue = value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, "");
      // Birden fazla boşluğu tek boşluğa çevir
      const singleSpaceValue = filteredValue.replace(/\s+/g, " ");
      setForm({ ...form, [name]: singleSpaceValue });

      // Eğer değer varsa ve doğrulama başarısızsa hata göster
      if (singleSpaceValue.trim() && !validateFullName(singleSpaceValue)) {
        setNameError(
          "Lütfen en az ad ve soyad giriniz (örn: Ahmet Yılmaz, Ahmet Ali Yılmaz)"
        );
      }
    } else if (name === "tc") {
      setTcError(null);
      // TC kimlik numarası için sadece sayılara izin ver
      const filteredValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: filteredValue });

      // TC doğrulaması - sadece 11 haneli tam sayı varsa kontrol et
      if (filteredValue.length === 11 && !validateTC(filteredValue)) {
        setTcError("Geçersiz T.C. kimlik numarası");
      }
    } else if (name === "password") {
      setPasswordError(null);
      setForm({ ...form, [name]: value });

      // Şifre doğrulaması - sadece değer varsa kontrol et
      if (value && !validatePassword(value)) {
        setPasswordError(
          "Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir sayı içermelidir"
        );
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setPasswordError(null);
    setTcError(null);

    if (!validateTC(form.tc)) {
      setTcError("Geçersiz T.C. kimlik numarası");
      return;
    }

    if (!validateFullName(form.full_name)) {
      setNameError(
        "Lütfen en az ad ve soyad giriniz (örn: Ahmet Yılmaz, Ahmet Ali Yılmaz)"
      );
      return;
    }

    if (!validatePassword(form.password)) {
      setPasswordError(
        "Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir sayı içermelidir"
      );
      return;
    }

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
          {tcError && <p className="error">{tcError}</p>}

          <label>Ad Soyad</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Ad Soyad"
            required
          />
          {nameError && <p className="error">{nameError}</p>}

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
            placeholder="En az 8 karakter, büyük harf, küçük harf ve sayı"
            required
          />
          {passwordError && <p className="error">{passwordError}</p>}

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
