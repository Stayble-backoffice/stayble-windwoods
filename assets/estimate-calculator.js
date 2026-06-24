(function () {
  const layouts = {
    "1R": { label: "1R", base: 4200, includedBeds: 2 },
    "1LDK": { label: "1LDK", base: 4800, includedBeds: 4 },
    "2LDK": { label: "2LDK", base: 5800, includedBeds: 6 },
    "3LDK": { label: "3LDK", base: 6800, includedBeds: 7 },
    house: { label: "戸建て", base: 9400, includedBeds: 10 }
  };

  const tiers = {
    u5: { linen: 550, amenities: 1250, trash: 770 },
    u7: { linen: 770, amenities: 1450, trash: 990 },
    u9: { linen: 770, amenities: 1650, trash: 1100 },
    o10: null
  };

  const guestLabels = {
    u5: "〜5名",
    u7: "6〜7名",
    u9: "8〜9名",
    o10: "10名以上"
  };

  const optionLabels = {
    yes: "必要",
    no: "不要"
  };

  const bookingTypeLabels = {
    online: "オンライン",
    onsite: "現地"
  };

  const linenFields = [
    ["bath_towels", "バスタオル"],
    ["face_towels", "フェイスタオル"],
    ["bath_mats", "バスマット"],
    ["pillow_cases", "ピローケース"],
    ["s_duvet_covers", "S デュベカバー"],
    ["s_bed_sheets", "S ベッドシーツ"],
    ["d_duvet_covers", "D デュベカバー"],
    ["d_bed_sheets", "D ベッドシーツ"],
    ["q_duvet_covers", "Q デュベカバー"],
    ["q_bed_sheets", "Q ベッドシーツ"],
    ["k_duvet_covers", "K デュベカバー"],
    ["k_bed_sheets", "K ベッドシーツ"]
  ];

  function formatYen(value) {
    return `¥${value.toLocaleString("ja-JP")}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function computeEstimate(input) {
    const layout = layouts[input.layout];
    const tier = tiers[input.guests];
    const beds = Math.max(0, Math.floor(Number(input.beds)));
    const usesAmenities = input.amenities === "yes";
    const usesLinen = input.linen === "yes";
    const usesTrash = input.trash === "yes";

    if (!layout || Number.isNaN(beds)) {
      return null;
    }

    if (!tier) {
      return {
        quoteRequired: true,
        amount: "要見積もり",
        rows: [
          ["清掃費", "要見積もり"],
          ["ベッド超過加算", "要見積もり"],
          ["消耗品サービス費", usesAmenities ? "要見積もり" : "利用なし"],
          ["ゴミ回収費", usesTrash ? "要見積もり" : "利用なし"],
          ["リネン集配手数料", usesLinen ? "要見積もり" : "利用なし"]
        ],
        note: "10名以上は要見積もりです。これは概算（目安）です。正式なお見積もりは現地調査後に確定します。水回りが基準を超える物件は別途加算があります。"
      };
    }

    const extraBeds = Math.max(0, beds - layout.includedBeds);
    const bedFee = extraBeds * 770;
    const amenitiesFee = usesAmenities ? tier.amenities : 0;
    const trashFee = usesTrash ? tier.trash : 0;
    const linenFee = usesLinen ? tier.linen : 0;
    const total = layout.base + bedFee + amenitiesFee + trashFee + linenFee;

    const notes = [
      "これは概算（目安）です。正式なお見積もりは現地調査後に確定します。",
      "水回りが基準を超える物件は別途加算があります。"
    ];

    if (usesLinen) {
      notes.push("リネン利用時はタオル・シーツの枚数に応じた費用が別途加算されます。");
    }

    return {
      quoteRequired: false,
      amount: formatYen(total),
      total,
      rows: [
        ["清掃費", formatYen(layout.base)],
        ["ベッド超過加算", bedFee ? `${formatYen(bedFee)}（${extraBeds}台）` : "¥0"],
        ["消耗品サービス費", usesAmenities ? formatYen(amenitiesFee) : "利用なし"],
        ["ゴミ回収費", usesTrash ? formatYen(trashFee) : "利用なし"],
        ["リネン集配手数料", usesLinen ? formatYen(linenFee) : "利用なし"]
      ],
      note: notes.join("")
    };
  }

  const root = typeof window !== "undefined" ? window : globalThis;
  root.WindWoodsEstimateCalculator = { computeEstimate };

  if (typeof document === "undefined") {
    return;
  }

  const form = document.querySelector("[data-estimate-form]");
  const result = document.querySelector("[data-estimate-result]");

  if (!form || !result) {
    return;
  }

  const amountNode = result.querySelector("[data-estimate-amount]");
  const breakdownNode = result.querySelector("[data-estimate-breakdown]");
  const noteNode = result.querySelector("[data-estimate-note]");
  const consultActions = document.querySelector("[data-consult-actions]");
  const openConsultButton = document.querySelector("[data-open-consult]");
  const bookingForm = document.querySelector("[data-booking-form]");
  const bookingStatus = document.querySelector("[data-booking-status]");
  const bookingSubmit = document.querySelector("[data-booking-submit]");
  const linenDetails = document.querySelector("[data-linen-details]");
  const timerexSection = document.querySelector("[data-timerex-section]");
  const completionPanel = document.querySelector("[data-completion-panel]");
  const completionSummary = document.querySelector("[data-completion-summary]");
  const hiddenEstimateAmount = document.querySelector("[data-hidden-estimate-amount]");
  const hiddenBookingType = document.querySelector("[data-hidden-booking-type]");
  const hiddenEstimateBreakdown = document.querySelector("[data-hidden-estimate-breakdown]");
  const hiddenEstimateNote = document.querySelector("[data-hidden-estimate-note]");
  const messageField = document.querySelector("[data-message-field]");
  let hasCalculated = false;
  let lastEstimate = null;
  let lastInput = null;
  let timerexInitialized = false;

  function setBreakdown(rows) {
    breakdownNode.innerHTML = rows.map(([label, value]) => (
      `<div><dt>${label}</dt><dd>${value}</dd></div>`
    )).join("");
  }

  function readInput() {
    const data = new FormData(form);
    return {
      layout: data.get("layout"),
      guests: data.get("guests"),
      beds: data.get("beds"),
      amenities: data.get("amenities"),
      linen: data.get("linen"),
      trash: data.get("trash")
    };
  }

  function renderEstimate() {
    const input = readInput();
    const estimate = computeEstimate(input);

    if (!estimate) {
      return;
    }

    lastInput = input;
    lastEstimate = estimate;
    amountNode.classList.toggle("is-quote-required", estimate.quoteRequired);
    amountNode.textContent = estimate.amount;
    setBreakdown(estimate.rows);
    noteNode.textContent = estimate.note;

    if (consultActions) {
      consultActions.hidden = false;
    }

    syncHiddenEstimateFields();
    syncLinenDetails();
  }

  function syncHiddenEstimateFields() {
    if (!lastEstimate || !lastInput) {
      return;
    }

    if (hiddenEstimateAmount) {
      hiddenEstimateAmount.value = lastEstimate.amount;
    }

    if (hiddenEstimateBreakdown) {
      hiddenEstimateBreakdown.value = lastEstimate.rows.map(([label, value]) => `${label}: ${value}`).join(" / ");
    }

    if (hiddenEstimateNote) {
      hiddenEstimateNote.value = lastEstimate.note;
    }

    if (hiddenBookingType && bookingForm) {
      const type = new FormData(bookingForm).get("booking_type") || "online";
      hiddenBookingType.value = bookingTypeLabels[type] || type;
    }
  }

  function syncLinenDetails() {
    if (!linenDetails) {
      return;
    }

    const shouldShow = readInput().linen === "yes";
    linenDetails.hidden = !shouldShow;

    linenDetails.querySelectorAll("input").forEach((input) => {
      input.disabled = !shouldShow;
      input.required = false;

      if (!shouldShow) {
        input.value = "";
      }
    });
  }

  function setDefaultCleaningDate() {
    const dateInput = bookingForm?.querySelector("[name='first_cleaning_date']");

    if (!dateInput || dateInput.value) {
      return;
    }

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateInput.value = today.toISOString().slice(0, 10);
  }

  function getFieldValue(data, key, fallback = "未入力") {
    const value = data.get(key);

    if (typeof value !== "string" || value.trim() === "") {
      return fallback;
    }

    return value.trim();
  }

  function normalizeCount(value) {
    const number = Math.max(0, Math.floor(Number(value)));
    return Number.isFinite(number) ? String(number) : "0";
  }

  function normalizeLinenCounts(submitData) {
    linenFields.forEach(([key]) => {
      submitData.set(key, normalizeCount(submitData.get(key)));
    });
  }

  function getBookingTypeLabel(data) {
    const type = data.get("booking_type") || "online";
    return bookingTypeLabels[type] || type;
  }

  function getAreaLabel(data) {
    return getFieldValue(data, "area", "未設定");
  }

  function appendEstimateFields(submitData) {
    if (!lastEstimate || !lastInput) {
      return;
    }

    const layout = layouts[lastInput.layout];
    submitData.set("estimate_layout", layout ? layout.label : lastInput.layout);
    submitData.set("estimate_guests", guestLabels[lastInput.guests] || lastInput.guests);
    submitData.set("estimate_beds", String(lastInput.beds));
    submitData.set("amenities_service", optionLabels[lastInput.amenities] || lastInput.amenities);
    submitData.set("linen_supply", optionLabels[lastInput.linen] || lastInput.linen);
    submitData.set("trash_collection", optionLabels[lastInput.trash] || lastInput.trash);
    submitData.set("estimate_amount", lastEstimate.amount);
    submitData.set("estimate_breakdown", lastEstimate.rows.map(([label, value]) => `${label}: ${value}`).join(" / "));
    submitData.set("estimate_note", lastEstimate.note);
  }

  function buildEmailMessage(submitData) {
    if (!lastEstimate || !lastInput) {
      return "";
    }

    const breakdown = lastEstimate.rows.map(([label, value]) => `- ${label}: ${value}`).join("\n");
    const linenCounts = linenFields.map(([key, label]) => `- ${label}: ${normalizeCount(submitData.get(key))}`).join("\n");
    const areaLabel = getAreaLabel(submitData);

    return [
      `WindWoods ${areaLabel}LPから見積もり・予約問い合わせが送信されました。`,
      "",
      "【概算】",
      `概算合計（1回あたりの請求額）: ${lastEstimate.amount}`,
      "内訳:",
      breakdown,
      `注記: ${lastEstimate.note}`,
      "",
      "【予約・エリア】",
      `種別: ${getBookingTypeLabel(submitData)}`,
      `エリア: ${areaLabel}`,
      "",
      "【物件情報】",
      `メールアドレス: ${getFieldValue(submitData, "email")}`,
      `法人名（または屋号）: ${getFieldValue(submitData, "company_name")}`,
      `物件名: ${getFieldValue(submitData, "property_name")}`,
      `物件ご住所: ${getFieldValue(submitData, "property_address")}`,
      `お部屋番号: ${getFieldValue(submitData, "room_number")}`,
      `駐車場の有無: ${getFieldValue(submitData, "parking")}`,
      `チェックアウト時刻: ${getFieldValue(submitData, "checkout_time")}`,
      `チェックイン時刻: ${getFieldValue(submitData, "checkin_time")}`,
      `ご希望の初回清掃日: ${getFieldValue(submitData, "first_cleaning_date")}`,
      `OTAリスティングURL: ${getFieldValue(submitData, "ota_url")}`,
      "",
      "【概算入力】",
      `間取り: ${getFieldValue(submitData, "estimate_layout")}`,
      `最大収容人数: ${getFieldValue(submitData, "estimate_guests")}`,
      `ベッド数: ${getFieldValue(submitData, "estimate_beds")}`,
      `消耗品サービス: ${getFieldValue(submitData, "amenities_service")}`,
      `リネンサプライ: ${getFieldValue(submitData, "linen_supply")}`,
      `ゴミ回収: ${getFieldValue(submitData, "trash_collection")}`,
      "",
      "【リネン枚数】",
      linenCounts,
      "",
      "【ご要望・ご質問】",
      getFieldValue(submitData, "request_message")
    ].join("\n");
  }

  function showTimerex() {
    if (!timerexSection) {
      return;
    }

    timerexSection.hidden = false;

    const initialize = () => {
      if (timerexInitialized || typeof root.TimerexCalendar !== "function") {
        return;
      }

      root.TimerexCalendar();
      timerexInitialized = true;
    };

    initialize();

    const script = document.getElementById("timerex_embed");
    if (!timerexInitialized && script) {
      script.addEventListener("load", initialize, { once: true });
    }
  }

  function showCompletion(formData) {
    if (!completionPanel || !completionSummary || !lastEstimate) {
      return;
    }

    completionSummary.innerHTML = [
      ["種別", getBookingTypeLabel(formData)],
      ["物件名", formData.get("property_name") || "-"],
      ["概算金額", lastEstimate.amount]
    ].map(([label, value]) => (
      `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
    )).join("");

    completionPanel.hidden = false;
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (!bookingForm || !bookingForm.reportValidity()) {
      return;
    }

    if (!lastEstimate) {
      hasCalculated = true;
      renderEstimate();
    }

    syncHiddenEstimateFields();

    const submitData = new FormData(bookingForm);
    const bookingType = getBookingTypeLabel(submitData);
    submitData.set("booking_type_label", bookingType);
    submitData.set("email", submitData.get("email") || "");
    appendEstimateFields(submitData);
    normalizeLinenCounts(submitData);
    submitData.set("message", buildEmailMessage(submitData));

    if (messageField) {
      messageField.value = submitData.get("message") || "";
    }

    if (bookingStatus) {
      bookingStatus.textContent = "送信中です。";
    }

    if (bookingSubmit) {
      bookingSubmit.disabled = true;
      bookingSubmit.textContent = "送信中";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submitData
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "送信に失敗しました。");
      }

      if (bookingStatus) {
        bookingStatus.textContent = "送信しました。続いて希望日時を選んでください。";
      }

      if (bookingSubmit) {
        bookingSubmit.textContent = "送信済み";
      }

      showTimerex();
      showCompletion(submitData);
      timerexSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (bookingStatus) {
        bookingStatus.textContent = "送信できませんでした。時間をおいて再度お試しください。";
      }

      if (bookingSubmit) {
        bookingSubmit.disabled = false;
        bookingSubmit.textContent = "送信して予約へ進む";
      }
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    hasCalculated = true;
    renderEstimate();
  });

  form.addEventListener("input", () => {
    if (hasCalculated) {
      renderEstimate();
    }
  });

  form.addEventListener("change", () => {
    if (hasCalculated) {
      renderEstimate();
    }

    syncLinenDetails();
  });

  openConsultButton?.addEventListener("click", () => {
    if (!bookingForm) {
      return;
    }

    bookingForm.hidden = false;
    setDefaultCleaningDate();
    syncLinenDetails();
    syncHiddenEstimateFields();
    bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  bookingForm?.addEventListener("change", syncHiddenEstimateFields);
  bookingForm?.addEventListener("submit", submitBooking);
  setDefaultCleaningDate();
  syncLinenDetails();
})();
