import { useState } from "react";
import api from "../api";
import "../styles/auth.css";   // reuse the same styles as Login

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", city: "", address: "", phone: "", password: "",
    selected_books: []
  });
  const [book, setBook] = useState("");

  const addSel = () => {
    if (book && !form.selected_books.includes(book)) {
      setForm({ ...form, selected_books: [...form.selected_books, book] });
      setBook("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/register", form);
    if (data.ok) alert("Registered! Please login.");
  };

  return (
    <div className="auth-page">
      <form onSubmit={submit} className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Sign up to get started</p>

        {["name","email","city","address","phone","password"].map((k)=>(
          <input
            key={k}
            className="auth-input"
            type={k==="password" ? "password" : "text"}
            placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={(e)=>setForm({ ...form, [k]: e.target.value })}
            required
          />
        ))}

        {/* Add books */}
        <div className="auth-books">
          <div className="auth-books-row">
            <input
              className="auth-input"
              placeholder="Add initial book title"
              value={book}
              onChange={(e)=>setBook(e.target.value)}
            />
            <button type="button" className="auth-btn ghost" onClick={addSel}>
              Add
            </button>
          </div>
          {form.selected_books.length > 0 && (
            <div className="auth-books-list">
              Selected: {form.selected_books.join(", ")}
            </div>
          )}
        </div>

        <button type="submit" className="auth-btn">Create Account</button>
      </form>
    </div>
  );
}
