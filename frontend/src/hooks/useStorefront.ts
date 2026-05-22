import { useContext } from "react";
import { StorefrontContext } from "@/contexts/StorefrontContext";

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) {
    throw new Error("useStorefront must be used within a <StorefrontProvider>.");
  }
  return ctx;
}
