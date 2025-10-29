import { useState } from "react";
import api from "../api";
import "../styles/auth.css";   // <-- import css file

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/login", { email, password });
      if (!data.ok) throw new Error(data.error || "Login failed");
      onLogin(data.user);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={submit} className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Please log in to continue</p>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-btn">Login</button>

        {err && <p className="auth-error">{err}</p>}
      </form>
    </div>
  );
}
