"use client";

import { useState, useEffect, FormEvent, CSSProperties } from "react";
import Link from "next/link";
import {
  LogOut,
  Package,
  User,
  Mail,
  Clock,
  Eye,
  EyeOff,
  ShoppingBag,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Edit3,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ordersAPI, authAPI, Order } from "@/lib/api";

/* ─── Helpers ─── */

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Oczekujące", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  confirmed: { label: "Potwierdzone", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  processing: { label: "W realizacji", color: "#FF6B2C", bg: "rgba(255,107,44,0.1)" },
  shipped: { label: "Wysłane", color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
  delivered: { label: "Dostarczone", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  cancelled: { label: "Anulowane", color: "#F87171", bg: "rgba(248,113,113,0.1)" },
};

/* ─── Shared Styles ─── */

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "8px",
  display: "block",
};

const inputBaseStyle: CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  letterSpacing: "0.03em",
  width: "100%",
  padding: "12px 14px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

/* ─── Password Input ─── */

function PasswordInput({
  value,
  onChange,
  placeholder,
  name,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        required
        style={{
          ...inputBaseStyle,
          paddingRight: "44px",
          borderColor: focused ? "var(--accent)" : "var(--border-default)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ─── Text Input with Focus ─── */

function TextInput({
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  required = true,
  error,
}: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        required={required}
        style={{
          ...inputBaseStyle,
          borderColor: error
            ? "#F87171"
            : focused
            ? "var(--accent)"
            : "var(--border-default)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "#F87171",
            marginTop: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Primary Button ─── */

function PrimaryButton({
  children,
  loading,
  type = "submit",
  onClick,
  fullWidth = true,
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "14px 28px",
        fontSize: "11px",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        fontFamily: "var(--font-mono)",
        background: loading ? "var(--text-muted)" : hovered ? "#FFFFFF" : "var(--accent)",
        color: "#000000",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
}

/* ─── Animated Tab Switcher ─── */

function AuthTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}) {
  return (
    <div style={{ position: "relative", display: "flex", marginBottom: "32px" }}>
      {(["login", "register"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            flex: 1,
            padding: "14px 0",
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-mono)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
            transition: "color 0.3s ease",
            position: "relative",
          }}
        >
          {tab === "login" ? "Zaloguj sie" : "Zarejestruj sie"}
        </button>
      ))}
      {/* Animated underline */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "2px",
          background: "var(--border-subtle)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: activeTab === "login" ? "0%" : "50%",
          width: "50%",
          height: "2px",
          background: "var(--accent)",
          transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}

/* ─── Login Form ─── */

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!username.trim()) {
      setErrors((prev) => ({ ...prev, username: "Pole wymagane" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Pole wymagane" }));
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success("Witaj ponownie!", "Zalogowano pomyslnie");
      onSuccess();
    } catch (err: any) {
      toast.error("Logowanie nieudane", err.message || "Nieprawidlowe dane logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={labelStyle}>Nazwa uzytkownika</label>
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Wpisz nazwe uzytkownika"
          error={errors.username}
        />
      </div>
      <div>
        <label style={labelStyle}>Haslo</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wpisz haslo"
        />
        {errors.password && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
            {errors.password}
          </p>
        )}
      </div>
      <PrimaryButton loading={loading}>
        {loading ? "Logowanie..." : "Zaloguj sie"}
        {!loading && <ArrowRight size={14} />}
      </PrimaryButton>
    </form>
  );
}

/* ─── Register Form ─── */

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "Pole wymagane";
    if (!form.email.trim()) newErrors.email = "Pole wymagane";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Nieprawidlowy adres e-mail";
    if (!form.password) newErrors.password = "Pole wymagane";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 znakow";
    if (form.password !== form.password2) newErrors.password2 = "Hasla nie sa takie same";
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Konto utworzone!", "Witaj w Collectify!");
      onSuccess();
    } catch (err: any) {
      toast.error("Rejestracja nieudana", err.message || "Sprobuj ponownie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={labelStyle}>Nazwa uzytkownika</label>
        <TextInput
          value={form.username}
          onChange={handleChange}
          name="username"
          placeholder="Wybierz nazwe uzytkownika"
          error={errors.username}
        />
      </div>
      <div>
        <label style={labelStyle}>E-mail</label>
        <TextInput
          type="email"
          value={form.email}
          onChange={handleChange}
          name="email"
          placeholder="twoj@email.com"
          error={errors.email}
        />
      </div>
      <div>
        <label style={labelStyle}>Haslo</label>
        <PasswordInput
          value={form.password}
          onChange={handleChange}
          name="password"
          placeholder="Minimum 6 znakow"
        />
        {errors.password && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
            {errors.password}
          </p>
        )}
      </div>
      <div>
        <label style={labelStyle}>Potwierdz haslo</label>
        <PasswordInput
          value={form.password2}
          onChange={handleChange}
          name="password2"
          placeholder="Wpisz haslo ponownie"
        />
        {errors.password2 && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
            {errors.password2}
          </p>
        )}
      </div>
      <PrimaryButton loading={loading}>
        {loading ? "Tworzenie konta..." : "Utworz konto"}
        {!loading && <ArrowRight size={14} />}
      </PrimaryButton>
    </form>
  );
}

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "var(--text-secondary)",
    bg: "rgba(255,255,255,0.04)",
  };

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: config.color,
        background: config.bg,
        padding: "4px 10px",
        border: `1px solid ${config.color}22`,
      }}
    >
      {config.label}
    </span>
  );
}

/* ─── Order Card ─── */

function OrderCard({ order, isLast }: { order: Order; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/order-confirmation/${order.id}`}
      style={{
        display: "block",
        padding: "20px 24px",
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
        background: hovered ? "var(--bg-surface)" : "transparent",
        transition: "background 0.15s ease",
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          #{order.order_number}
        </span>
        <StatusBadge status={order.status} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={11} style={{ color: "var(--text-muted)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            {formatDate(order.created_at)}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          {formatPrice(order.total)}
        </span>
      </div>
      {order.items && order.items.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            {order.items.length} {order.items.length === 1 ? "produkt" : order.items.length < 5 ? "produkty" : "produktow"}
          </span>
        </div>
      )}
    </Link>
  );
}

/* ─── Skeleton Loaders ─── */

function OrderSkeleton() {
  return (
    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div
          style={{
            height: "14px",
            width: "100px",
            background: "var(--bg-elevated)",
            borderRadius: "2px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: "20px",
            width: "80px",
            background: "var(--bg-elevated)",
            borderRadius: "2px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            height: "12px",
            width: "140px",
            background: "var(--bg-elevated)",
            borderRadius: "2px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: "14px",
            width: "70px",
            background: "var(--bg-elevated)",
            borderRadius: "2px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
      <div style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        <div
          style={{
            height: "40px",
            width: "300px",
            background: "var(--bg-elevated)",
            marginBottom: "12px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: "16px",
            width: "200px",
            background: "var(--bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Profile Edit Section ─── */

function ProfileSection({ user }: { user: any }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      toast.success("Zaktualizowano", "Profil zostal zapisany");
      setEditing(false);
    } catch (err: any) {
      toast.error("Blad", err.message || "Nie udalo sie zapisac profilu");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
    setEditing(false);
  };

  return (
    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Profil
        </h2>
        {!editing ? (
          <EditButton onClick={() => setEditing(true)} />
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleCancel}
              style={{
                background: "none",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <X size={12} /> Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: "var(--accent)",
                border: "none",
                color: "#000",
                cursor: saving ? "not-allowed" : "pointer",
                padding: "6px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={12} />}
              Zapisz
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        {/* Avatar + Username */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,107,44,0.08)",
              border: "1px solid rgba(255,107,44,0.3)",
              flexShrink: 0,
            }}
          >
            <User size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 800,
                margin: "0 0 2px 0",
              }}
            >
              {user?.first_name || user?.username}{" "}
              {user?.last_name || ""}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              @{user?.username}
            </p>
          </div>
        </div>

        {/* Fields */}
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Imie</label>
                <TextInput
                  value={form.first_name}
                  onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                  required={false}
                />
              </div>
              <div>
                <label style={labelStyle}>Nazwisko</label>
                <TextInput
                  value={form.last_name}
                  onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                  required={false}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <InfoRow icon={<Mail size={14} />} label="E-mail" value={user?.email || "Nie podano"} />
            <InfoRow icon={<User size={14} />} label="Imie" value={user?.first_name || "Nie podano"} />
            <InfoRow icon={<User size={14} />} label="Nazwisko" value={user?.last_name || "Nie podano"} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>{icon}</div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 2px 0",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border-default)"}`,
        color: hovered ? "var(--accent)" : "var(--text-secondary)",
        cursor: "pointer",
        padding: "6px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Edit3 size={12} /> Edytuj
    </button>
  );
}

/* ─── Change Password Section ─── */

function ChangePasswordSection() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error("Blad", "Nowe hasla nie sa takie same");
      return;
    }
    if (form.new_password.length < 6) {
      toast.error("Blad", "Nowe haslo musi miec minimum 6 znakow");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });
      toast.success("Sukces", "Haslo zostalo zmienione");
      setForm({ old_password: "", new_password: "", confirm: "" });
      setOpen(false);
    } catch (err: any) {
      toast.error("Blad", err.message || "Nie udalo sie zmienic hasla");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Lock size={14} style={{ color: "var(--text-muted)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Zmien haslo
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "0 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "20px",
          }}
        >
          <div>
            <label style={labelStyle}>Aktualne haslo</label>
            <PasswordInput
              value={form.old_password}
              onChange={(e) => setForm((p) => ({ ...p, old_password: e.target.value }))}
              name="old_password"
            />
          </div>
          <div>
            <label style={labelStyle}>Nowe haslo</label>
            <PasswordInput
              value={form.new_password}
              onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))}
              name="new_password"
            />
          </div>
          <div>
            <label style={labelStyle}>Potwierdz nowe haslo</label>
            <PasswordInput
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              name="confirm"
            />
          </div>
          <PrimaryButton loading={loading} fullWidth={false}>
            {loading ? "Zmiana..." : "Zmien haslo"}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        padding: "20px 24px",
        border: `1px solid ${hovered ? "rgba(255,107,44,0.2)" : "var(--border-subtle)"}`,
        background: hovered ? "rgba(255,107,44,0.02)" : "var(--bg-surface)",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        minWidth: "200px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,107,44,0.08)",
          border: "1px solid rgba(255,107,44,0.15)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 4px 0",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 800,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Logout Button ─── */

function LogoutButton({ onClick, mobile }: { onClick: () => void; mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        display: mobile ? "flex" : undefined,
        alignItems: "center",
        gap: "8px",
        padding: mobile ? "14px 0" : "8px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        background: "none",
        border: mobile ? "none" : `1px solid ${hovered ? "#F87171" : "var(--border-default)"}`,
        color: hovered ? "#F87171" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        width: mobile ? "100%" : "auto",
        justifyContent: mobile ? "center" : undefined,
        borderTop: mobile ? "1px solid var(--border-subtle)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <LogOut size={13} />
      Wyloguj sie
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────── */

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setOrdersLoading(true);
      ordersAPI
        .list()
        .then((data) => setOrders(data.results ?? []))
        .catch((err) => setOrdersError(err.message || "Nie udalo sie wczytac zamowien"))
        .finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.info("Wylogowano", "Do zobaczenia!");
  };

  /* ─── Loading State ─── */
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Header />
        <main style={{ paddingTop: "72px" }}>
          <DashboardSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     NOT AUTHENTICATED — Login / Register
     ═══════════════════════════════════════════════ */
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Header />
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .auth-branding-panel { display: none !important; }
          @media (min-width: 1024px) {
            .auth-branding-panel { display: flex !important; }
          }
          .auth-mobile-heading { display: block; }
          @media (min-width: 1024px) {
            .auth-mobile-heading { display: none; }
          }
        `}</style>
        <main style={{ paddingTop: "72px" }}>
          <div
            style={{
              minHeight: "calc(100vh - 72px)",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            {/* ─── Left Panel: Branding ─── */}
            <div
              className="auth-branding-panel"
              style={{
                flex: "1 1 50%",
                position: "relative",
                overflow: "hidden",
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-subtle)",
              }}
            >
              {/* Background gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 30% 50%, rgba(255,107,44,0.06) 0%, transparent 70%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(255,107,44,0.03) 100%)",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "80px 60px",
                  animation: mounted ? "fadeIn 0.8s ease" : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: "20px",
                  }}
                >
                  [COLLECTIFY]
                </span>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(32px, 4vw, 56px)",
                    fontWeight: 900,
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                    margin: "0 0 24px 0",
                    color: "var(--text-primary)",
                  }}
                >
                  Twoja kolekcja
                  <br />
                  <span style={{ color: "var(--accent)" }}>zaczyna sie</span>
                  <br />
                  tutaj.
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                    maxWidth: "400px",
                    margin: 0,
                  }}
                >
                  Dolacz do spolecznosci kolekcjonerow.
                  Odkrywaj rzadkie karty, sledz swoje zamowienia
                  i buduj kolekcje marzen.
                </p>

                {/* Decorative elements */}
                <div style={{ marginTop: "60px", display: "flex", gap: "40px" }}>
                  {[
                    { num: "10K+", label: "Kart" },
                    { num: "2K+", label: "Kolekcjonerow" },
                    { num: "99%", label: "Zadowolonych" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "24px",
                          fontWeight: 800,
                          color: "var(--text-primary)",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {stat.num}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--text-muted)",
                          margin: 0,
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "60px",
                    right: "60px",
                    height: "1px",
                    background:
                      "linear-gradient(90deg, var(--accent), transparent)",
                    opacity: 0.3,
                  }}
                />
              </div>
            </div>

            {/* ─── Right Panel: Form ─── */}
            <div
              style={{
                flex: "1 1 50%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 24px",
                minHeight: "calc(100vh - 72px)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  animation: mounted ? "fadeInUp 0.6s ease" : "none",
                }}
              >
                {/* Mobile-only heading */}
                <div className="auth-mobile-heading" style={{ marginBottom: "32px", textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    [COLLECTIFY]
                  </span>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "28px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    Moje konto
                  </h1>
                </div>

                <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === "login" ? (
                  <div key="login" style={{ animation: "fadeIn 0.3s ease" }}>
                    <LoginForm onSuccess={() => {}} />
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        marginTop: "24px",
                      }}
                    >
                      Nie masz konta?{" "}
                      <button
                        onClick={() => setActiveTab("register")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        Zarejestruj sie
                      </button>
                    </p>
                  </div>
                ) : (
                  <div key="register" style={{ animation: "fadeIn 0.3s ease" }}>
                    <RegisterForm onSuccess={() => {}} />
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        marginTop: "24px",
                      }}
                    >
                      Masz juz konto?{" "}
                      <button
                        onClick={() => setActiveTab("login")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        Zaloguj sie
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     AUTHENTICATED — User Dashboard
     ═══════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Header />
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .dashboard-grid { grid-template-columns: 1fr; }
        @media (min-width: 1024px) {
          .dashboard-grid { grid-template-columns: 380px 1fr; }
        }
        .desktop-only { display: none; }
        @media (min-width: 640px) {
          .desktop-only { display: block; }
        }
        .mobile-only { display: block; }
        @media (min-width: 640px) {
          .mobile-only { display: none; }
        }
      `}</style>
      <main style={{ paddingTop: "72px" }}>
        {/* ─── Hero Section ─── */}
        <div
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.05) 0%, transparent 60%)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "48px 24px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              animation: mounted ? "fadeInUp 0.5s ease" : "none",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                [PANEL UZYTKOWNIKA]
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Witaj, {user?.first_name || user?.username}
              </h1>
            </div>
            <div className="desktop-only">
              <LogoutButton onClick={handleLogout} />
            </div>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "32px 24px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              animation: mounted ? "fadeInUp 0.6s ease" : "none",
            }}
          >
            <StatCard
              icon={<ShoppingBag size={18} style={{ color: "var(--accent)" }} />}
              label="Zamowienia"
              value={ordersLoading ? "..." : String(orders.length)}
            />
            <StatCard
              icon={<Calendar size={18} style={{ color: "var(--accent)" }} />}
              label="Czlonek od"
              value={
                user?.id
                  ? new Date().toLocaleDateString("pl-PL", {
                      month: "long",
                      year: "numeric",
                    })
                  : "..."
              }
            />
          </div>
        </div>

        {/* ─── Main Content Grid ─── */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "32px 24px 60px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
            }}
            className="dashboard-grid"
          >
            {/* ─── Left Column ─── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                animation: mounted ? "fadeInUp 0.7s ease" : "none",
              }}
            >
              <ProfileSection user={user} />
              <ChangePasswordSection />

              {/* Mobile logout */}
              <div className="mobile-only">
                <LogoutButton onClick={handleLogout} mobile />
              </div>
            </div>

            {/* ─── Right Column: Orders ─── */}
            <div style={{ animation: mounted ? "fadeInUp 0.8s ease" : "none" }}>
              <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                {/* Header */}
                <div
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Historia zamowien
                  </h2>
                  {orders.length > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        background: "var(--bg-elevated)",
                        padding: "4px 10px",
                      }}
                    >
                      {orders.length}
                    </span>
                  )}
                </div>

                {/* Content */}
                {ordersLoading ? (
                  <div>
                    {[1, 2, 3].map((i) => (
                      <OrderSkeleton key={i} />
                    ))}
                  </div>
                ) : ordersError ? (
                  <div style={{ padding: "32px 24px", textAlign: "center" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "#F87171",
                      }}
                    >
                      {ordersError}
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: "60px 24px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <Package size={28} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Brak zamowien
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        margin: "0 0 24px 0",
                      }}
                    >
                      Zacznij kolekcjonowac juz dzis!
                    </p>
                    <BrowseButton />
                  </div>
                ) : (
                  <div>
                    {orders.map((order, idx) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isLast={idx === orders.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Browse Cards Button ─── */

function BrowseButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/single-cards"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        textDecoration: "none",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border-default)"}`,
        color: hovered ? "#000" : "var(--accent)",
        background: hovered ? "var(--accent)" : "transparent",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Przegladaj karty
      <ArrowRight size={14} />
    </Link>
  );
}
