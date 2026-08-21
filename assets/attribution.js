(function () {
  const storageKey = "windwoods_first_touch_v1";
  const params = new URLSearchParams(window.location.search);

  function cleanReferrer(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    } catch {
      return "";
    }
  }

  function areaFromPath(pathname) {
    return pathname.split("/").filter(Boolean)[0] || "home";
  }

  function trafficSource() {
    if (params.get("utm_source")) return params.get("utm_source");
    if (params.get("gclid")) return "google_ads";
    if (params.get("msclkid")) return "microsoft_ads";
    if (!document.referrer) return "direct";

    try {
      const host = new URL(document.referrer).hostname;
      if (host.includes("google.")) return "google_organic";
      if (host.includes("bing.")) return "bing_organic";
      if (host.includes("yahoo.")) return "yahoo_organic";
      if (host === window.location.hostname) return "internal";
      return `referral:${host}`;
    } catch {
      return "referral";
    }
  }

  function capture() {
    const value = {
      first_touch_at: new Date().toISOString(),
      first_landing_page: window.location.pathname,
      first_area: areaFromPath(window.location.pathname),
      first_referrer: cleanReferrer(document.referrer),
      traffic_source: trafficSource(),
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      google_click_id: params.get("gclid") || "",
      microsoft_click_id: params.get("msclkid") || "",
    };

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.first_landing_page) return saved;
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      return value;
    }

    return value;
  }

  const firstTouch = capture();
  window.WindWoodsAttribution = {
    get() {
      return { ...firstTouch };
    },
  };
})();
