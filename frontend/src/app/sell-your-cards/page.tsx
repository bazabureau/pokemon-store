"use client";

import { useState, FormEvent } from "react";
import { Camera, Clock, Truck, DollarSign, Upload, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/Toast";
import { submissionsAPI } from "@/lib/api";

const STEPS = [
  {
    icon: Camera,
    number: "01",
    title: "Wyślij zdjęcia",
    description:
      "Zrób wyraźne zdjęcia swoich kart (przód i tył) i wyślij je do nas przez formularz poniżej lub e-mail.",
  },
  {
    icon: Clock,
    number: "02",
    title: "Otrzymaj wycenę",
    description:
      "Nasi eksperci ocenią Twoje karty i wyślą uczciwą ofertę rynkową w ciągu 24 godzin.",
  },
  {
    icon: Truck,
    number: "03",
    title: "Wyślij swoje karty",
    description:
      "Zaakceptuj ofertę i wyślij do nas karty. Zapewniamy opłaconą etykietę wysyłkową.",
  },
  {
    icon: DollarSign,
    number: "04",
    title: "Otrzymaj zapłatę",
    description:
      "Po otrzymaniu i weryfikacji Twoich kart, płatność zostanie wysłana w ciągu 48 godzin wybraną metodą.",
  },
];

const CONDITIONS = [
  { value: "", label: "Wybierz stan..." },
  { value: "mint", label: "Mint / Near Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Dobry" },
  { value: "played", label: "Lekko używany" },
  { value: "poor", label: "Mocno używany / Słaby" },
];

export default function SellYourCardsPage() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    card_name: "",
    set_name: "",
    condition: "",
    quantity: "",
    description: "",
    estimated_value: "",
  });
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.card_name || !form.description) {
      toast.error("Brakujące pola", "Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.phone) formData.append("phone", form.phone);
      formData.append("card_name", form.card_name);
      if (form.set_name) formData.append("set_name", form.set_name);
      if (form.condition) formData.append("condition", form.condition);
      if (form.quantity) formData.append("quantity", form.quantity);
      formData.append("description", form.description);
      if (form.estimated_value) formData.append("estimated_value", form.estimated_value);

      files.forEach((file) => {
        formData.append("images", file);
      });

      await submissionsAPI.create(formData);
      setSubmitted(true);
      toast.success("Zgłoszenie wysłane", "Odezwiemy się w ciągu 24 godzin!");
    } catch (err: any) {
      toast.error("Wysyłanie nieudane", err.message || "Coś poszło nie tak. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        {/* Hero */}
        <div
          className="relative py-16 md:py-24 overflow-hidden"
          style={{
            borderBottom: "1px solid var(--border-default)",
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.06) 0%, transparent 60%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-4"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              [SPRZEDAJ]
            </span>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sprzedaj Swoje
              <br />
              Karty
            </h1>
            <p
              className="text-sm max-w-lg leading-relaxed"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
            >
              Kupujemy karty Pokemon premium w konkurencyjnych cenach. Bez opłat,
              bez problemów -- tylko uczciwe oferty i szybkie płatności.
            </p>
          </div>
        </div>

        {/* Steps */}
        <section
          className="py-16"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-[10px] font-bold tracking-[0.2em] uppercase mb-10"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              Jak to działa
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="p-6 transition-colors duration-100 group"
                    style={{
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-surface)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-subtle)";
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="text-[28px] font-black leading-none"
                        style={{
                          color: "var(--accent)",
                          fontFamily: "var(--font-display)",
                          opacity: 0.3,
                        }}
                      >
                        {step.number}
                      </span>
                      <Icon
                        size={18}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <h3
                      className="text-[13px] font-black uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7">
                <h2
                  className="text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Zgłoś swoje karty
                </h2>

                {submitted ? (
                  <div
                    className="p-8 text-center"
                    style={{ border: "1px solid var(--accent)" }}
                  >
                    <div
                      className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                      style={{
                        background: "var(--accent-soft)",
                        border: "1px solid var(--accent)",
                      }}
                    >
                      <Send
                        size={24}
                        style={{ color: "var(--accent)" }}
                      />
                    </div>
                    <h3
                      className="text-xl font-black uppercase tracking-tight mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Zgłoszenie otrzymane
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Sprawdzimy Twoje zgłoszenie i odezwiemy się
                      w ciągu 24 godzin z ofertą.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Contact info row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Imię *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>E-mail *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>Telefon</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                        style={inputStyle}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    {/* Card details row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Nazwa karty *</label>
                        <input
                          type="text"
                          name="card_name"
                          value={form.card_name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                          placeholder="np. Charizard VMAX"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Nazwa serii</label>
                        <input
                          type="text"
                          name="set_name"
                          value={form.set_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                          placeholder="np. Brilliant Stars"
                        />
                      </div>
                    </div>

                    {/* Condition, Quantity, Estimated Value row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label style={labelStyle}>Stan</label>
                        <select
                          name="condition"
                          value={form.condition}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                          style={inputStyle}
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Ilość</label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Szacowana wartość</label>
                        <input
                          type="text"
                          name="estimated_value"
                          value={form.estimated_value}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                          placeholder="$0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Opis kart *
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                        style={inputStyle}
                        placeholder="Wymień karty, które chcesz sprzedać, wraz z nazwami serii, stanami i informacjami o ocenach..."
                      />
                    </div>

                    {/* File upload area */}
                    <div>
                      <label style={labelStyle}>Zdjęcia kart</label>
                      <div
                        className="relative p-8 text-center cursor-pointer transition-colors duration-100"
                        style={{
                          border: `2px dashed ${dragActive ? "var(--accent)" : "var(--border-default)"}`,
                          background: dragActive
                            ? "var(--accent-soft)"
                            : "var(--bg-surface)",
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() =>
                          document.getElementById("file-input")?.click()
                        }
                      >
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                        <Upload
                          size={24}
                          style={{ color: "var(--text-muted)" }}
                          className="mx-auto mb-3"
                        />
                        <p
                          className="text-[12px] mb-1"
                          style={{
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Przeciągnij i upuść zdjęcia tutaj lub kliknij, aby przeglądać
                        </p>
                        <p
                          className="text-[10px]"
                          style={{
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          JPG, PNG do 10MB każdy
                        </p>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {files.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between px-3 py-2"
                              style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                              }}
                            >
                              <span
                                className="text-[11px] truncate"
                                style={{
                                  color: "var(--text-secondary)",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(idx);
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider ml-3 transition-colors duration-100"
                                style={{
                                  color: "var(--text-muted)",
                                  fontFamily: "var(--font-mono)",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--error)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--text-muted)")
                                }
                              >
                                Usuń
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
                      style={{
                        background: "var(--accent)",
                        color: "#000",
                        fontFamily: "var(--font-mono)",
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) e.currentTarget.style.background = "#FFF";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "var(--accent)")
                      }
                    >
                      {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                    </button>
                  </form>
                )}
              </div>

              {/* Sidebar info */}
              <div className="lg:col-span-5">
                <div
                  className="lg:sticky lg:top-[90px]"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  <div
                    className="px-5 py-4"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <h3
                      className="text-[11px] font-black tracking-[0.15em] uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Co kupujemy
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      "Karty ocenione (PSA, CGC, Beckett)",
                      "Surowe karty vintage (era WOTC)",
                      "Nowoczesne karty chase i alt arty",
                      "Zapakowane boxy booster i ETB",
                      "Kompletne lub prawie kompletne zestawy",
                      "Duże partie (500+ kart)",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <div
                          className="w-1 h-1 mt-1.5 shrink-0"
                          style={{ background: "var(--accent)" }}
                        />
                        <span
                          className="text-[12px]"
                          style={{
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="px-5 py-4"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    <p
                      className="text-[11px] mb-2"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Wolisz e-mail? Napisz do nas bezpośrednio:
                    </p>
                    <a
                      href="mailto:sell@collectify.pl"
                      className="text-[13px] font-bold transition-colors duration-100"
                      style={{
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#FFF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                      }
                    >
                      sell@collectify.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
