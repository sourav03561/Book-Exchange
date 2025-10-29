import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Exchange from "./pages/Exchange.jsx";
import MyBooks from "./pages/MyBooks.jsx";
import Requests from "./pages/Requests.jsx";
import Navbar from "./components/Navbar.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const [me, setMe] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/me");
      setMe(data.user || null);
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return null;

  const logout = async () => {
    await api.post("/logout");
    setMe(null);
  };

  return (
    <div>
      <Navbar me={me} onLogout={logout} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/exchange" />} />
          <Route path="/login" element={me ? <Navigate to="/exchange" /> : <Login onLogin={setMe} />} />
          <Route path="/register" element={me ? <Navigate to="/exchange" /> : <Register />} />
          <Route path="/exchange" element={me ? <Exchange /> : <Navigate to="/login" />} />
          <Route path="/books" element={me ? <MyBooks /> : <Navigate to="/login" />} />
          <Route path="/requests" element={me ? <Requests /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/profile" element={me ? <Profile /> : <Navigate to="/login" />} />

        </Routes>
      </div>
    </div>
  );
}
