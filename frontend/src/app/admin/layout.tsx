"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Inbox,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !(user as any)?.is_staff)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-void)" }}
      >
        <div
          className="text-[12px] font-bold uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !(user as any)?.is_staff) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-void)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "240px",
          background: "var(--bg-primary)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 h-[56px] shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="text-[14px] font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Collectify
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
              }}
            >
              Admin
            </span>
          </Link>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hovered = hoveredLink === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-100"
                style={{
                  background: active
                    ? "rgba(255,107,44,0.1)"
                    : hovered
                    ? "var(--bg-surface)"
                    : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  marginLeft: active ? "0" : "0",
                }}
                onMouseEnter={() => setHoveredLink(item.href)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Icon
                  size={16}
                  style={{
                    color: active ? "var(--accent)" : "var(--text-muted)",
                  }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <ChevronRight
                    size={12}
                    className="ml-auto"
                    style={{ color: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "50%",
              }}
            >
              <span
                className="text-[10px] font-black uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
              >
                {user?.username?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] font-bold truncate"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
              >
                {user?.username}
              </p>
              <p
                className="text-[9px] truncate"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                Staff
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 transition-colors duration-100"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-[56px] flex items-center px-4 sm:px-6 shrink-0"
          style={{
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <button
            className="lg:hidden p-2 mr-3"
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--text-muted)" }}
          >
            <Menu size={18} />
          </button>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            {NAV_ITEMS.find((n) => isActive(n.href))?.label || "Admin"}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              View Store
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
