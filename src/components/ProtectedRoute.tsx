import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProtectedRoute.css"; // Stil dosyası eklenecek

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({
  redirectPath = "/login",
  adminOnly = false,
  children,
}: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage(
          "Oturum açmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz..."
        );
        setIsAuthorized(false);
        setIsLoading(false);
        setShowMessage(true);
        return;
      }

      try {
        // Admin sayfaları için admin yetkisi kontrolü
        if (adminOnly) {
          await axios.get("http://127.0.0.1:8000/admin/verify", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // Normal kullanıcı token doğrulaması
          // Verify endpoint olmadığı için candidates endpoint'i ile doğrulama yapıyoruz
          await axios.get("http://127.0.0.1:8000/candidates", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Token doğrulama hatası:", error);
        localStorage.removeItem("token"); // Geçersiz token'ı sil

        if (adminOnly) {
          setMessage(
            "Bu sayfaya erişim için yetkili girişi yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz..."
          );
        } else {
          setMessage(
            "Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz..."
          );
        }

        setIsAuthorized(false);
        setShowMessage(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [adminOnly]);

  // Geri sayım ve yönlendirme için useEffect
  useEffect(() => {
    if (showMessage && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showMessage, countdown]);

  if (isLoading) {
    return (
      <div className="auth-message loading">
        <div className="message-box">
          <div className="spinner"></div>
          <h2>Yükleniyor...</h2>
          <p>Bilgileriniz doğrulanıyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (showMessage && countdown > 0) {
      return (
        <div className="auth-message unauthorized">
          <div className="message-box">
            <h2>Erişim Engellendi</h2>
            <p>{message}</p>
            <p className="countdown">
              {countdown} saniye içinde yönlendirileceksiniz...
            </p>
          </div>
        </div>
      );
    }

    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
