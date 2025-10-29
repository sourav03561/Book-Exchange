# 📚 Book Exchange Platform

**BookBid** is a web application that facilitates book exchanges among users. Whether you're looking to give away old books or discover new reads, BookBid connects you with a community of book lovers.

---

## 🚀 Features

* **Clean, Responsive UI (React)** – Modern, fast, and accessible interface.
* **Book Listings** – Add, view, and manage books available for exchange.
* **Search & Filter** – Find books by title, author, or genre.
* **Exchange Requests** – Initiate and manage exchange requests with other users.
* **Notifications** – Real‑time updates about your exchange activity (frontend hooks ready; backend events optional).
* **Personalized Recommendations** – TF‑IDF–based recommender powered by scikit‑learn.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), JavaScript/TypeScript, CSS Modules/Tailwind (your choice)
* **Backend**: Python (Flask)
* **Database**: Firebase Realtime Database
* **ML/Recs**: Pandas, scikit‑learn (TF‑IDF)

> Previously the app used Jinja templates. The UI has been migrated to a decoupled React SPA that talks to the Flask API.

---

## 🗂️ Project Structure

```
BookBid/
├── client/                     # React app (Vite)
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── main.jsx / main.tsx
│   │   ├── App.jsx / App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/           # API client, Firebase utils
│   └── vite.config.js
├── server/                     # Flask API
│   ├── app.py                  # Main application file
│   ├── requirements.txt        # Python dependencies
│   ├── recommender/
│   │   ├── tfidf_matrix.pkl
│   │   └── tfidf_vectorizer.pkl
│   ├── data/
│   │   └── random_books_df.csv
│   ├── ontology/
│   │   └── books.owl
│   └── .env.example            # Flask env sample
├── README.md
└── LICENSE
```

---

## 🔧 Prerequisites

* Node.js 18+
* Python 3.10+
* Firebase project (Realtime Database)

---

## ⚙️ Setup

### 1) Clone the Repository

```bash
git clone https://github.com/sourav03561/BookBid.git
cd BookBid
```

### 2) Backend (Flask)

```bash
cd server
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` (or set environment variables) in `server/`:

```
FLASK_ENV=development
FLASK_APP=app.py
# Change the secret & CORS origins to your dev URL(s)
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Firebase (example keys)
FIREBASE_API_KEY=your_api_key
FIREBASE_DB_URL=https://your-project-id.firebaseio.com
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```

> **CORS**: If you see browser CORS errors, ensure `Flask-CORS` is installed and configured to allow your React dev URL. Example snippet in `app.py`:
>
> ```python
> from flask_cors import CORS
> app = Flask(__name__)
> CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
> ```

Run the API:

```bash
python app.py
# API default: http://127.0.0.1:5000
```

### 3) Frontend (React)

```bash
cd ../client
npm install
```

Create `.env` in `client/` for environment variables (Vite uses `VITE_` prefix):

```
VITE_API_BASE_URL=http://127.0.0.1:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_DB_URL=https://your-project-id.firebaseio.com
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```

Start the React dev server:

```bash
npm run dev
# UI: http://127.0.0.1:5173
```

---

## 🧪 Usage

* **Home** – Featured books and recent exchange requests.
* **Browse** – Search and filter by title/author/genre.
* **Add a Book** – List a book for exchange.
* **Requests** – Create and manage exchange requests.
* **Profile** – Manage your listings & notifications.

---

## 🔌 API Endpoints (Examples)

> Update paths to match your actual routes.

* `GET /api/books` – List books
* `POST /api/books` – Add a book
* `GET /api/books/:id` – Get book details
* `POST /api/requests` – Create an exchange request
* `GET /api/recommendations?bookId=...` – Similar books via TF‑IDF

---

## 🤖 Recommendations (TF‑IDF)

The backend loads `tfidf_vectorizer.pkl` and `tfidf_matrix.pkl` and uses cosine similarity to recommend books similar to a given input (by ID or metadata).

* Precompute with a notebook/script (optional) and persist as `.pkl` files.
* On updates to `random_books_df.csv`, regenerate the vectorizer/matrix.

---

## 🖼️ Screenshots

Add or update screenshots from the React UI here.

```
![Home](client/public/screenshots/home.png)
![Browse](client/public/screenshots/browse.png)
![Requests](client/public/screenshots/requests.png)
```

---

## 🧰 Development Tips

* **Proxy (optional):** You can set up a Vite proxy in `vite.config.js` to avoid CORS during dev.
* **Error Boundaries:** Wrap high‑risk components (network heavy) with error boundaries.
* **Services Layer:** Keep API calls in `src/services/api.js` and reuse across pages.
* **Env Safety:** Never commit real Firebase keys or `.env` files.

Example Vite proxy:

```js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  }
}
```

---

## 🤝 Contributing

1. **Fork** the repo
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Commit changes**: `git commit -m "feat: add my feature"`
4. **Push**: `git push origin feature/my-feature`
5. **Open a Pull Request**

Please follow conventional commits when possible.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

* Firebase for backend services
* scikit‑learn & pandas for the recommender
* Vite & React community
