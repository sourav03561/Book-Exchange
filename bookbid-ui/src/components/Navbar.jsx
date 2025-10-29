import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/navbar.css";
import { FiRepeat, FiBook, FiInbox,FiUser } from "react-icons/fi";

export default function Navbar({ me, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="nb">
      <div className="nb__inner">
        {/* Brand / Logo */}
        <Link to="/exchange" className="nb__brand">
          <span className="nb__logo">📚</span>
          <span className="nb__title">BookBid</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nb__nav">
        <NavLink to="/exchange" className={({isActive}) => `nb__link ${isActive ? "is-active" : ""}`}>
            <FiRepeat className="nb__icon" /> Exchange
        </NavLink>
        <NavLink to="/books" className={({isActive}) => `nb__link ${isActive ? "is-active" : ""}`}>
            <FiBook className="nb__icon" /> My Books
        </NavLink>
        <NavLink to="/requests" className={({isActive}) => `nb__link ${isActive ? "is-active" : ""}`}>
            <FiInbox className="nb__icon" /> Requests
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `nb__link ${isActive ? "is-active" : ""}`}>
            <FiUser className="nb__icon" /> Profile
        </NavLink>
        </nav>


        {/* Right side */}
        <div className="nb__right">
          {me ? (
            <div className="nb__user">
              <button
                className="nb__userbtn"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                title={me.name || me.email}
              >
                <div className="nb__avatar">{(me.name || me.email || "U").slice(0,1).toUpperCase()}</div>
                <span className="nb__username">{me.name || me.email}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" className={`nb__chev ${open ? "up" : ""}`}><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
              </button>

              {open && (
                <div className="nb__menu" role="menu">
                  <button className="nb__menuitem" onClick={() => setOpen(false)}>
                    <Link to="/exchange">Dashboard</Link>
                  </button>
                  <button className="nb__menuitem" onClick={() => setOpen(false)}>
                    <Link to="/books">My Books</Link>
                  </button>
                  <hr className="nb__divider" />
                  <button className="nb__menuitem danger" onClick={onLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="nb__auth">
              <Link to="/login" className="nb__btn ghost">Login</Link>
              <Link to="/register" className="nb__btn primary">Register</Link>
            </div>
          )}

          {/* Hamburger (mobile) */}
          <button className="nb__hamburger" aria-label="Open menu" onClick={() => setOpen(v => !v)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`nb__drawer ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <nav className="nb__drawerPanel" onClick={e => e.stopPropagation()}>
          <NavLink to="/exchange" className={({isActive}) => `nb__dlink ${isActive ? "is-active" : ""}`} onClick={() => setOpen(false)}>Exchange</NavLink>
          <NavLink to="/books"    className={({isActive}) => `nb__dlink ${isActive ? "is-active" : ""}`} onClick={() => setOpen(false)}>My Books</NavLink>
          <NavLink to="/requests" className={({isActive}) => `nb__dlink ${isActive ? "is-active" : ""}`} onClick={() => setOpen(false)}>Requests</NavLink>
          <div className="nb__dsep"/>
          {me ? (
            <>
              <div className="nb__duser">
                <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
                {me.name || me.email}
                </Link>
              </div>
              <button className="nb__dlogout" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <div className="nb__dauth">
              <Link to="/login" className="nb__daction">Login</Link>
              <Link to="/register" className="nb__daction primary">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
