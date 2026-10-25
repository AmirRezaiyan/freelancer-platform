import { useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowUpLeft, BriefcaseBusiness, CalendarDays, Check, FileText, FolderOpen, Github, Instagram, Menu, MessageCircleMore, Linkedin, Search, UserRoundSearch, WalletCards } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import { formatCurrencyToToman, formatDateIran, formatProjectCategory } from "../utils/formatters";
import { registrationPath } from "../utils/landingRoutes";
import { publicProjectResults, publicProjectState } from "../utils/landingData";
import ResilientImage from "../components/ResilientImage";

export default function Home() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    const onPointerDown = (event) => {
      if (!mobileNavRef.current?.contains(event.target)) setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      try {
        const res = await api.get("/market/projects/", {
          params: { status: "open", page: 1, page_size: 3 },
          signal: controller.signal,
        });
        const projects = publicProjectResults(res.data);
        if (active) setRecent(projects.slice(0, 3));
      } catch (requestError) {
        if (active && !controller.signal.aborted) {
          setError(requestError?.response?.status ? "نمایش پروژه‌های تازه در دسترس نیست." : "ارتباط با سرور برقرار نشد.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const isAuthenticated = Boolean(user);
  const canShowAccountActions = isAuthenticated || !authLoading;
  const projectState = publicProjectState({ loading, error, projects: recent });
  const workspacePath = isAuthenticated ? "/dashboard" : null;
  const clientPath = isAuthenticated ? workspacePath : registrationPath("client");
  const freelancerPath = isAuthenticated ? workspacePath : registrationPath("freelancer");

  return (
    <main className="public-home" id="top" dir="rtl">
      <header className="public-header">
        <Link className="public-brand" to="/" aria-label="MyMarket، صفحه اصلی">
          <span className="public-brand-mark"><BriefcaseBusiness size={19} aria-hidden="true" /></span>
          <span className="public-brand-copy"><strong dir="ltr">MyMarket</strong><small>بازار کار مستقل‌ها</small></span>
        </Link>
        <nav className="public-nav" aria-label="راهنمای صفحه">
          <a href="#top" aria-current="page">خانه</a>
          <a href="#open-projects">پروژه‌ها</a>
          <a href="#how-it-works">مراحل همکاری</a>
          <a href="#roles">مسیرهای همکاری</a>
        </nav>
        <div className="public-mobile-nav" ref={mobileNavRef}>
          <button
            className="public-mobile-toggle"
            type="button"
            aria-label={mobileNavOpen ? "بستن فهرست" : "باز کردن فهرست"}
            aria-expanded={mobileNavOpen}
            aria-controls="public-mobile-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <Menu size={19} aria-hidden="true" />
          </button>
          {mobileNavOpen && (
            <nav className="public-mobile-menu" id="public-mobile-navigation" aria-label="راهنمای صفحه">
              <a href="#top" onClick={() => setMobileNavOpen(false)}>خانه</a>
              <a href="#open-projects" onClick={() => setMobileNavOpen(false)}>پروژه‌ها</a>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>مراحل همکاری</a>
              <a href="#roles" onClick={() => setMobileNavOpen(false)}>مسیرهای همکاری</a>
            </nav>
          )}
        </div>
        <div className="public-header-actions">
          <a className="public-header-search" href="#open-projects" aria-label="مشاهده پروژه‌های باز" title="پروژه‌های باز">
            <Search size={15} aria-hidden="true" />
          </a>
          {canShowAccountActions && (isAuthenticated ? (
            <Link className="public-header-workspace" to={workspacePath}>ورود به فضای کاری<ArrowUpLeft size={16} aria-hidden="true" /></Link>
          ) : (
            <>
              <Link className="public-login-link" to="/login">ورود</Link>
              <Link className="public-register-link" to="/register">ثبت‌نام</Link>
            </>
          ))}
        </div>
      </header>

      <section className="public-hero" aria-labelledby="public-title">
        <div className="public-hero-content">
          <span className="public-hero-eyebrow"><span aria-hidden="true" /> بازار کار مستقل‌ها</span>
          <h1 id="public-title">پروژه‌ات را شروع کن؛<br className="public-hero-break" /> همکاری حرفه‌ای بساز.</h1>
          <p>پروژه ثبت کن، متخصص مناسب را پیدا کن و مسیر همکاری را شفاف و آسان پیش ببر؛ مهارتت را به فرصت‌های واقعی وصل کن.</p>
          <div className="public-hero-actions">
            {canShowAccountActions && (
              <>
                <Link to={clientPath} className="public-hero-primary">
                  {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان کارفرما"}<ArrowUpLeft size={17} aria-hidden="true" />
                </Link>
                <Link to={freelancerPath} className="public-hero-secondary">
                  {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان فریلنسر"}<ArrowUpLeft size={17} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="public-hero-visual">
          <svg className="public-hero-flower" viewBox="0 0 700 420" aria-hidden="true" focusable="false">
            <path className="public-hero-petal public-hero-petal-upper" d="M4 6 C58 0 116 9 148 31 C174 51 179 73 161 98 C145 73 115 58 75 49 C35 42 10 27 4 6Z" />
            <path className="public-hero-petal" d="M12 5 C62 6 104 20 127 43 C144 64 140 84 127 101 C111 78 84 67 52 57 C28 48 13 31 12 5Z" />
            <path className="public-hero-petal public-hero-petal-right" d="M554 24 C590 8 627 26 645 53 C660 76 652 104 632 110 C626 88 608 76 585 67 C566 59 552 43 554 24Z" />
          </svg>
          <ResilientImage
            className="public-hero-image"
            src="/images/guest-home/collaboration.jpg"
            alt="فضای کاری گروهی با اعضای تیم در حال همکاری"
            fetchPriority="high"
            fallback={<BriefcaseBusiness size={32} aria-hidden="true" />}
          />
          <svg className="public-hero-swish" viewBox="0 0 90 112" aria-hidden="true" focusable="false">
            <path d="M2 106 C22 108 40 97 54 78 C70 56 78 27 87 5" />
          </svg>
        </div>
        <svg className="public-hero-doodle" viewBox="0 0 150 220" aria-hidden="true">
          <path d="M4 86 C25 116 39 130 68 151 M5 85 C20 92 31 99 45 107 M67 151 C80 164 94 174 111 179" />
          <text x="45" y="58">Better</text>
          <text x="53" y="74">Projects</text>
          <text x="59" y="90">Bigger</text>
          <text x="75" y="106">Dreams</text>
        </svg>
      </section>

      <section className="public-roles" id="roles" aria-label="مسیرهای همکاری">
        <div className="public-role-grid">
          <article className="public-role public-role-client">
            <div className="public-role-visual public-role-client-visual">
              <img src="/images/guest-home/role-client.jpg" alt="ابزار همکاری و فضای کاری کارفرما" width="136" height="170" />
            </div>
            <div className="public-role-content">
              <div className="public-role-heading">
                <div><span className="public-role-label">برای کارفرما</span><h3>به‌عنوان کارفرما</h3></div>
              </div>
              <p>پروژه‌هایت را به بهترین متخصص‌ها بسپار</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> دسترسی به متخصصان حرفه‌ای</li>
                <li><Check size={15} aria-hidden="true" /> مدیریت آسان پروژه‌ها</li>
                <li><Check size={15} aria-hidden="true" /> صرفه‌جویی در زمان و هزینه</li>
              </ul>
              {canShowAccountActions && (
                <Link to={clientPath} className="public-role-link public-role-link-client">
                  {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان کارفرما"}<ArrowUpLeft size={17} aria-hidden="true" />
                </Link>
              )}
            </div>
          </article>

          <article className="public-role public-role-freelancer">
            <div className="public-role-visual public-role-freelancer-visual">
              <img src="/images/guest-home/role-freelancer.jpg" alt="فریلنسر در حال کار با رایانه" width="88" height="97" />
              <svg className="public-role-freelancer-swish" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
                <path d="M2 94 C21 88 34 78 45 61 C58 41 69 19 117 10" />
              </svg>
            </div>
            <div className="public-role-content">
              <div className="public-role-heading">
                <div><span className="public-role-label">برای فریلنسر</span><h3>به‌عنوان فریلنسر</h3></div>
              </div>
              <p>مهارتت را به فرصت‌های واقعی وصل کن</p>
              <ul>
                <li><Check size={15} aria-hidden="true" /> دسترسی به پروژه‌های متنوع</li>
                <li><Check size={15} aria-hidden="true" /> پرداخت امن و مطمئن</li>
                <li><Check size={15} aria-hidden="true" /> انعطاف در زمان و مکان کار</li>
              </ul>
              {canShowAccountActions && (
                <Link to={freelancerPath} className="public-role-link public-role-link-freelancer">
                  {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان فریلنسر"}<ArrowUpLeft size={17} aria-hidden="true" />
                </Link>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="public-process" id="how-it-works" aria-labelledby="process-title">
        <svg className="public-process-leaves" viewBox="0 0 120 90" aria-hidden="true">
          <path className="public-process-stem" d="M-7 88 C23 67 43 43 83 4" />
          <path d="M12 73 C-3 64 -5 53 2 43 C17 49 21 59 12 73Z" />
          <path d="M26 61 C17 45 20 34 31 27 C41 41 39 52 26 61Z" />
          <path d="M43 45 C42 29 50 19 63 18 C66 34 58 43 43 45Z" />
          <path d="M18 68 C5 77 5 87 13 94 C26 85 27 76 18 68Z" />
          <path d="M36 51 C24 60 25 72 34 78 C47 67 46 58 36 51Z" />
          <path d="M55 32 C45 42 47 54 57 59 C68 47 66 38 55 32Z" />
        </svg>
        <div className="public-section-heading">
          <div><span>چطور کار می‌کنه؟</span><h2 id="process-title">در سه مرحله ساده</h2></div>
        </div>
        <div className="public-process-grid">
          <div className="public-process-step"><span className="public-process-icon"><FileText size={22} aria-hidden="true" /></span><div><h3>۱. پروژه را منتشر کنید</h3><p>نیاز خود را دقیق مشخص کنید و جزئیات پروژه‌ات را بنویس.</p></div></div>
          <div className="public-process-step"><span className="public-process-icon"><UserRoundSearch size={22} aria-hidden="true" /></span><div><h3>۲. پیشنهادها را بررسی کنید</h3><p>پیشنهاد متخصصان را مقایسه کنید و بهترین گزینه را انتخاب کنید.</p></div></div>
          <div className="public-process-step"><span className="public-process-icon"><MessageCircleMore size={22} aria-hidden="true" /></span><div><h3>۳. گفتگو را ادامه دهید</h3><p>با متخصص منتخب خود گفتگو کنید و جزئیات همکاری را نهایی کنید.</p></div></div>
        </div>
        <svg className="public-process-wave" viewBox="0 0 768 32" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 9 C81 27 154 26 238 23 C342 19 389 23 477 20 C577 17 662 31 768 19 V32 H0Z" />
        </svg>
      </section>

      <section className="public-projects" id="open-projects" aria-labelledby="open-projects-title">
        <div className="public-projects-heading">
          <div className="public-section-heading">
            <span>فرصت‌های واقعی</span>
            <h2 id="open-projects-title">پروژه‌های باز</h2>
          </div>
          {canShowAccountActions && (
            <Link to={isAuthenticated ? "/dashboard/projects" : registrationPath("freelancer")}>مشاهده همه پروژه‌ها<ArrowUpLeft size={16} aria-hidden="true" /></Link>
          )}
        </div>
        {projectState === "loading" ? (
          <div className="public-project-loading" role="status" aria-label="در حال دریافت پروژه‌های باز">
            <span className="public-project-skeleton public-project-skeleton-long" />
            <span className="public-project-skeleton public-project-skeleton-short" />
          </div>
        ) : projectState === "error" ? (
          <div className="public-project-message public-project-error" role="alert">
            <AlertCircle size={19} aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : projectState === "success" && recent.length > 0 ? (
          <div className="public-project-list">
            {recent.map((project, index) => {
              const budgetMin = project.budget_min != null && project.budget_min !== "" ? Number(project.budget_min) : null;
              const budgetMax = project.budget_max != null && project.budget_max !== "" ? Number(project.budget_max) : null;
              const hasBudgetMin = Number.isFinite(budgetMin);
              const hasBudgetMax = Number.isFinite(budgetMax);
              const budgetLabel = hasBudgetMin && hasBudgetMax
                ? `${formatCurrencyToToman(budgetMin)} تا ${formatCurrencyToToman(budgetMax)}`
                : hasBudgetMin
                  ? `از ${formatCurrencyToToman(budgetMin)}`
                  : hasBudgetMax
                    ? `تا ${formatCurrencyToToman(budgetMax)}`
                    : null;
              const description = typeof project.description === "string" ? project.description.trim() : "";
              return (
                <article className={`public-project-item public-project-item-${(index % 3) + 1}`} key={project.id}>
                  <div className="public-project-card-top">
                    {project.category && <span className="public-project-category">{formatProjectCategory(project.category)}</span>}
                  </div>
                  <h3>{isAuthenticated
                    ? <Link to={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                    : project.title}</h3>
                  {description && <p>{description.slice(0, 180)}</p>}
                  <div className="public-project-meta">
                    {project.created_at && <span className="public-project-date"><CalendarDays size={15} aria-hidden="true" />{formatDateIran(project.created_at)}</span>}
                    {budgetLabel && <strong><WalletCards size={15} aria-hidden="true" />{budgetLabel}</strong>}
                    <ArrowUpLeft className="public-project-action" size={18} aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="public-project-message public-project-empty">
            <FolderOpen size={22} aria-hidden="true" />
            <div>
              <strong>در حال حاضر پروژهٔ بازی برای نمایش نیست.</strong>
              <span>برای دیدن فرصت‌های تازه، بعداً دوباره سر بزنید.</span>
            </div>
            {canShowAccountActions && (
              <Link to={freelancerPath}>
                {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان فریلنسر"}
                <ArrowUpLeft size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="public-signup" aria-labelledby="public-signup-title">
        <img className="public-signup-image" src="/images/guest-home/signup-leaves.jpg" alt="" width="359" height="103" />
        <div className="public-signup-content">
          <span>به جمع متخصصان حرفه‌ای بپیوندید</span>
          <h2 id="public-signup-title">همین حالا عضو MyMarket شو</h2>
          <p>به جامعه‌ای از متخصصان حرفه‌ای بپیوندید و مسیر شغلی‌ات را رشد بده.</p>
          {!isAuthenticated && canShowAccountActions && (
            <Link to={registrationPath("freelancer")}>ثبت‌نام رایگان<ArrowUpLeft size={15} aria-hidden="true" /></Link>
          )}
        </div>
      </section>

      <footer className="public-footer" id="public-footer">
        <Link className="public-brand" to="/" aria-label="MyMarket، صفحه اصلی">
          <span className="public-brand-mark"><BriefcaseBusiness size={17} aria-hidden="true" /></span>
          <span className="public-brand-copy"><strong dir="ltr">MyMarket</strong><small>بازار کار مستقل‌ها</small></span>
        </Link>
        <nav className="public-footer-sections" aria-label="بخش‌های صفحه">
          <a href="#open-projects">پروژه‌های باز</a>
          <a href="#how-it-works">مراحل همکاری</a>
          <a href="#roles">مسیرهای همکاری</a>
        </nav>
        <div className="public-footer-social" aria-label="با ما در ارتباط باشید">
          <span className="public-footer-social-icon" aria-label="LinkedIn"><Linkedin size={16} aria-hidden="true" /></span>
          <span className="public-footer-social-icon" aria-label="GitHub"><Github size={16} aria-hidden="true" /></span>
          <span className="public-footer-social-icon" aria-label="Instagram"><Instagram size={16} aria-hidden="true" /></span>
          <span className="public-footer-social-label">با ما در ارتباط باشید</span>
        </div>
        <small className="public-footer-copyright" dir="ltr">© 2025 MyMarket. All rights reserved.</small>
      </footer>
    </main>
  );
}
