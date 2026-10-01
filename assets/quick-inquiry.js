(function () {
  const form = document.querySelector("[data-quick-contact]");
  if (!form) return;

  const status = form.querySelector("[data-quick-contact-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  let sent = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sent || !form.reportValidity()) return;

    const data = new FormData(form);
    const firstTouch = window.WindWoodsAttribution?.get?.() || {};
    Object.entries(firstTouch).forEach(([key, value]) => {
      data.set(key, String(value || ""));
    });
    data.set("submitted_page", window.location.pathname);
    status.textContent = "送信中です。";
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Submission failed");

      sent = true;
      form.reset();
      status.textContent = "送信しました。担当者が内容を確認してご連絡します。";
      submitButton.textContent = "送信済み";
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: "AW-18418113981/XRWdCOzB3OscEL27uM5E"
        });
      }
    } catch {
      status.textContent = "送信できませんでした。時間をおいて再度お試しください。";
      submitButton.disabled = false;
    }
  });
})();
