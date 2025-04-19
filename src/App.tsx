import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
// import VotePage from "./pages/VotePage";
// import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Diğer sayfalar hazır olunca eklenebilir */}
        {/* <Route path="/vote" element={<VotePage />} /> */}
        {/* <Route path="/results" element={<ResultsPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
