import { Link, useLocation } from "@tanstack/react-router";
import { Bell, GraduationCap } from "lucide-react";
import { useNotifications } from "../hooks/useQueries";

export default function StudentNav() {
  const { pathname } = useLocation();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.length ?? 0;

  const links = [
    { to: "/", label: "Home" },
    { to: "/announcements", label: "Announcements" },
    { to: "/notifications", label: "Notifications" },
    { to: "/about", label: "About" },
    { to: "/query", label: "Help" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-nav">
      {/* Brand bar */}
      <div className="bg-navy text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/gmck-seal-transparent.dim_200x200.png"
            alt="GMC Khammam Seal"
            className="w-12 h-12 rounded-full bg-white/10 p-0.5"
          />
          <div>
            <div className="text-2xl font-bold tracking-wide font-display">
              GMCK
            </div>
            <div className="text-xs text-white/70">
              Government Medical College, Khammam · Student Tracking Portal
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
            <GraduationCap size={16} />
            <span>Student Portal</span>
          </div>
        </div>
      </div>
      {/* Nav links */}
      <nav className="bg-navy-dark px-6 flex items-center gap-1 border-t border-white/10">
        {links.map((link) => {
          const isActive =
            pathname === link.to ||
            (link.to !== "/" && pathname.startsWith(link.to));
          return (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}.link`}
              className={`px-4 py-3 text-sm font-medium transition-colors rounded-t-md ${
                isActive
                  ? "bg-primary text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="ml-auto">
          <Link
            to="/admin/login"
            className="text-white/40 hover:text-white/60 text-xs px-3 py-3 block transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
