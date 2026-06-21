import { useEffect } from "react";

interface PageSEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

export function usePageSEO({ title, description, keywords, canonical, ogImage }: PageSEOOptions) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        document.head.appendChild(el);
      }
      (el as any)[attr] = value;
    };

    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
    }

    if (keywords) {
      setMeta('meta[name="keywords"]', "content", keywords);
    }

    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
    }

    if (title) {
      setMeta('meta[property="og:title"]', "content", title);
      setMeta('meta[name="twitter:title"]', "content", title);
    }
  }, [title, description, keywords, canonical, ogImage]);
}
