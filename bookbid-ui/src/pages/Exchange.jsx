import { useEffect, useState } from "react";
import api from "../api";
import "../styles/exchange.css";

export default function Exchange() {
  const [myTitles, setMyTitles] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await api.get("/exchange");
    if (data.ok) {
      setMyTitles(data.my_titles || []);
      setMyCards(data.my_cards || []);
      setBooks(data.books || []);
    }
  };
  useEffect(() => { load(); }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return load();
    const { data } = await api.get("/exchange/search", { params: { q } });
    if (data.ok) setBooks(data.books || []);
  };

  const sendRequest = async (requested_book, owner_email, offered_book) => {
    if (!offered_book) return alert("Pick a book to offer.");
    const { data } = await api.post("/exchange/request", {
      requested_book, owner_email, offered_book
    });
    if (data.ok) alert("Request sent!");
  };

  return (
    <div className="exchange">
      <h2 className="heading">Book Exchange</h2>

      <form onSubmit={search} className="search-row">
        <input
          className="input"
          placeholder="Ontology search by title"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <button className="btn">Search</button>
        <button type="button" className="btn ghost" onClick={load}>Reset</button>
      </form>

      {/* MY BOOKS */}
      <section className="section">
        <div className="section-head">
          <h3 style={{marginLeft:"40%"}}>Your Books</h3>
          <span className="count">{myCards.length}</span>
        </div>

        {myCards.length ? (
          <ul className="grid">
            {myCards.map((b) => (
              <li key={b.title} className="card">
                <img className="cover" src={b.img} alt={b.title} />
                <div className="content">
                  <div className="title" title={b.title}>{b.title}</div>
                  {b.author && <div className="meta">Author: {b.author}</div>}
                  {b.genre && (<div className="meta" title={b.genre}>Genre: {b.genre.length > 30 ? b.genre.slice(0, 27) + "..." : b.genre}</div>)}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="muted">You have no books yet.</p>}
      </section>

      {/* OTHER USERS */}
      <section className="section">
        <div className="section-head">
          <h3 style={{marginLeft:"37%"}}>Books from Other Users</h3>
          <span className="count">{books.length}</span>
        </div>

        {books.length ? (
          <ul className="grid">
            {books.map((b, i) => (
              <li key={`${b.user_email}-${b.book_title}-${i}`} className="card">
                <img className="cover" src={b.image_url} alt={b.book_title} />
                <div className="content">
                  <div className="title" title={b.book_title}>{b.book_title}</div>
                  <div className="meta">Owner: {b.user_name}{b.user_city ? ` (${b.user_city})` : ""}</div>
                  <div className="badge">Similarity { (Number(b.similarity || 0) * 100).toFixed(1) }%</div>
                </div>
                <div className="actions">
                  <select
                    id={`offer-${i}`}
                    className="select"
                    defaultValue=""
                    aria-label="Select a book to offer"
                  >
                    <option value="" disabled >Select your book</option>
                    {myTitles.map((t) => {
                      const short = t.length > 30 ? t.slice(0, 27) + "..." : t;
                      return (
                      <option key={t} value={t} title={t}>
                      {short}
                      </option>
                      );
                      })}
                  </select>
                  <button
                    className="btn"
                    onClick={() => {
                      const sel = document.getElementById(`offer-${i}`);
                      sendRequest(b.book_title, b.user_email, sel.value);
                    }}
                  >
                    Request
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="muted">No matches yet. Try Reset or another search.</p>}
      </section>
    </div>
  );
}
