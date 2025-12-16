import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatCurrencyToToman, formatDateIran } from "../utils/formatters";
import UserAvatar from "./UserAvatar";

export default function ProjectCard({ project, onApply }) {
  const { user } = useContext(AuthContext);

  const applied = Boolean(project?.has_applied || project?.user_proposal_id);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <UserAvatar src={project.client_avatar} size={40} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: "#fff" }}>{project.title}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{project.client_username || "کارفرما"}</div>
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 800 }}>{formatCurrencyToToman(project.budget_min)} - {formatCurrencyToToman(project.budget_max)}</div>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>{formatDateIran(project.created_at)}</div>
        </div>
      </div>

      <p style={styles.desc}>{project.description}</p>

      <div style={styles.skills}>
        {(project.skills || []).slice(0, 6).map((s, idx) => (
          <span key={idx} style={styles.tag}>{s}</span>
        ))}
      </div>

      <div style={styles.actions}>
        <Link to={`/dashboard/projects/${project.id}`} style={styles.btn}>مشاهده</Link>

        {user?.user_type === "freelancer" ? (
          applied ? (
            <button
              title={project.user_proposal_id ? "شما قبلاً پیشنهاد داده‌اید" : "شما قبلاً پیشنهاد داده‌اید"}
              style={{ ...styles.btnOutline, opacity: 0.6, cursor: 'not-allowed' }}
              disabled
            >
              پیشنهاد ارسال شده
            </button>
          ) : (
            <button style={styles.btnOutline} onClick={() => onApply ? onApply(project.id) : null}>ارسال پیشنهاد</button>
          )
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  desc: { color: "#cbd5e1", margin: 0, textAlign: "right" },
  skills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  tag: { background: "#0b0b0d", color: "#fff", padding: "6px 8px", borderRadius: 8, fontSize: 13, border: "1px solid #1f2937" },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 },
  btn: { background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 8, textDecoration: "none", border: "none", cursor: "pointer" },
  btnOutline: { background: "transparent", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #374151", cursor: "pointer" },
};
