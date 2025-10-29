import { useEffect, useState } from "react";
import api from "../api";
import "../styles/mybooks.css";

export default function MyBooks() {
  const [cards, setCards] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    const { data } = await api.get("/books/me");
    if (data.ok) setCards(data.cards || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const t = newTitle.trim();
    if (!t) return;
    const { data } = await api.post("/books/me/add", { title: t });
    if (data.ok) { setNewTitle(""); load(); }
  };

  const remove = async (title) => {
    const { data } = await api.post("/books/me/remove", { title });
    if (data.ok) load();
  };

  return (
    <div className="mybooks">
      <h2 className="heading">My Books</h2>

      <div className="input-row">
        <input
          className="input"
          placeholder="Add book by title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="btn" style={{marginLeft:8}} onClick={add}>Add</button>
      </div>

      <ul className="book-list">
        {cards.map((b) => (
          <li key={b.title} className="book-item">
            {b.img ? <img className="cover" src={b.img} alt={b.title} /> : <div className="cover" />}
            <div className="info">
              <div className="title">{b.title}</div>
              {b.author && <div className="meta">Author: {b.author}</div>}
              {b.genre &&  <div className="meta">Genre: {b.genre}</div>}
            </div>
            <div className="actions">
              <button className="btn pill red" onClick={() => remove(b.title)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
