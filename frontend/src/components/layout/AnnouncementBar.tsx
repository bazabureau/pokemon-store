"use client";

const ANNOUNCEMENTS = [
  "DARMOWA WYSYŁKA OD 500 PLN",
  "NOWE SLABY CO TYDZIEŃ",
  "PRZELEWY24 + BLIK",
  "INPOST PACZKOMATY",
];

export default function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 overflow-hidden py-2"
      style={{
        background: "var(--accent)",
        borderBottom: "1px solid rgba(0,0,0,0.2)",
      }}
    >
      <div className="announcement-scroll flex whitespace-nowrap">
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map(
          (text, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-6 text-[10px] font-bold tracking-[0.15em] uppercase shrink-0"
              style={{
                color: "#000000",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span className="shrink-0">//</span>
              {text}
            </span>
          )
        )}
      </div>
    </div>
  );
}
