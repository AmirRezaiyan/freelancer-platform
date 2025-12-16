import React, { useState, useRef } from "react";
import api from "../api/axios";

export default function SearchBox({ onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const doSearch = async (term) => {
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/market/projects/", { params: { q: term } }); 
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      setResults(list);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(v.trim()), 350);
  };

  return (
    <div style={{ position: "relative", width: 340 }}>
      <input
        placeholder="جستجو پروژه یا مهارت (مثال: react, django)"
        value={q}
        onChange={onChange}
        style={{ padding: "8px 12px", borderRadius: 8, width: "100%", background: "#0b0b0d", border: "1px solid #222", color: "#fff" }}
      />
      {loading && <div style={{ position: "absolute", right: 12, top: 10 }}>در حال جستجو…</div>}
      {results && results.length > 0 && (
        <div style={{ position: "absolute", right: 0, top: 40, width: "100%", background: "#111827", borderRadius: 8, padding: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.6)" }}>
          {results.slice(0, 6).map(r => (
            <div key={r.id} onClick={() => onSelect?.(r)} style={{ padding: 8, cursor: "pointer", color: "#fff", textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.skills?.join?.(", ") || r.description?.slice(0,80)}</div>
            </div>
          ))}
        </div>
      )}
      {q && !loading && results && results.length === 0 && (
        <div style={{ position: "absolute", right: 0, top: 40, width: "100%", background: "#111827", borderRadius: 8, padding: 12, color: "#9ca3af", textAlign: "right" }}>
          هیچ پروژه‌ای مطابق با «<strong>{q}</strong>» پیدا نشد — می‌توانید کلیدواژه‌ها (مثل زبان، فریمورک یا «طراحی سایت») را امتحان کنید.
        </div>
      )}
    </div>
  );
}
