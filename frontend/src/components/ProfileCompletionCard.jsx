import { Check, CircleAlert, LoaderCircle, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getProfileMissingLabels, PROFILE_EDITOR_PATH } from "../utils/profileCompletion";
import "../styles/profile-completion.css";

export default function ProfileCompletionCard({
  completion,
  userType,
  title,
  description,
  errorMessage,
  onRetry,
  retrying = false,
  compact = false,
}) {
  const hasCompletion = Boolean(completion && typeof completion === "object");
  const percentage = hasCompletion && Number.isFinite(Number(completion.percentage))
    ? Math.min(100, Math.max(0, Number(completion.percentage)))
    : null;
  const missingLabels = getProfileMissingLabels(completion?.missing);
  const isComplete = completion?.is_complete === true;
  const roleLabel = userType === "client" ? "کارفرما" : "فریلنسر";

  return (
    <section className={`profile-completion${compact ? " profile-completion-compact" : ""}`} dir="rtl" aria-labelledby="profile-completion-title">
      <div className="profile-completion-heading">
        <span className={`profile-completion-icon${isComplete ? " is-complete" : ""}`} aria-hidden="true">
          {isComplete ? <Check size={19} /> : hasCompletion ? <UserRound size={19} /> : <CircleAlert size={19} />}
        </span>
        <div>
          <h2 id="profile-completion-title">{title || (isComplete ? "پروفایل شما تکمیل است" : `تکمیل پروفایل ${roleLabel}`)}</h2>
          <p>{description || (isComplete
            ? "شرایط پایه برای استفاده از قابلیت‌های حساب شما فراهم است."
            : "برای دسترسی به بعضی قابلیت‌ها، موارد باقی‌مانده را در پروفایل خود تکمیل کنید.")}</p>
        </div>
      </div>

      {percentage !== null ? (
        <div className="profile-completion-progress-wrap">
          <div className="profile-completion-progress-label">
            <span>میزان تکمیل</span>
            <strong>{percentage.toLocaleString("fa-IR")}٪</strong>
          </div>
          <progress className="profile-completion-progress" max="100" value={percentage} aria-label="درصد تکمیل پروفایل" />
        </div>
      ) : (
        <p className="profile-completion-unknown" role="status">وضعیت تکمیل پروفایل هنوز دریافت نشده است.</p>
      )}

      {!isComplete && missingLabels.length > 0 && (
        <div className="profile-completion-missing">
          <strong>موارد باقی‌مانده:</strong>
          <ul>
            {missingLabels.map((label, index) => <li key={`${label}-${index}`}>{label}</li>)}
          </ul>
        </div>
      )}

      {errorMessage && <p className="profile-completion-error" role="alert">{errorMessage}</p>}

      <div className="profile-completion-actions">
        <Link className="profile-completion-link" to={PROFILE_EDITOR_PATH}>
          ویرایش پروفایل
        </Link>
        {onRetry && (
          <button className="profile-completion-retry" type="button" onClick={onRetry} disabled={retrying}>
            {retrying && <LoaderCircle size={15} className="profile-completion-spinner" aria-hidden="true" />}
            {retrying ? "در حال بررسی..." : "بررسی دوباره"}
          </button>
        )}
      </div>
    </section>
  );
}