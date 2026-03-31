"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { productsAPI, Product } from "@/lib/api";

const NAV_ITEMS = [
  {
    label: "Karty Pojedyncze",
    href: "/single-cards",
    megaMenu: {
      columns: [
        {
          title: "Wg generacji",
          links: [
            { label: "Pierwsza generacja", href: "/single-cards?generation=first" },
            { label: "Druga generacja", href: "/single-cards?generation=second" },
            { label: "Trzecia generacja", href: "/single-cards?generation=third" },
          ],
        },
        {
          title: "Wg stanu",
          links: [
            { label: "Near Mint", href: "/single-cards?condition=near-mint" },
            { label: "Excellent", href: "/single-cards?condition=excellent" },
            { label: "Light Played", href: "/single-cards?condition=light-played" },
          ],
        },
      ],
    },
  },
  { label: "Zapakowane", href: "/sealed-products" },
  {
    label: "Slaby",
    href: "/slabs",
    megaMenu: {
      columns: [
        {
          title: "Firma",
          links: [
            { label: "PSA", href: "/slabs?company=psa" },
            { label: "CGC", href: "/slabs?company=cgc" },
            { label: "Beckett", href: "/slabs?company=beckett" },
          ],
        },
        {
          title: "Ocena",
          links: [
            { label: "10 — Gem Mint", href: "/slabs?grade=10" },
            { label: "9 — Mint", href: "/slabs?grade=9" },
            { label: "8 — Near Mint", href: "/slabs?grade=8" },
          ],
        },
      ],
    },
  },
  { label: "Bestsellery", href: "/bestsellers" },
  { label: "Ochrona", href: "/protection-storage" },
  { label: "Sprzedaj", href: "/sell-your-cards" },
];

export default function Header() {
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const megaTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsAPI.search(value.trim());
        setSearchResults((res.results || []).slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  // Reset search state when closing
  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [searchOpen]);

  const handleMegaEnter = (label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setActiveMega(label);
  };

  const handleMegaLeave = () => {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 200);
  };

  return (
    <>
      <header
        className="fixed top-[28px] left-0 right-0 z-40 transition-colors duration-150"
        style={{
          background: scrolled ? "rgba(5,5,5,0.97)" : "rgba(5,5,5,0.8)",
          borderBottom: `1px solid ${scrolled ? "var(--border-default)" : "transparent"}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link href="/" className="relative z-10 shrink-0">
              <span
                className="text-lg font-black tracking-tighter uppercase"
                style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}
              >
                Collectify
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-0 ml-10">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && handleMegaEnter(item.label)}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-3 py-2 text-[12px] font-medium tracking-[0.08em] uppercase transition-colors duration-100"
                    style={{
                      color: activeMega === item.label ? "var(--accent)" : "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = activeMega === item.label ? "var(--accent)" : "var(--text-secondary)")}
                  >
                    {item.label}
                    {item.megaMenu && (
                      <ChevronDown
                        size={10}
                        style={{
                          transform: activeMega === item.label ? "rotate(180deg)" : "rotate(0)",
                          transition: "transform 0.15s",
                        }}
                      />
                    )}
                  </Link>

                  {/* Mega Menu — brutalist: no rounded corners, solid borders */}
                  {item.megaMenu && (
                    <div
                      className="absolute top-full left-0 pt-0 pointer-events-none"
                    >
                      <div
                        className="pointer-events-auto overflow-hidden transition-all duration-150"
                        style={{
                          opacity: activeMega === item.label ? 1 : 0,
                          transform: activeMega === item.label ? "translateY(0)" : "translateY(-4px)",
                          visibility: activeMega === item.label ? "visible" : "hidden",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-default)",
                          borderTop: "2px solid var(--accent)",
                          minWidth: "380px",
                        }}
                      >
                        <div className="flex gap-8 p-5">
                          {item.megaMenu.columns.map((col) => (
                            <div key={col.title} className="min-w-[140px]">
                              <h4
                                className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3"
                                style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                              >
                                {col.title}
                              </h4>
                              <ul className="space-y-1">
                                {col.links.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      href={link.href}
                                      className="block text-[13px] py-1 transition-colors duration-100 hover:text-[var(--text-primary)]"
                                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 transition-colors duration-100 hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Szukaj"
              >
                <Search size={16} strokeWidth={2} />
              </button>
              <Link
                href="/favourites"
                className="p-2.5 transition-colors duration-100 hidden sm:block hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Ulubione"
              >
                <Heart size={16} strokeWidth={2} />
              </Link>
              <Link
                href="/cart"
                className="p-2.5 transition-colors duration-100 relative hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Koszyk"
              >
                <ShoppingBag size={16} strokeWidth={2} />
                {itemCount > 0 && (
                  <span
                    className="absolute top-1 right-1 flex items-center justify-center text-[9px] font-bold leading-none"
                    style={{
                      background: "var(--accent)",
                      color: "var(--bg-void)",
                      width: itemCount > 9 ? "16px" : "14px",
                      height: "14px",
                      borderRadius: "7px",
                    }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                className="p-2.5 transition-colors duration-100 hidden sm:block hover:text-[var(--accent)]"
                style={{ color: isAuthenticated ? "var(--accent)" : "var(--text-muted)" }}
                aria-label="Konto"
              >
                <User size={16} strokeWidth={2} />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 transition-colors duration-100 lg:hidden hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search — full width, raw */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl mx-4 animate-fade-in-up">
            <div
              className="relative overflow-hidden"
              style={{ background: "var(--bg-surface)", border: "2px solid var(--border-strong)" }}
            >
              <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="SZUKAJ..."
                className="w-full py-4 pl-12 pr-4 bg-transparent text-[13px] outline-none uppercase tracking-wider"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border-default)" }}
              >
                ESC
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "2px solid var(--border-strong)",
                  borderTop: "none",
                }}
              >
                {searchLoading && (
                  <div
                    className="px-4 py-3 text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    Wyszukiwanie...
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && (
                  <div
                    className="px-4 py-3 text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    Brak wyników
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between px-4 py-3 transition-colors duration-100"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span
                            className="text-[13px] font-medium truncate"
                            style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                          >
                            {product.name}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                          >
                            {product.product_type}
                          </span>
                        </div>
                        <span
                          className="text-[13px] font-bold shrink-0 ml-4"
                          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                        >
                          ${product.price}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchOpen(false)}
                      className="block px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center transition-colors duration-100"
                      style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Zobacz wszystkie wyniki &rarr;
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 pt-[92px] lg:hidden"
          style={{ background: "var(--bg-void)" }}
        >
          <nav className="p-6 space-y-0">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-3 text-base font-bold uppercase tracking-wider"
                style={{
                  color: "var(--text-secondary)",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontFamily: "var(--font-display)",
                  animationDelay: `${i * 0.03}s`,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
