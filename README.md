<img width="1264" height="598" alt="Image" src="https://github.com/user-attachments/assets/6faf5689-f350-4c46-8914-43ad88fa12de" />

<img width="1264" height="681" alt="Image" src="https://github.com/user-attachments/assets/974b670b-a8a0-4731-9376-3f918dce9626" />

<img width="1264" height="681" alt="Image" src="https://github.com/user-attachments/assets/e77390d6-2658-4ca5-942b-69b07d6a978e" />

<img width="1264" height="601" alt="Image" src="https://github.com/user-attachments/assets/0f8212db-9597-423f-aaf9-b5a7b8b79b66" />


https://github.com/user-attachments/assets/2badd3b0-5288-4c75-9017-f18ed64a26ac

# 📚 Book Exchange Platform (BookBid)

![GitHub repo size](https://img.shields.io/github/repo-size/sourav03561/Book-Exchange)
![GitHub contributors](https://img.shields.io/github/contributors/sourav03561/Book-Exchange)
![GitHub stars](https://img.shields.io/github/stars/sourav03561/Book-Exchange?style=social)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**BookBid** is a web application that connects book lovers and facilitates book exchanges. It provides an intuitive platform where users can list their books, browse others’ collections, send exchange requests, and receive personalized recommendations.

---

## 🚀 Features

* 📖 **Book Listings** – Add, view, and manage books easily.
* 🔍 **Search & Filter** – Find books by title, author, or genre.
* 🔄 **Exchange Requests** – Initiate and manage book exchange requests.
* 🔔 **Notification System** – Stay updated with real-time alerts.
* 🤖 **Recommendations** – Personalized suggestions using TF-IDF.
* 💻 **Modern UI** – Built with React for speed and responsiveness.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), JavaScript, CSS Modules/Tailwind
* **Backend**: Python (Flask)
* **Database**: Firebase Realtime Database
* **Machine Learning**: Pandas, Scikit-learn (TF-IDF)

---

## 📂 Project Structure

```
Book-Exchange/
├── bookbid-ui/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/              # Exchange, Login, MyBooks, Profile, etc.
│   │   ├── styles/
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── app.py                      # Flask backend main app
├── requirements.txt            # Python dependencies
├── books.owl                   # Ontology file
├── random_books_df.csv         # Sample dataset
├── tfidf_matrix.pkl            # Precomputed TF-IDF matrix
├── tfidf_vectorizer.pkl        # Vectorizer model
└── README.md                   # Project documentation
```

---

## 🔧 Prerequisites

* Node.js **18+**
* Python **3.10+**
* Firebase project with Realtime Database enabled

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sourav03561/Book-Exchange.git
cd Book-Exchange
```

### 2. Backend (Flask)

```bash
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` in root with:

```
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=your-secret
CORS_ORIGINS=http://localhost:5173
FIREBASE_API_KEY=your_api_key
FIREBASE_DB_URL=https://your-project-id.firebaseio.com
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```

Run the server:

```bash
python app.py
# Backend runs at http://127.0.0.1:5000
```

### 3. Frontend (React)

```bash
cd bookbid-ui
npm install
```

Create `.env` in `bookbid-ui/`:

```
VITE_API_BASE_URL=http://127.0.0.1:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_DB_URL=https://your-project-id.firebaseio.com
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```

Start the frontend:

```bash
npm run dev
# App runs at http://127.0.0.1:5173
```

---

## 🧪 Usage

* **Home** – See featured books & requests
* **Browse** – Search by title, author, genre
* **Add Book** – List your book for exchange
* **Requests** – Manage incoming & outgoing exchange requests
* **Profile** – View your listings & notifications

---

## 🔌 API Endpoints (Examples)

* `GET /api/books` – Fetch all books
* `POST /api/books` – Add a new book
* `GET /api/books/:id` – Get book details
* `POST /api/requests` – Create exchange request
* `GET /api/recommendations?bookId=...` – Get similar books

---

## 🤖 Recommendation System

* Uses **TF-IDF vectorization** with cosine similarity
* Precomputed assets: `tfidf_vectorizer.pkl`, `tfidf_matrix.pkl`
* Update these files if dataset (`random_books_df.csv`) changes

---

## 📸 Screenshots

Add screenshots of the UI here:

```
![Home](bookbid-ui/public/screenshots/home.png)
![Browse](bookbid-ui/public/screenshots/browse.png)
![Requests](bookbid-ui/public/screenshots/requests.png)
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git c
