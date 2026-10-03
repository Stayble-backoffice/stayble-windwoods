(function () {
  // Set this after the WindWoods GA4 web stream has been created.
  const measurementId = "";
  const enabled = /^G-[A-Z0-9]+$/.test(measurementId);

  if (enabled && typeof window.gtag === "function") {
    window.gtag("config", measurementId);
  }

  window.WindWoodsAnalytics = {
    track(name, parameters = {}) {
      if (!enabled || typeof window.gtag !== "function") return;
      window.gtag("event", name, {
        ...parameters,
        send_to: measurementId
      });
    }
  };
})();
