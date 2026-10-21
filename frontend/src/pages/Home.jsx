import { useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowUpLeft, BriefcaseBusiness, Check, FolderOpen, Menu, Search } from "lucide-react";
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
    <main className="public-home" dir="rtl">
      <header className="public-header">
        <Link className="public-brand" to="/" aria-label="MyMarket، صفحه اصلی">
          <span className="public-brand-mark"><BriefcaseBusiness size={19} aria-hidden="true" /></span>
          <span className="public-brand-copy"><strong dir="ltr">MyMarket</strong><small>بازار کار مستقل‌ها</small></span>
        </Link>
        <nav className="public-nav" aria-label="راهنمای صفحه">
          <a href="#roles">برای چه کسانی؟</a>
          <a href="#how-it-works">مراحل همکاری</a>
          <a href="#open-projects">پروژه‌های باز</a>
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
              <a href="#roles" onClick={() => setMobileNavOpen(false)}>برای چه کسانی؟</a>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>مراحل همکاری</a>
              <a href="#open-projects" onClick={() => setMobileNavOpen(false)}>پروژه‌های باز</a>
            </nav>
          )}
        </div>
        <div className="public-header-actions">
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
          <h1 id="public-title">پروژه‌ات را شروع کن؛ همکاری حرفه‌ای بساز.</h1>
          <p>پروژه ثبت کن، پیشنهاد متخصص‌ها را بررسی کن و مسیر همکاری را در یک فضای کاری منظم پیش ببر.</p>
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
          <ResilientImage
            className="public-hero-image"
            src="/images/marketplace.jpg"
            alt="فضای کاری گروهی با اعضای تیم در حال همکاری"
            fetchPriority="high"
            fallback={<BriefcaseBusiness size={32} aria-hidden="true" />}
          />
          <span className="public-hero-visual-caption">از تعریف پروژه تا انتخاب متخصص</span>
        </div>
      </section>

      <section className="public-roles" id="roles" aria-labelledby="roles-title">
        <div className="public-section-heading">
          <div>
            <span>دو مسیر همکاری</span>
            <h2 id="roles-title">شما دنبال چه چیزی هستید؟</h2>
          </div>
          <p>از پروژه‌ای که نیاز دارید یا مهارتی که ارائه می‌کنید شروع کنید.</p>
        </div>
        <div className="public-role-grid">
          <article className="public-role public-role-client">
            <div className="public-role-heading">
              <span className="public-role-icon"><BriefcaseBusiness size={20} aria-hidden="true" /></span>
              <div><span className="public-role-label">برای کارفرماها</span><h3>متخصص مناسب پروژه‌تان را پیدا کنید</h3></div>
              <span className="public-role-index">۰۱</span>
            </div>
            <p>نیازتان را به‌صورت یک پروژه منتشر کنید و پیشنهادهای فریلنسرها را در همان صفحه بررسی کنید.</p>
            <ul>
              <li><Check size={15} aria-hidden="true" /> تعریف شرح و بودجه پروژه</li>
              <li><Check size={15} aria-hidden="true" /> مقایسه پیشنهادهای دریافتی</li>
              <li><Check size={15} aria-hidden="true" /> ادامه گفتگو پس از استخدام</li>
            </ul>
            {canShowAccountActions && (
              <Link to={clientPath} className="public-role-link public-role-link-client">
                {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان کارفرما"}<ArrowUpLeft size={17} aria-hidden="true" />
              </Link>
            )}
          </article>

          <article className="public-role public-role-freelancer">
            <div className="public-role-heading">
              <span className="public-role-icon"><Search size={20} aria-hidden="true" /></span>
              <div><span className="public-role-label">برای فریلنسرها</span><h3>پروژه بعدی‌تان را پیدا کنید</h3></div>
              <span className="public-role-index">۰۲</span>
            </div>
            <p>فرصت‌های باز را پیدا کنید، برای پروژه‌های مناسب پیشنهاد بفرستید و درخواست‌هایتان را پیگیری کنید.</p>
            <ul>
              <li><Check size={15} aria-hidden="true" /> جست‌وجوی پروژه‌های باز</li>
              <li><Check size={15} aria-hidden="true" /> ارسال پیشنهاد متناسب</li>
              <li><Check size={15} aria-hidden="true" /> مدیریت پیشنهادها و پروفایل</li>
            </ul>
            {canShowAccountActions && (
              <Link to={freelancerPath} className="public-role-link public-role-link-freelancer">
                {isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان فریلنسر"}<ArrowUpLeft size={17} aria-hidden="true" />
              </Link>
            )}
          </article>
        </div>
      </section>

      <section className="public-process" id="how-it-works" aria-labelledby="process-title">
        <div className="public-section-heading">
          <div><span>ساده و شفاف</span><h2 id="process-title">شروع همکاری در سه قدم</h2></div>
        </div>
        <div className="public-process-grid">
          <div className="public-process-step"><span>۰۱</span><div><h3>پروژه را منتشر کنید</h3><p>شرح کار و بودجه را مشخص کنید.</p></div></div>
          <div className="public-process-step"><span>۰۲</span><div><h3>پیشنهادها را ببینید</h3><p>پیشنهاد متخصص‌ها را مقایسه کنید.</p></div></div>
          <div className="public-process-step"><span>۰۳</span><div><h3>گفتگو را ادامه دهید</h3><p>پس از استخدام، در صفحه پروژه گفتگو کنید.</p></div></div>
        </div>
      </section>

      <section className="public-projects" id="open-projects" aria-labelledby="open-projects-title">
        <div className="public-projects-heading">
          <div className="public-section-heading">
            <span>فرصت‌های واقعی</span>
            <h2 id="open-projects-title">پروژه‌های باز</h2>
          </div>
          {canShowAccountActions && (
            <Link to={isAuthenticated ? "/dashboard/projects" : registrationPath("freelancer")}>مشاهده فرصت‌ها<ArrowUpLeft size={16} aria-hidden="true" /></Link>
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
        ) : projectState === "success" ? (
          <div className="public-project-list">
            {recent.map((project) => (
              <article className="public-project-item" key={project.id}>
                <div>
                  <span className="public-project-category">{formatProjectCategory(project.category)}</span>
                  <h3>{isAuthenticated
                    ? <Link to={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                    : project.title}</h3>
                  <p>{project.description?.slice?.(0, 150) || "برای این پروژه توضیحی ثبت نشده است."}</p>
                </div>
                <div className="public-project-meta">
                  <strong>{formatCurrencyToToman(project.budget_min)} تا {formatCurrencyToToman(project.budget_max)}</strong>
                  <span>{formatDateIran(project.created_at)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-project-message public-project-empty">
            <FolderOpen size={22} aria-hidden="true" />
            <div>
              <strong>در حال حاضر پروژه بازی برای نمایش نیست.</strong>
              <span>برای دیدن فرصت‌های تازه، بعداً دوباره سر بزنید.</span>
            </div>
            {canShowAccountActions && (
              <Link to={freelancerPath}>{isAuthenticated ? "ورود به فضای کاری" : "شروع به‌عنوان فریلنسر"}<ArrowUpLeft size={15} aria-hidden="true" /></Link>
            )}
          </div>
        )}
      </section>

      <footer className="public-footer">
        <Link className="public-brand" to="/" aria-label="MyMarket، صفحه اصلی">
          <span className="public-brand-mark"><BriefcaseBusiness size={17} aria-hidden="true" /></span>
          <span className="public-brand-copy"><strong dir="ltr">MyMarket</strong><small>بازار کار مستقل‌ها</small></span>
        </Link>
        <span>بازار کار مستقل‌ها</span>
        <div>
          {canShowAccountActions && (isAuthenticated ? (
            <Link to={workspacePath}>ورود به فضای کاری</Link>
          ) : (
            <><Link to="/login">ورود</Link><Link to="/register">ثبت‌نام</Link></>
          ))}
        </div>
      </footer>
    </main>
  );
}
