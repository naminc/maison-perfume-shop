import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const LOADER_DURATION = 280;

export function RouteLoader() {
  const location = useLocation();
  const firstRender = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setVisible(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, LOADER_DURATION);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, location.search]);

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[100] h-1 bg-stone-200 transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="h-full w-1/3 animate-[route-loader_0.9s_ease-in-out_infinite] bg-stone-900" />
    </div>
  );
}
