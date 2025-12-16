import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/market/projects/");
        setRecent(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ marginBottom: 12 }}>خلاصه</h2>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div style={cardDark}>پروژه‌های اخیر<br /><strong style={{ color: "#fff" }}>{recent.length}</strong></div>
        <div style={cardDark}>پیشنهادها<br /><strong style={{ color: "#fff" }}>—</strong></div>
        <div style={cardDark}>درآمد<br /><strong style={{ color: "#fff" }}>—</strong></div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
          <h3>پروژه‌های اخیر</h3>
          <Link to="/dashboard/projects" style={{ color: "#60a5fa" }}>مشاهده همه</Link>
        </div>

        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : recent.length === 0 ? (
          <p>پروژه‌ای یافت نشد.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginTop: 12 }}>
            {recent.map((p) => (
              <Link to={`/dashboard/projects/${p.id}`} key={p.id} style={projectCard}>
                <h4 style={{ margin: "0 0 6px 0", color: "#fff" }}>{p.title}</h4>
                <p style={{ fontSize: 13, color: "#cbd5e1" }}>{p.description?.slice?.(0, 120)}</p>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{p.budget_min} - {p.budget_max}$</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const cardDark = { background: "#111827", padding: 16, borderRadius: 10, textAlign: "center", minHeight: 80 };
const projectCard = { display: "block", padding: 14, background: "#111827", borderRadius: 10, textDecoration: "none", color: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.4)" };
