import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const LOADER_DELAY = 80;
const LOADER_DURATION = 180;

export function RouteLoader() {
  const location = useLocation();
  const firstRender = useRef(true);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (showTimeoutRef.current) window.clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);

    setVisible(false);

    showTimeoutRef.current = window.setTimeout(() => {
      setVisible(true);
      showTimeoutRef.current = null;

      hideTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        hideTimeoutRef.current = null;
      }, LOADER_DURATION);
    }, LOADER_DELAY);

    return () => {
      if (showTimeoutRef.current) {
        window.clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setVisible(false);
    };
  }, [location.pathname, location.search]);

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[100] h-1 bg-stone-200 transition-opacity duration-100 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="h-full w-1/3 animate-[route-loader_0.9s_ease-in-out_infinite] bg-stone-900" />
    </div>
  );
}
