import { Link } from "react-router-dom";
import { ArrowUpLeft, BriefcaseBusiness, Check, FileText, FolderOpen, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import ResilientImage from "../components/ResilientImage";
import { formatCurrencyToToman, formatDateIran } from "../utils/formatters";
import { entityId } from "../utils/dashboardData";

const projectStatusLabels = {
  open: "باز",
  in_progress: "در حال انجام",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
};

const proposalStatusLabels = {
  pending: "در انتظار بررسی",
  accepted: "پذیرفته‌شده",
  rejected: "ردشده",
};

function Metric({ label, value, icon }) {
  return (
    <div className="dashboard-metric">
      <span className="dashboard-metric-icon" aria-hidden="true">{icon}</span>
      <div>
        <span className="dashboard-metric-value">{value == null ? "—" : Number(value).toLocaleString("fa-IR")}</span>
        <span className="dashboard-metric-label">{label}</span>
      </div>
    </div>
  );
}

function SectionHeading({ title, to, action }) {
  return (
    <div className="dashboard-section-heading">
      <h2>{title}</h2>
      {to && <Link to={to}>{action}<ArrowUpLeft size={15} aria-hidden="true" /></Link>}
    </div>
  );
}

function EmptyState({ title, description, to, action }) {
  return (
    <div className="dashboard-empty-state">
      <p>{title}</p>
      {description && <span>{description}</span>}
      {to && <Link to={to}>{action}<ArrowUpLeft size={15} aria-hidden="true" /></Link>}
    </div>
  );
}

export default function DashboardOverview({
  user,
  metrics = {},
  loading,
  error,
  projects = [],
  projectError,
  projectProposals = [],
  proposals = [],
  proposalError,
  activities = [],
  activityLoading,
  activityError,
  portfolios = [],
  portfolioLoading,
  deletingId,
  onAddPortfolio,
  onEditPortfolio,
  onDeletePortfolio,
  onOpenPortfolio,
}) {
  const isClient = user?.user_type === "client";
  const firstName = user?.first_name?.trim().split(/\s+/)[0] || "";
  const hasClientProposalData = projectProposals.some((item) => item.latest);

  return (
    <div className="dashboard-home">
      <header className="dashboard-page-intro">
        <div>
          <span className="dashboard-eyebrow">فضای کاری {isClient ? "کارفرما" : "فریلنسر"}</span>
          <h1>{firstName ? `${firstName}، ` : ""}{isClient ? "پروژه‌هایتان را مدیریت کنید" : "پیشنهادهایتان را پیگیری کنید"}</h1>
          <p>{isClient
            ? "وضعیت پروژه‌ها و پیشنهادهای دریافت‌شده را یک‌جا ببینید."
            : "پروژه‌های مناسب را پیدا کنید و روند پیشنهادهایتان را دنبال کنید."}</p>
        </div>
        <Link className="dashboard-intro-action" to={isClient ? "/dashboard/projects/create" : "/dashboard/projects"}>
          {isClient ? <Plus size={17} aria-hidden="true" /> : <Search size={17} aria-hidden="true" />}
          {isClient ? "ساخت پروژه" : "جستجوی پروژه‌ها"}
        </Link>
      </header>

      <section className="dashboard-metrics" aria-label="خلاصه فعالیت">
        {isClient ? (
          <>
            <Metric label="همه پروژه‌ها" value={metrics.projectsTotal} icon={<FolderOpen size={18} />} />
            <Metric label="در حال انجام" value={metrics.activeProjects} icon={<BriefcaseBusiness size={18} />} />
            <Metric label="پیشنهادهای دریافتی" value={metrics.proposalsReceived} icon={<MessageCircle size={18} />} />
          </>
        ) : (
          <>
            <Metric label="پیشنهادهای ارسال‌شده" value={metrics.proposalsSent} icon={<FileText size={18} />} />
            <Metric label="در انتظار بررسی" value={metrics.pendingProposals} icon={<MessageCircle size={18} />} />
            <Metric label="قراردادهای فعال" value={metrics.activeContracts} icon={<Check size={18} />} />
          </>
        )}
        {error && <p className="dashboard-inline-error" role="alert">{error}</p>}
        {loading && <span className="dashboard-loading-note" role="status">در حال به‌روزرسانی آمار...</span>}
      </section>

      <div className="dashboard-content-grid">
        <div className="dashboard-primary-column">
          {isClient ? (
            <>
              <section className="dashboard-section">
                <SectionHeading title="پروژه‌های اخیر شما" to="/dashboard/projects" action="همه پروژه‌ها" />
                {projectError ? (
                  <p className="dashboard-inline-error" role="alert">{projectError}</p>
                ) : projects.length ? (
                  <div className="dashboard-project-list">
                    {projects.map((project) => {
                      const proposalCount = projectProposals.find((item) => item.projectId === project.id)?.count;
                      return (
                        <article className="dashboard-project-row" key={project.id}>
                          <div className="dashboard-project-main">
                            <Link className="dashboard-item-title" to={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                            <span className={`dashboard-status dashboard-status-${project.status || "unknown"}`}>
                              {projectStatusLabels[project.status] || "وضعیت نامشخص"}
                            </span>
                            <span className="dashboard-item-meta">
                              {formatCurrencyToToman(project.budget_min)} تا {formatCurrencyToToman(project.budget_max)}
                              <span aria-hidden="true"> · </span>
                              {formatDateIran(project.created_at)}
                            </span>
                          </div>
                          <Link className="dashboard-project-proposals" to={`/dashboard/projects/${project.id}`}>
                            {proposalCount == null ? "مشاهده پیشنهادها" : `${Number(proposalCount).toLocaleString("fa-IR")} پیشنهاد`}
                            <ArrowUpLeft size={15} aria-hidden="true" />
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                ) : loading ? (
                  <p className="dashboard-loading-note" role="status">در حال بارگذاری پروژه‌ها...</p>
                ) : metrics.projectsTotal > 0 ? (
                  <EmptyState
                    title="برای دیدن همه پروژه‌ها، فهرست پروژه‌ها را باز کنید."
                    to="/dashboard/projects"
                    action="رفتن به پروژه‌ها"
                  />
                ) : (
                  <EmptyState
                    title="هنوز پروژه‌ای برای نمایش ندارید."
                    description="با ساخت پروژه، پیشنهادهای فریلنسرها را دریافت کنید."
                    to="/dashboard/projects/create"
                    action="ساخت پروژه"
                  />
                )}
              </section>

              <section className="dashboard-section">
                <SectionHeading title="پیشنهادهای اخیر" to="/dashboard/projects" action="بررسی پروژه‌ها" />
                {proposalError && !hasClientProposalData ? (
                  <p className="dashboard-inline-error" role="alert">{proposalError}</p>
                ) : hasClientProposalData ? (
                  <div className="dashboard-proposal-list">
                    {projectProposals.filter((item) => item.latest).map(({ projectId, projectTitle, latest }) => (
                      <article className="dashboard-proposal-row" key={latest.id}>
                        <div>
                          <Link className="dashboard-item-title" to={`/dashboard/projects/${projectId}`}>{projectTitle}</Link>
                          <p>{latest.message || "متنی برای پیشنهاد ثبت نشده است."}</p>
                        </div>
                        <div className="dashboard-proposal-side">
                          <strong>{formatCurrencyToToman(latest.bid_amount)}</strong>
                          <span className={`dashboard-status dashboard-status-${latest.status || "pending"}`}>
                            {proposalStatusLabels[latest.status] || "در انتظار بررسی"}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : loading ? (
                  <p className="dashboard-loading-note" role="status">در حال بررسی پیشنهادها...</p>
                ) : metrics.proposalsReceived > 0 ? (
                  <EmptyState title="برای دیدن پیشنهادها، یکی از پروژه‌ها را باز کنید." />
                ) : (
                  <EmptyState title="هنوز پیشنهادی دریافت نشده است." description="پیشنهادهای جدید در همین بخش نمایش داده می‌شوند." />
                )}
                {proposalError && hasClientProposalData && <p className="dashboard-inline-error" role="alert">{proposalError}</p>}
              </section>
            </>
          ) : (
            <>
              <section className="dashboard-section">
                <SectionHeading title="پیشنهادهای اخیر شما" to="/dashboard/proposals" action="همه پیشنهادها" />
                {proposalError ? (
                  <p className="dashboard-inline-error" role="alert">{proposalError}</p>
                ) : proposals.length ? (
                  <div className="dashboard-proposal-list">
                    {proposals.map((proposal) => {
                      const projectId = entityId(proposal.project);
                      const title = proposal.project_title || proposal.project_details?.title || `پروژه شماره ${projectId ?? "—"}`;
                      return (
                        <article className="dashboard-proposal-row" key={proposal.id}>
                          <div>
                            <Link className="dashboard-item-title" to={`/dashboard/projects/${projectId}`}>{title}</Link>
                            <p>{proposal.message || "متنی برای پیشنهاد ثبت نشده است."}</p>
                            <span className={`dashboard-status dashboard-status-${proposal.status || "pending"}`}>
                              {proposalStatusLabels[proposal.status] || "در انتظار بررسی"}
                            </span>
                          </div>
                          <strong className="dashboard-proposal-amount">{formatCurrencyToToman(proposal.bid_amount)}</strong>
                        </article>
                      );
                    })}
                  </div>
                ) : loading ? (
                  <p className="dashboard-loading-note" role="status">در حال بارگذاری پیشنهادها...</p>
                ) : (
                  <EmptyState
                    title="هنوز پیشنهادی ارسال نکرده‌اید."
                    description="پروژه‌ها را بررسی کنید تا فرصت مناسب‌تری پیدا کنید."
                    to="/dashboard/projects"
                    action="جستجوی پروژه‌ها"
                  />
                )}
              </section>

              <section className="dashboard-section">
                <SectionHeading title="نمونه‌کارهای شما" to="/dashboard/profile" action="مدیریت پروفایل" />
                <div className="dashboard-portfolio-heading">
                  <span>{portfolios.length ? `${portfolios.length.toLocaleString("fa-IR")} نمونه‌کار` : "نمونه‌کار ثبت‌شده‌ای ندارید"}</span>
                  <button type="button" onClick={onAddPortfolio}><Plus size={16} aria-hidden="true" /> افزودن نمونه‌کار</button>
                </div>
                {portfolioLoading ? (
                  <p className="dashboard-loading-note" role="status">در حال بارگذاری نمونه‌کارها...</p>
                ) : portfolios.length ? (
                  <div className="dashboard-portfolio-list">
                    {portfolios.slice(0, 3).map((portfolio) => (
                      <article className="dashboard-portfolio-item" key={portfolio.id}>
                        <button type="button" className="dashboard-portfolio-preview" onClick={() => onOpenPortfolio(portfolio)} aria-label={`مشاهده ${portfolio.title}`}>
                          {portfolio.media?.toLowerCase?.().endsWith(".mp4") ? (
                            <video src={portfolio.media} muted preload="metadata" />
                          ) : portfolio.media ? (
                            <ResilientImage src={portfolio.media} alt="" />
                          ) : (
                            <FolderOpen size={22} aria-hidden="true" />
                          )}
                        </button>
                        <div className="dashboard-portfolio-copy">
                          <strong>{portfolio.title}</strong>
                          <span>{portfolio.description || "بدون توضیحات"}</span>
                        </div>
                        <div className="dashboard-portfolio-actions">
                          <button type="button" onClick={() => onEditPortfolio(portfolio)}>ویرایش</button>
                          <button type="button" className="dashboard-delete-action" disabled={deletingId === portfolio.id} onClick={() => onDeletePortfolio(portfolio.id)} aria-label={`حذف ${portfolio.title}`}>
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="نمونه‌کارهایتان را به پروفایل اضافه کنید." description="فقط مواردی که خودتان ثبت کرده‌اید در اینجا نمایش داده می‌شوند." />
                )}
              </section>
            </>
          )}
        </div>

        <aside className="dashboard-activity-section">
          <SectionHeading title="فعالیت‌های اخیر" />
          {activityLoading ? (
            <p className="dashboard-loading-note" role="status">در حال بارگذاری...</p>
          ) : activityError ? (
            <p className="dashboard-inline-error" role="alert">{activityError}</p>
          ) : activities.length ? (
            <ol className="dashboard-activity-list">
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id}>
                  <span>{activity.action}</span>
                  <time>{formatDateIran(activity.created_at)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="فعالیتی برای نمایش نیست." />
          )}
        </aside>
      </div>
    </div>
  );
}