/**
 * Custom window title bar (frameless mode): app icon + "Calculator" on the left in the
 * drag region, min/max/close on the right. Dragging and double-click-maximize are native
 * (data-tauri-drag-region); buttons go through the real window API. When running in a
 * plain browser (no Tauri), the buttons render but are inert — never faked.
 */
import { useEffect, useState } from "react";

const hasTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function getWin() {
  if (!hasTauri) return null;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

function AppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 17 17" aria-hidden="true">
      <defs>
        <linearGradient id="tbar-icon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#59b3f1" />
          <stop offset="1" stopColor="#1668c8" />
        </linearGradient>
      </defs>
      <rect width="17" height="17" rx="3.5" fill="url(#tbar-icon-bg)" />
      <rect x="3.4" y="2.8" width="10.2" height="3.1" rx="0.6" fill="#fff" opacity="0.92" />
      <g fill="#fff" opacity="0.92">
        <rect x="3.4" y="7.6" width="2.6" height="2.2" rx="0.4" />
        <rect x="7.2" y="7.6" width="2.6" height="2.2" rx="0.4" />
        <rect x="11" y="7.6" width="2.6" height="2.2" rx="0.4" />
        <rect x="3.4" y="11.1" width="2.6" height="2.2" rx="0.4" />
        <rect x="7.2" y="11.1" width="2.6" height="2.2" rx="0.4" />
        <rect x="11" y="11.1" width="2.6" height="2.2" rx="0.4" fillOpacity="0.62" />
      </g>
    </svg>
  );
}

function MinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none">
      <path d="M1 5h8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MaxIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none">
      <rect x="1" y="1" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none">
      <path d="M3 1h6v6M7 3v6H1V3z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!hasTauri) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const win = await getWin();
      if (!win || cancelled) return;
      setMaximized(await win.isMaximized());
      const unlisten = await win.onResized(async () => {
        setMaximized(await win.isMaximized());
      });
      cleanup = unlisten;
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const minimize = () => void getWin().then((w) => w?.minimize());
  const toggleMax = () => void getWin().then((w) => w?.toggleMaximize());
  const close = () => void getWin().then((w) => w?.close());

  return (
    <div className="tbar">
      <div className="tbar__drag" data-tauri-drag-region>
        <span className="tbar__icon" data-tauri-drag-region>
          <AppIcon />
        </span>
        <span className="tbar__title" data-tauri-drag-region>
          Calculator
        </span>
      </div>
      <div className="tbar__btns">
        <button type="button" className="tbar__btn" aria-label="Minimize" title="Minimize" onClick={minimize}>
          <MinIcon />
        </button>
        <button
          type="button"
          className="tbar__btn"
          aria-label={maximized ? "Restore" : "Maximize"}
          title={maximized ? "Restore" : "Maximize"}
          onClick={toggleMax}
        >
          {maximized ? <RestoreIcon /> : <MaxIcon />}
        </button>
        <button type="button" className="tbar__btn tbar__btn--close" aria-label="Close" title="Close" onClick={close}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
