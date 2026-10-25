import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, FileText, LogOut, Menu, MessageCircle, Plus, Search, UserRound, X } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import UserAvatar from "./UserAvatar";
import { canCreateProject } from "../utils/profileCompletion";

function getPageTitle(pathname) {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "نمای کلی";
  if (pathname.endsWith("/projects/create")) return "ساخت پروژه";
  if (/\/projects\/\d+\/edit$/.test(pathname)) return "ویرایش پروژه";
  if (/\/projects\/\d+$/.test(pathname)) return "جزئیات پروژه";
  if (pathname.endsWith("/projects")) return "پروژه‌ها";
  if (pathname.endsWith("/proposals")) return "پیشنهادها";
  if (pathname.endsWith("/messages")) return "پیام‌ها";
  if (pathname.endsWith("/profile")) return "پروفایل";
  return "فضای کاری";
}

export default function WorkspaceHeader({ sidebarOpen, onToggleSidebar }) {
  const { user: rawUser, logout } = useContext(AuthContext);
  const user = rawUser?.user ?? rawUser;
  const isClient = user?.user_type === "client";
  const canCreate = canCreateProject(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const displayName = user?.first_name || user?.username || "حساب کاربری";

  return (
    <header className="workspace-header">
      <div className="workspace-header-start">
        <button
          className="workspace-menu-toggle"
          type="button"
          aria-label={sidebarOpen ? "بستن فهرست" : "باز کردن فهرست"}
          aria-expanded={sidebarOpen}
          aria-controls="workspace-navigation"
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <Link className="workspace-brand" to="/dashboard" aria-label="همکار، نمای کلی">
          <span className="workspace-brand-mark"><BriefcaseBusiness size={17} /></span>
          <span>Hamkar</span>
        </Link>
        <span className="workspace-current-page" aria-current="page">{pageTitle}</span>
      </div>

      <div className="workspace-header-actions">
        <Link
          className="workspace-primary-action"
          to={isClient ? (canCreate ? "/dashboard/projects/create" : "/dashboard/profile") : "/dashboard/projects"}
        >
          {isClient ? (canCreate ? <Plus size={17} aria-hidden="true" /> : <UserRound size={17} aria-hidden="true" />) : <Search size={17} aria-hidden="true" />}
          <span>{isClient ? (canCreate ? "ساخت پروژه" : "تکمیل پروفایل") : "جستجوی پروژه"}</span>
        </Link>
        <Link className="workspace-icon-link" to="/dashboard/messages" aria-label="پیام‌ها" title="پیام‌ها">
          <MessageCircle size={19} aria-hidden="true" />
        </Link>
        <div className="workspace-user-menu" ref={menuRef}>
          <button
            className="workspace-user-button"
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <UserAvatar src={user?.avatar} size={34} alt="" />
            <span className="workspace-user-name">{displayName}</span>
          </button>
          {menuOpen && (
            <div className="workspace-user-dropdown" role="menu">
              <div className="workspace-user-summary">
                <span>{displayName}</span>
                <span>{isClient ? "کارفرما" : "فریلنسر"}</span>
              </div>
              <Link role="menuitem" to="/dashboard/profile" onClick={() => setMenuOpen(false)}>
                <UserRound size={17} aria-hidden="true" /> پروفایل
              </Link>
              {!isClient && (
                <Link role="menuitem" to="/dashboard/proposals" onClick={() => setMenuOpen(false)}>
                  <FileText size={17} aria-hidden="true" /> پیشنهادهای من
                </Link>
              )}
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut size={17} aria-hidden="true" /> خروج از حساب
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}