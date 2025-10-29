from flask import Flask, request, jsonify, session
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from werkzeug.security import generate_password_hash, check_password_hash
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
from rdflib import Graph, Namespace, URIRef, RDFS
from flask_cors import CORS
from google.api_core.exceptions import FailedPrecondition
from google.cloud.firestore_v1 import FieldFilter


# --- Initialize Firebase ---
cred = credentials.Certificate("service.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Initialize Flask ---
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your_secret_key")

# Enable CORS for React frontend
from flask_cors import CORS

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
            ]
        }
    },
)


# --- Load book dataset ---
df_books = pd.read_csv("random_books_df.csv")
books_list = df_books[["title", "author", "genre", "img"]].to_dict(orient="records")

# --- Helpers ---
def get_similarities_with_target(target_book, book_list):
    """Compute cosine similarity of target book with other books."""
    random_books_df = pd.read_csv("random_books_df.csv")
    tfidf_vectorizer = joblib.load("tfidf_vectorizer.pkl")
    tfidf_matrix = joblib.load("tfidf_matrix.pkl")

    try:
        target_index = random_books_df[random_books_df["title"] == target_book].index[0]
    except IndexError:
        return {}

    target_vector = tfidf_matrix[target_index]

    scores = {}
    for book in book_list:
        try:
            book_index = random_books_df[random_books_df["title"] == book].index[0]
            book_vector = tfidf_matrix[book_index]
            sim = cosine_similarity(target_vector, book_vector.reshape(1, -1))[0][0]
            scores[book] = float(sim)
        except IndexError:
            scores[book] = 0.0
    return scores

def _get_user_doc_by_email(email: str):
    it = db.collection("users").where("email", "==", email).stream()
    doc = next(it, None)
    return doc  # can be None

def _public_user_payload(u: dict) -> dict:
    """Only send non-sensitive fields to the client."""
    return {
        "name":   u.get("name", ""),
        "email":  u.get("email", ""),
        "city":   u.get("city", ""),
        "address":u.get("address", ""),
        "phone":  u.get("phone", ""),
        "avatar_url": u.get("avatar_url", ""),  # optional
    }
def normalize_titles(raw_list):
    """Turn user.books into a list of titles (strings)."""
    return [
        (b.get("title") if isinstance(b, dict) else str(b)).strip()
        for b in (raw_list or [])
        if b
    ]
# top of app.py
import ast

def _coerce_title(val: object) -> str:
    """Return a clean title from val which may be a str, dict, or python-repr string."""
    if isinstance(val, dict):
        return (val.get("title") or "").strip()
    if isinstance(val, str):
        s = val.strip()
        if s.startswith("{") and s.endswith("}"):
            try:
                d = ast.literal_eval(s)  # safe parse python-literal
                if isinstance(d, dict):
                    return (str(d.get("title") or "")).strip()
            except Exception:
                pass
        return s
    return ""

def get_book_meta(title):
    meta = next((b for b in books_list if b["title"] == title), {})
    return {"title": title, "author": meta.get("author"), "image": meta.get("img")}

# ---------- AUTH ----------
@app.post("/api/register")
def api_register():
    data = request.json or {}
    required = ["name", "email", "city", "address", "phone", "password", "selected_books"]
    if not all(k in data for k in required):
        return jsonify({"ok": False, "error": "Missing fields"}), 400

    hashed = generate_password_hash(data["password"])
    db.collection("users").add({
        "name": data["name"],
        "email": data["email"],
        "city": data["city"],
        "address": data["address"],
        "phone": data["phone"],
        "password": hashed,
        "books": data["selected_books"],
    })
    return jsonify({"ok": True})


@app.post("/api/login")
def api_login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"ok": False, "error": "Missing credentials"}), 400

    users_ref = db.collection("users").where("email", "==", email).stream()
    doc = next(users_ref, None)
    if not doc:
        return jsonify({"ok": False, "error": "Invalid email or password"}), 400

    user = doc.to_dict()
    if not check_password_hash(user["password"], password):
        return jsonify({"ok": False, "error": "Invalid email or password"}), 400

    session["user"] = {"email": user["email"], "name": user["name"]}
    return jsonify({"ok": True, "user": session["user"]})


@app.post("/api/logout")
def api_logout():
    session.pop("user", None)
    return jsonify({"ok": True})


@app.get("/api/me")
def api_me():
    if "user" not in session:
        return jsonify({"ok": False, "user": None}), 200
    return jsonify({"ok": True, "user": session["user"]})


# ---------- BOOKS CRUD ----------
@app.get("/api/books/me")
def api_my_books():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    email = session["user"]["email"]
    query = db.collection("users").where("email", "==", email).stream()
    doc = next(query, None)
    if not doc:
        return jsonify({"ok": True, "books": []})

    user = doc.to_dict()
    titles = normalize_titles(user.get("books", []))

    # enrich cards
    cards = []
    for t in titles:
        meta = next((b for b in books_list if b["title"] == t), {})
        cards.append({
            "title": t,
            "img": meta.get("img", ""),
            "author": meta.get("author", ""),
            "genre": meta.get("genre", "")
        })

    return jsonify({"ok": True, "titles": titles, "cards": cards})


@app.post("/api/books/me/add")
def api_add_book():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    title = (request.json or {}).get("title", "").strip()
    if not title:
        return jsonify({"ok": False, "error": "Missing title"}), 400

    email = session["user"]["email"]
    q = db.collection("users").where("email", "==", email).stream()
    user_doc = next(q, None)
    if not user_doc:
        return jsonify({"ok": False, "error": "User not found"}), 404

    data = user_doc.to_dict()
    books = normalize_titles(data.get("books", []))
    if title not in books:
        books.append(title)
        db.collection("users").document(user_doc.id).update({"books": books})

    return jsonify({"ok": True, "books": books})


@app.post("/api/books/me/remove")
def api_remove_book():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    title = (request.json or {}).get("title", "").strip()
    email = session["user"]["email"]

    q = db.collection("users").where("email", "==", email).stream()
    user_doc = next(q, None)
    if not user_doc:
        return jsonify({"ok": False, "error": "User not found"}), 404

    data = user_doc.to_dict()
    books = normalize_titles(data.get("books", []))
    if title in books:
        books.remove(title)
        db.collection("users").document(user_doc.id).update({"books": books})

    return jsonify({"ok": True, "books": books})


# ---------- EXCHANGE ----------
@app.get("/api/exchange")
def api_exchange_list():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    me = session["user"]["email"]

    # My books
    me_q = db.collection("users").where("email", "==", me).stream()
    me_doc = next(me_q, None)
    my_titles = normalize_titles(me_doc.to_dict().get("books", []) if me_doc else [])

    # Other users' books
    items = []
    for doc in db.collection("users").stream():
        u = doc.to_dict() or {}
        if u.get("email") == me:
            continue
        for b in normalize_titles(u.get("books", [])):
            img = next((x["img"] for x in books_list if x["title"] == b),
                       "default_image_url.jpg")
            items.append({
                "user_name": u.get("name", ""),
                "user_email": u.get("email", ""),
                "user_city": u.get("city", ""),
                "book_title": b,
                "image_url": img
            })

    # Similarity scores
    candidate_titles = list({x["book_title"] for x in items})
    scores_agg = {t: 0.0 for t in candidate_titles}
    for t in my_titles:
        scores = get_similarities_with_target(t, candidate_titles) or {}
        for cand in candidate_titles:
            scores_agg[cand] = max(scores_agg[cand], float(scores.get(cand, 0.0)))

    for item in items:
        item["similarity"] = scores_agg.get(item["book_title"], 0.0)

    items.sort(key=lambda x: x["similarity"], reverse=True)

    # My cards
    my_cards = []
    for t in my_titles:
        meta = next((b for b in books_list if b["title"] == t), {})
        my_cards.append({
            "title": t,
            "img": meta.get("img", ""),
            "author": meta.get("author", ""),
            "genre": meta.get("genre", "")
        })

    return jsonify({"ok": True, "my_titles": my_titles, "my_cards": my_cards, "books": items})


@app.get("/api/exchange/search")
def api_exchange_search():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"ok": True, "books": []})

    me = session["user"]["email"]
    items = []
    for doc in db.collection("users").stream():
        u = doc.to_dict() or {}
        if u.get("email") == me:
            continue
        for b in normalize_titles(u.get("books", [])):
            img = next((x["img"] for x in books_list if x["title"] == b),
                       "default_image_url.jpg")
            items.append({
                "user_name": u.get("name", ""),
                "user_email": u.get("email", ""),
                "user_city": u.get("city", ""),
                "book_title": b,
                "image_url": img
            })

    try:
        g = Graph()
        g.parse("books.owl", format="xml")
        BOOK_NS = Namespace("http://example.org/book/")
        book_uri = BOOK_NS[q.replace(" ", "_")]

        authors = set(g.objects(book_uri, URIRef("http://example.org/hasAuthor")))
        genres = set(g.objects(book_uri, URIRef("http://example.org/hasGenre")))

        same_author, same_genre = set(), set()
        for a in authors:
            same_author.update(g.subjects(URIRef("http://example.org/hasAuthor"), a))
        for ge in genres:
            same_genre.update(g.subjects(URIRef("http://example.org/hasGenre"), ge))

        def label(u):
            return str(g.value(u, RDFS.label) or str(u).rsplit("/", 1)[-1].replace("_", " "))

        titles_keep = set([label(x) for x in same_author | same_genre])
        filtered = [i for i in items if i["book_title"] in titles_keep]

        return jsonify({"ok": True, "books": filtered})
    except Exception:
        return jsonify({"ok": True, "books": []})

@app.get("/api/profile")
def api_profile_get():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    me_email = session["user"]["email"]
    doc = _get_user_doc_by_email(me_email)
    if not doc:
        return jsonify({"ok": False, "error": "User not found"}), 404

    data = doc.to_dict() or {}
    return jsonify({"ok": True, "user": _public_user_payload(data)})

@app.patch("/api/profile")
def api_profile_patch():
    """
    Accepts partial updates. Body can include any of:
    name, city, address, phone, avatar_url,
    current_password, new_password
    """
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    payload = request.json or {}
    me_email = session["user"]["email"]
    doc = _get_user_doc_by_email(me_email)
    if not doc:
        return jsonify({"ok": False, "error": "User not found"}), 404

    data = doc.to_dict() or {}
    updates = {}

    # basic fields
    for k in ["name", "city", "address", "phone", "avatar_url"]:
        if k in payload:
            v = (payload.get(k) or "").strip()
            updates[k] = v

    # password change (optional)
    cur = payload.get("current_password")
    new = payload.get("new_password")
    if cur or new:
        if not (cur and new):
            return jsonify({"ok": False, "error": "Both current_password and new_password are required"}), 400
        if not check_password_hash(data.get("password", ""), cur):
            return jsonify({"ok": False, "error": "Current password is incorrect"}), 400
        updates["password"] = generate_password_hash(new)

    if not updates:
        return jsonify({"ok": True, "user": _public_user_payload(data)})  # nothing to change

    db.collection("users").document(doc.id).update(updates)

    # refresh session display name if changed
    if "name" in updates:
        session["user"]["name"] = updates["name"]

    # return fresh
    new_doc = db.collection("users").document(doc.id).get()
    return jsonify({"ok": True, "user": _public_user_payload(new_doc.to_dict() or {})})










# ---------- EXCHANGE REQUESTS ----------
@app.post("/api/exchange/request")
def api_send_request():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    data = request.json or {}
    requested_book = data.get("requested_book", "")
    owner_email = data.get("owner_email", "")
    offered_book = data.get("offered_book", "")

    if not requested_book or not owner_email or not offered_book:
        return jsonify({"ok": False, "error": "Missing fields"}), 400

    me = session["user"]["email"]
    db.collection("exchange_requests").add({
        "from_user": me,
        "to_user": owner_email,
        "requested_book": requested_book,
        "offered_book": offered_book,
        "status": "pending",
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    return jsonify({"ok": True})


@app.get("/api/requests")
def api_requests():
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    me = session["user"]["email"]
    coll = db.collection("exchange_requests")

    in_base  = coll.where(filter=FieldFilter("to_user",   "==", me))
    out_base = coll.where(filter=FieldFilter("from_user", "==", me))

    try:
        in_docs  = list(in_base.order_by("timestamp", direction=firestore.Query.DESCENDING).stream())
    except FailedPrecondition:
        in_docs  = list(in_base.stream())
    try:
        out_docs = list(out_base.order_by("timestamp", direction=firestore.Query.DESCENDING).stream())
    except FailedPrecondition:
        out_docs = list(out_base.stream())

    incoming = [{**d.to_dict(), "id": d.id} for d in in_docs]
    outgoing = [{**d.to_dict(), "id": d.id} for d in out_docs]

    def get_book_meta(title):
        meta = next((b for b in books_list if b.get("title") == title), {})
        return {"title": title, "author": meta.get("author", ""), "image": meta.get("img", "")}

    # 🔑 normalize first, then enrich
    for r in incoming + outgoing:
        rb = _coerce_title(r.get("requested_book", ""))
        ob = _coerce_title(r.get("offered_book", ""))
        r["requested_book"] = rb
        r["offered_book"]   = ob
        r["requested_book_details"] = get_book_meta(rb)
        r["offered_book_details"]   = get_book_meta(ob)

    return jsonify({"ok": True, "incoming": incoming, "outgoing": outgoing})


@app.post("/api/requests/<req_id>/accept")
def api_accept(req_id):
    if "user" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    me = session["user"]["email"]
    ref = db.collection("exchange_requests").document(req_id)
    doc = ref.get()

    if not doc.exists:
        return jsonify({"ok": False, "error": "Not found"}), 404

    data = doc.to_dict()
    if data["to_user"] != me:
        return jsonify({"ok": False, "error": "Forbidden"}), 403

    ref.update({"status": "accepted"})

    # Swap books between users
    users = db.collection("users")

    # from_user
    fu_it = users.where("email", "==", data["from_user"]).stream()
    fu_doc = next(fu_it, None)
    if fu_doc:
        fu = fu_doc.to_dict()
        fu_books = normalize_titles(fu.get("books", []))
        if data["offered_book"] in fu_books:
            fu_books.remove(data["offered_book"])
            fu_books.append(data["requested_book"])
            users.document(fu_doc.id).update({"books": fu_books})

    # to_user (me)
    tu_it = users.where("email", "==", me).stream()
    tu_doc = next(tu_it, None)
    if tu_doc:
        tu = tu_doc.to_dict()
        tu_books = normalize_titles(tu.get("books", []))
        if data["requested_book"] in tu_books:
            tu_books.remove(data["requested_book"])
            tu_books.append(data["offered_book"])
            users.document(tu_doc.id).update({"books": tu_books})

    return jsonify({"ok": True})


# ---------- ENTRYPOINT ----------
if __name__ == "__main__":
    app.run(debug=True)
