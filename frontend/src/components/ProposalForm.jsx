import React, { useContext, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import { buildProposalPayload } from "../utils/proposalPayload";
import { canSubmitProposal, getProfileIncompleteDetails } from "../utils/profileCompletion";
import ProfileCompletionCard from "./ProfileCompletionCard";


export default function ProposalForm({ projectId, onSuccess }) {
  const { user, setUser, refreshUser, profileRefreshing } = useContext(AuthContext);
  const canSubmitProposalNow = canSubmitProposal(user, profileRefreshing);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [profileGateError, setProfileGateError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!user) return setError("برای ارسال پیشنهاد ابتدا وارد شوید.");
    if (!canSubmitProposalNow) return;
    if (!Number.isInteger(Number(price)) || Number(price) < 1) return setError("قیمت معتبر وارد کنید.");
    if (!message.trim()) return setError("پیام پیشنهاد را وارد کنید.");

    setSending(true);
    try {
      const res = await api.post("/market/proposals/create/", buildProposalPayload(projectId, price, message.trim()));
      setMessage("");
      setPrice("");
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const incompleteDetails = getProfileIncompleteDetails(err);
      if (incompleteDetails) {
        const completion = incompleteDetails.profileCompletion || {
          ...(user?.profile_completion || {}),
          is_complete: false,
          can_submit_proposal: false,
          missing: incompleteDetails.missingFields,
        };
        setUser((current) => current ? { ...current, profile_completion: completion } : current);
        setProfileGateError({
          completion,
          errorMessage: "برای ارسال پیشنهاد، ابتدا شرایط پایه پروفایل فریلنسری خود را تکمیل کنید.",
        });
        return;
      }

      const status = err?.response?.status;
      if (status === 403 || status === 429) {
        setError(err?.response?.data?.detail || "شما به حد مجاز ارسال رسیده‌اید. برای ارسال بیشتر باید پلن ارتقا دهید.");
      } else if (status === 401) {
        setError("ابتدا وارد شوید.");
      } else {
        setError("ارسال پیشنهاد با خطا مواجه شد.");
      }
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return <div style={styles.error} role="alert">برای ارسال پیشنهاد ابتدا وارد شوید.</div>;
  }

  if (!canSubmitProposalNow) {
    return user.user_type === "freelancer" ? (
      <ProfileCompletionCard
        compact
        completion={profileGateError?.completion || user.profile_completion}
        userType={user.user_type}
        title="برای ارسال پیشنهاد پروفایل خود را تکمیل کنید"
        description="شرایط پایه پروفایل فریلنسری باید پیش از ثبت پیشنهاد تأیید شود."
        errorMessage={profileGateError?.errorMessage}
        onRetry={refreshUser}
        retrying={profileRefreshing}
      />
    ) : (
      <div style={styles.error} role="alert">فقط فریلنسرها می‌توانند برای پروژه‌ها پیشنهاد ارسال کنند.</div>
    );
  }

  return (
    <form onSubmit={submit} style={styles.form}>
      <h4 style={{ margin: "0 0 8px 0", color: "#fff" }}>ارسال پیشنهاد</h4>

      <label style={styles.label}>قیمت (تومان)</label>
      <input value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} placeholder="مثال: 500000" />

      <label style={styles.label}>پیام به کارفرما</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={styles.textarea} placeholder="چند خط درباره‌ٔ پیشنهادت بنویس..." />

      {error && <div style={styles.error}>{error}</div>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="submit" disabled={sending} style={styles.btnPrimary}>{sending ? "در حال ارسال..." : "ارسال پیشنهاد"}</button>
        <button type="button" onClick={() => { setPrice(""); setMessage(""); setError(""); }} style={styles.btnAlt}>لغو</button>
      </div>
    </form>
  );
}

const styles = {
  form: { background: "#0b0b0d", padding: 12, borderRadius: 10, color: "#fff", border: "1px solid #111827" },
  label: { display: "block", textAlign: "right", marginBottom: 6, color: "#fff", fontWeight: 700 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1f2937", background: "#111827", color: "#fff", textAlign: "right", marginBottom: 8 },
  textarea: { width: "100%", padding: 12, borderRadius: 8, border: "1px solid #1f2937", background: "#111827", color: "#fff", textAlign: "right", marginBottom: 8 },
  btnPrimary: { background: "#10b981", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" },
  btnAlt: { background: "transparent", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #374151", cursor: "pointer" },
  error: { color: "#fecaca", marginBottom: 8, textAlign: "right" },
};
