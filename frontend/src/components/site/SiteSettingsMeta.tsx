import { useEffect } from "react";
import { usePublicSettings } from "@/hooks/usePublicSettings";

export function SiteSettingsMeta() {
  const { data, settings } = usePublicSettings();

  useEffect(() => {
    if (!data) return;

    if (settings.meta_title) {
      document.title = settings.meta_title;
    }

    if (settings.meta_description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');

      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }

      meta.content = settings.meta_description;
    }

    if (settings.icon) {
      let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }

      icon.href = settings.icon;
    }
  }, [data, settings.icon, settings.meta_description, settings.meta_title]);

  return null;
}
