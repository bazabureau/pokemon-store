"use client";

import { useState } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  resultCount?: number;
}

export default function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v.length > 0
  );

  const toggleOption = (filterKey: string, optionValue: string) => {
    const current = activeFilters[filterKey] || [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onFilterChange(filterKey, next);
  };

  return (
    <div
      className="sticky top-[72px] z-20 py-4"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter icon */}
          <div
            className="flex items-center gap-1.5 mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium tracking-wider uppercase hidden sm:inline">
              Filters
            </span>
          </div>

          {/* Filter pills */}
          {filters.map((filter) => {
            const isOpen = openDropdown === filter.key;
            const activeCount = (activeFilters[filter.key] || []).length;

            return (
              <div key={filter.key} className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : filter.key)
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200"
                  style={{
                    background:
                      activeCount > 0
                        ? "var(--accent-soft)"
                        : "transparent",
                    border: `1px solid ${
                      activeCount > 0
                        ? "var(--border-accent)"
                        : "var(--border-default)"
                    }`,
                    color:
                      activeCount > 0
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                  }}
                >
                  {filter.label}
                  {activeCount > 0 && (
                    <span
                      className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{
                        background: "var(--accent)",
                        color: "white",
                      }}
                    >
                      {activeCount}
                    </span>
                  )}
                  <ChevronDown
                    size={12}
                    className="transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div
                      className="absolute top-full left-0 mt-2 min-w-[180px] rounded-xl overflow-hidden z-20 animate-fade-in-up"
                      style={{
                        background: "rgba(20,20,20,0.98)",
                        border: "1px solid var(--border-default)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                        animationDuration: "0.2s",
                      }}
                    >
                      <div className="p-2 space-y-0.5">
                        {filter.options.map((option) => {
                          const isActive = (
                            activeFilters[filter.key] || []
                          ).includes(option.value);

                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                toggleOption(filter.key, option.value)
                              }
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors duration-150"
                              style={{
                                color: isActive
                                  ? "var(--text-primary)"
                                  : "var(--text-secondary)",
                                background: isActive
                                  ? "var(--accent-soft)"
                                  : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive)
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.04)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive)
                                  e.currentTarget.style.background =
                                    "transparent";
                              }}
                            >
                              {/* Checkbox */}
                              <div
                                className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors duration-150"
                                style={{
                                  border: isActive
                                    ? "none"
                                    : "1px solid var(--border-strong)",
                                  background: isActive
                                    ? "var(--accent)"
                                    : "transparent",
                                }}
                              >
                                {isActive && (
                                  <svg
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                  >
                                    <path
                                      d="M1 4l2.5 2.5L9 1"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Active filter tags + clear */}
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <X size={12} />
              Clear all
            </button>
          )}

          {/* Result count */}
          {resultCount !== undefined && (
            <span
              className="ml-auto text-xs tabular-nums"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {resultCount} products
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
