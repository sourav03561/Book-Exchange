import { useEffect, useState } from "react";
import api from "../api";

function parseDetails(d) {
  // Accepts object or python-stringified dict and returns {title, author, image}
  if (!d) return { title: "Unknown", author: "", image: "" };
  if (typeof d === "object") return {
    title: d.title || "Unknown",
    author: d.author || "",
    image: d.image || d.img || ""
  };
  // d is a string (python repr). Try to coerce quotes and JSON.parse.
  try {
    const s = d
      .replace(/'/g, '"')
      .replace(/None/g, "null")
      .replace(/True/g, "true")
      .replace(/False/g, "false");
    const obj = JSON.parse(s);
    return {
      title: obj.title || "Unknown",
      author: obj.author || "",
      image: obj.image || obj.img || ""
    };
  } catch {
    return { title: String(d), author: "", image: "" };
  }
}

function RequestCard({ r, incomingList, busyId, onAccept, onReject, onCancel }) {
  const req = parseDetails(r.requested_book_details) || { title: r.requested_book };
  const off = parseDetails(r.offered_book_details)   || { title: r.offered_book };
  const pending = r.status === "pending";

  return (
    <li
      style={{
        listStyle: "none",
        background: "#fff",
        border: "1px solid #e6e8f0",
        borderRadius: 14,
        padding: 14,
        margin: "12px 0",
        boxShadow: "0 3px 12px rgba(0,0,0,.04)"
      }}
    >
      {/* Top meta */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          From: <strong>{r.from_user}</strong> &nbsp;•&nbsp; To: <strong>{r.to_user}</strong>
        </div>
        <span
          style={{
            alignSelf: "flex-start",
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 999,
            background: pending ? "#fffbeb" : r.status === "accepted" ? "#ecfdf5" : "#f3f4f6",
            border: "1px solid #e5e7eb"
          }}
        >
          {r.status}
        </span>
      </div>

      {/* Two-book layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 12, marginTop: 10 }}>
        {/* Offered (from requester) */}
        <div style={{ display: "flex", gap: 10 }}>
          {off.image ? (
            <img src={off.image} alt="" width={60} height={80}
                 style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
          ) : (
            <div style={{ width: 60, height: 80, borderRadius: 8, background: "#f1f5f9" }} />
          )}
          <div>
            <div style={{ fontWeight: 700, lineHeight: 1.25 }}>{off.title}</div>
            {off.author && <div style={{ fontSize: 13, color: "#64748b" }}>Author: {off.author}</div>}
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Offered</div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>⇄</div>

        {/* Requested (what owner has) */}
        <div style={{ display: "flex", gap: 10 }}>
          {req.image ? (
            <img src={req.image} alt="" width={60} height={80}
                 style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
          ) : (
            <div style={{ width: 60, height: 80, borderRadius: 8, background: "#f1f5f9" }} />
          )}
          <div>
            <div style={{ fontWeight: 700, lineHeight: 1.25 }}>{req.title}</div>
            {req.author && <div style={{ fontSize: 13, color: "#64748b" }}>Author: {req.author}</div>}
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Requested</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {pending && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {incomingList ? (
            <>
              <button
                disabled={busyId === r.id}
                onClick={() => onAccept(r.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#16a34a",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {busyId === r.id ? "Accepting..." : "Accept"}
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => onReject(r.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {busyId === r.id ? "Rejecting..." : "Reject"}
              </button>
            </>
          ) : (
            <button
              disabled={busyId === r.id}
              onClick={() => onCancel(r.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#f59e0b",
                color: "#111",
                cursor: "pointer"
              }}
            >
              {busyId === r.id ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const { data } = await api.get("/requests");
    if (data.ok) {
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } else {
      setErr(data.error || "Failed to load requests");
    }
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    try {
      setBusyId(id);
      const { data } = await api.post(`/requests/${id}/accept`);
      if (!data.ok) throw new Error(data.error || "Accept failed");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    try {
      setBusyId(id);
      const { data } = await api.post(`/requests/${id}/reject`);
      if (!data.ok) throw new Error(data.error || "Reject failed");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    try {
      setBusyId(id);
      const { data } = await api.post(`/requests/${id}/cancel`);
      if (!data.ok) throw new Error(data.error || "Cancel failed");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const Column = ({ title, items, incomingList }) => (
    <div style={{ flex: 1, minWidth: 360 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      {items.length === 0 && <p>None</p>}
      <ul style={{ margin: 0, padding: 0 }}>
        {items.map((r) => (
          <RequestCard
            key={r.id}
            r={r}
            incomingList={incomingList}
            busyId={busyId}
            onAccept={accept}
            onReject={reject}
            onCancel={cancel}
          />
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <Column title="Incoming" items={incoming} incomingList />
      <Column title="Outgoing" items={outgoing} />
    </div>
  );
}
