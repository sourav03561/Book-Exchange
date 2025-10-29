import { useEffect, useState } from "react";
import api from "../api";
import "../styles/profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    const { data } = await api.get("/profile");
    if (data.ok) setUser(data.user);
    else setMsg(data.error || "Failed to load profile");
  };

  useEffect(() => { load(); }, []);

  const [form, setForm] = useState({
    name: "", city: "", address: "", phone: "", avatar_url: "",
    current_password: "", new_password: ""
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || "",
        city: user.city || "",
        address: user.address || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || ""
      }));
    }
  }, [user]);

  const save = async () => {
    setBusy(true); setMsg("");
    const body = {
      name: form.name,
      city: form.city,
      address: form.address,
      phone: form.phone,
      avatar_url: form.avatar_url,
    };
    // only send password fields when filled
    if (form.current_password || form.new_password) {
      body.current_password = form.current_password;
      body.new_password = form.new_password;
    }
    const { data } = await api.patch("/profile", body);
    setBusy(false);
    if (!data.ok) { setMsg(data.error || "Update failed"); return; }
    setUser(data.user);
    setEdit(false);
    setForm(f => ({ ...f, current_password: "", new_password: "" }));
    setMsg("Saved!");
  };

  if (!user) return <div style={{padding:16}}>Loading...</div>;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Profile</h2>

      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,.04)"
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <img
            src={user.avatar_url || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(user.name || user.email)}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{user.email}</div>
          </div>
          {!edit ? (
            <button onClick={()=>setEdit(true)} className="btn" style={{ padding: "8px 12px" }}>Edit</button>
          ) : (
            <div style={{ display:"flex", gap:8 }}>
              <button disabled={busy} onClick={save} className="btn" style={{ padding: "8px 12px" }}>
                {busy ? "Saving..." : "Save"}
              </button>
              <button disabled={busy} onClick={()=>{ setEdit(false); setMsg(""); load(); }} className="btn pill red">
                Cancel
              </button>
            </div>
          )}
        </div>

        {!edit ? (
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 8 }}>
            <div style={{ color:"#6b7280" }}>City</div><div>{user.city || "-"}</div>
            <div style={{ color:"#6b7280" }}>Address</div><div>{user.address || "-"}</div>
            <div style={{ color:"#6b7280" }}>Phone</div><div>{user.phone || "-"}</div>
          </div>
        ) : (
<div className="profile-form">
  <input
    className="profile-input"
    placeholder="Name"
    value={form.name}
    onChange={e => setForm({ ...form, name: e.target.value })}
  />
  <input
    className="profile-input"
    placeholder="City"
    value={form.city}
    onChange={e => setForm({ ...form, city: e.target.value })}
  />
  <input
    className="profile-input full"
    placeholder="Address"
    value={form.address}
    onChange={e => setForm({ ...form, address: e.target.value })}
  />
  <input
    className="profile-input"
    placeholder="Phone"
    value={form.phone}
    onChange={e => setForm({ ...form, phone: e.target.value })}
  />
  <input
    className="profile-input"
    placeholder="Avatar URL (optional)"
    value={form.avatar_url}
    onChange={e => setForm({ ...form, avatar_url: e.target.value })}
  />
  <input
    className="profile-input full"
    type="password"
    placeholder="Current password (only if changing)"
    value={form.current_password}
    onChange={e => setForm({ ...form, current_password: e.target.value })}
  />
  <input
    className="profile-input full"
    type="password"
    placeholder="New password"
    value={form.new_password}
    onChange={e => setForm({ ...form, new_password: e.target.value })}
  />
</div>

        )}

        {msg && <div style={{ marginTop: 12, color: msg==="Saved!" ? "#16a34a" : "crimson" }}>{msg}</div>}
      </div>
    </div>
  );
}
