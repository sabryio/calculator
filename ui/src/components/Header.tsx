/**
 * Header + navigation flyout, Windows-calculator style: the hamburger opens a full-height
 * overlay panel over the calculator surface with Calculator/Converter sections and Settings
 * pinned at the bottom. Only Standard is live; every other entry is honestly disabled
 * (title tooltip) until its mode lands. Icons are inline SVG (Fluent-style strokes).
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
      <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function KeepOnTopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
      <rect x="5.5" y="2.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 12.5A1.5 1.5 0 0 1 2.5 11V4A1.5 1.5 0 0 1 4 2.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
      <path d="M9 5.5V9l2.5 1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M15 9a6 6 0 1 1-1.76-4.24M15 2.8v2.7h-2.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- flyout icons (20px, Fluent-style) ---- */

function IconCalculator() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <rect x="4" y="2.5" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 5.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 9.5h.01M10 9.5h.01M13 9.5h.01M7 13.5h.01M10 13.5h.01M13 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconScientific() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M8 2.5h4M9 2.5v4l-4.6 8.2a1.8 1.8 0 0 0 1.6 2.8h8a1.8 1.8 0 0 0 1.6-2.8L11 6.5v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.2 13.5h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconGraphing() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M3 3v14h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 12.5c2.5 0 3-6 5-6s2 4.5 3.5 4.5c1 0 1.6-1 2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconProgrammer() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="m7 6-4 4 4 4M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDate() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8.5h14M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 11.5h.01M10 11.5h.01M13.5 11.5h.01M6.5 14h.01M10 14h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="14" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.8 7.8c1.4 1.4 3 3 4.4 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconVolume() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M10 2.5 17 6.5v7l-7 4-7-4v-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m3.4 6.7 6.6 3.8 6.6-3.8M10 10.5V16.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconLength() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <rect x="2" y="8" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 8v2.5M9 8v3M12.5 8v2.5M16 8v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconWeight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M7.4 8.1a3.4 3.4 0 1 1 5.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="12.6" r="4.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconTemperature() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M9 2.5h2.4v8.3a4 4 0 1 1-2.4 0z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10.2 12.8v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconEnergy() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path
        d="M10 2.8c2.4 2.5 5 5.2 5 8.6a5 5 0 0 1-10 0c0-3.4 2.6-6.1 5-8.6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M10 15.4a2.2 2.2 0 0 1-2.2-2.2c0-1.3 1-2.3 2.2-3.6 1.2 1.3 2.2 2.3 2.2 3.6A2.2 2.2 0 0 1 10 15.4z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconArea() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <rect x="3.5" y="3.5" width="13" height="13" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 13h4a1 1 0 0 0 1-1V3.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 16.5v-4a1 1 0 0 0-1-1h-6" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}

function IconSpeed() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M3.5 14.5a7.2 7.2 0 1 1 13 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 12.8 13.4 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="13" r="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconTime() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6v4l2.6 1.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPower() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M11.4 2.5 5.2 11h3.4l-1 6.5 6.2-8.5h-3.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconData() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <rect x="4" y="2.5" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 15.2c.6-1.4 2-2.2 3.5-2.2s2.9.8 3.5 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPressure() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <circle cx="10" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 4v2.6M10 12l2.8-2.8M3.5 12H6M14 12h2.5M6.2 6.6l1.8 1.8M13.8 6.6 12 8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconAngle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <path d="M4 4v13h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4l8.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.4 15.6A7 7 0 0 0 4.4 10.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 2.8v2M10 15.2v2M2.8 10h2M15.2 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  enabled: boolean;
  current?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    heading: "Calculator",
    items: [
      { id: "standard", label: "Standard", icon: <IconCalculator />, enabled: true, current: true },
      { id: "scientific", label: "Scientific", icon: <IconScientific />, enabled: false },
      { id: "graphing", label: "Graphing", icon: <IconGraphing />, enabled: false },
      { id: "programmer", label: "Programmer", icon: <IconProgrammer />, enabled: false },
      { id: "date", label: "Date calculation", icon: <IconDate />, enabled: false },
    ],
  },
  {
    heading: "Converter",
    items: [
      { id: "currency", label: "Currency", icon: <IconCurrency />, enabled: false },
      { id: "volume", label: "Volume", icon: <IconVolume />, enabled: false },
      { id: "length", label: "Length", icon: <IconLength />, enabled: false },
      { id: "weight", label: "Weight and mass", icon: <IconWeight />, enabled: false },
      { id: "temperature", label: "Temperature", icon: <IconTemperature />, enabled: false },
      { id: "energy", label: "Energy", icon: <IconEnergy />, enabled: false },
      { id: "area", label: "Area", icon: <IconArea />, enabled: false },
      { id: "speed", label: "Speed", icon: <IconSpeed />, enabled: false },
      { id: "time", label: "Time", icon: <IconTime />, enabled: false },
      { id: "power", label: "Power", icon: <IconPower />, enabled: false },
      { id: "data", label: "Data", icon: <IconData />, enabled: false },
      { id: "pressure", label: "Pressure", icon: <IconPressure />, enabled: false },
      { id: "angle", label: "Angle", icon: <IconAngle />, enabled: false },
    ],
  },
];

function NavRow({ item, onPick }: { item: NavItem; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      className={item.current ? "calc__navitem is-current" : "calc__navitem"}
      aria-current={item.current ? "page" : undefined}
      aria-disabled={!item.enabled || undefined}
      title={item.enabled ? undefined : "Not available yet"}
      onClick={() => item.enabled && onPick(item.id)}
    >
      <span className="calc__navicon">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const pick = (id: string) => {
    if (id === "standard") setNavOpen(false);
  };

  return (
    <header className="calc__header" ref={anchorRef}>
      <button
        type="button"
        className="iconbtn"
        aria-label={navOpen ? "Close navigation" : "Open navigation"}
        aria-haspopup="dialog"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((v) => !v)}
      >
        <MenuIcon />
      </button>
      <h1 className="calc__title">Standard</h1>
      <button type="button" className="iconbtn" aria-disabled="true" aria-label="Keep on top" title="Coming soon">
        <KeepOnTopIcon />
      </button>
      <span className="calc__spacer" />
      <button type="button" className="iconbtn" aria-disabled="true" aria-label="History" title="Coming soon">
        <HistoryIcon />
      </button>

      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="calc__navback"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15, ease: "linear" }}
            />
            <motion.nav
              className="calc__nav"
              role="dialog"
              aria-modal="true"
              aria-label="Calculator modes"
              initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { x: "-100%" }}
              transition={
                reduceMotion
                  ? { duration: 0.12, ease: "linear" }
                  : { type: "tween", duration: 0.26, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <div className="calc__navscroll">
                {SECTIONS.map((sec) => (
                  <div key={sec.heading} role="group" aria-label={sec.heading}>
                    <div className="calc__navsection">{sec.heading}</div>
                    {sec.items.map((item) => (
                      <NavRow key={item.id} item={item} onPick={pick} />
                    ))}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="calc__navitem"
                aria-disabled="true"
                title="Not available yet"
              >
                <span className="calc__navicon">
                  <IconSettings />
                </span>
                <span>Settings</span>
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
