import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/estimate-calculator.js", import.meta.url), "utf8");
const expectedSendTo = "AW-18418113981/XRWdCOzB3OscEL27uM5E";

function createNode(overrides = {}) {
  return {
    hidden: true,
    disabled: false,
    required: false,
    textContent: "",
    innerHTML: "",
    value: "",
    listeners: {},
    classList: { toggle() {} },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    scrollIntoView() {},
    ...overrides
  };
}

class TestFormData {
  constructor(form) {
    this.values = new Map(Object.entries(form?.fields || {}));
  }

  get(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  set(key, value) {
    this.values.set(key, String(value));
  }
}

function createEnvironment(fetchResponse) {
  const conversions = [];
  let fetchCount = 0;

  const estimateForm = createNode({
    fields: {
      layout: "1R",
      guests: "u5",
      beds: "2",
      amenities: "no",
      linen: "no",
      trash: "no"
    },
    reportValidity: () => true
  });
  const bookingForm = createNode({
    fields: {
      booking_type: "online",
      area: "千歳",
      email: "conversion-test@example.com",
      company_name: "計測検証",
      property_name: "コンバージョン動作確認",
      property_address: "テスト送信",
      room_number: "test",
      parking: "なし",
      checkout_time: "10:00",
      checkin_time: "15:00",
      request_message: "自動計測テスト"
    },
    reportValidity: () => true
  });
  const bookingSubmit = createNode();
  const dateInput = createNode();
  bookingForm.querySelector = (selector) => selector === "[name='first_cleaning_date']" ? dateInput : null;

  const amountNode = createNode();
  const breakdownNode = createNode();
  const noteNode = createNode();
  const resultNode = createNode({
    querySelector(selector) {
      return {
        "[data-estimate-amount]": amountNode,
        "[data-estimate-breakdown]": breakdownNode,
        "[data-estimate-note]": noteNode
      }[selector] || null;
    }
  });
  const timerexSection = createNode();
  const linenDetails = createNode();
  const completionPanel = createNode();
  const completionSummary = createNode();
  const hiddenEstimateAmount = createNode();
  const hiddenBookingType = createNode();
  const hiddenEstimateBreakdown = createNode();
  const hiddenEstimateNote = createNode();
  const messageField = createNode();

  const elements = {
    "[data-estimate-form]": estimateForm,
    "[data-estimate-result]": resultNode,
    "[data-consult-actions]": createNode(),
    "[data-open-consult]": createNode(),
    "[data-booking-form]": bookingForm,
    "[data-booking-status]": createNode(),
    "[data-booking-submit]": bookingSubmit,
    "[data-linen-details]": linenDetails,
    "[data-timerex-section]": timerexSection,
    "[data-completion-panel]": completionPanel,
    "[data-completion-summary]": completionSummary,
    "[data-hidden-estimate-amount]": hiddenEstimateAmount,
    "[data-hidden-booking-type]": hiddenBookingType,
    "[data-hidden-estimate-breakdown]": hiddenEstimateBreakdown,
    "[data-hidden-estimate-note]": hiddenEstimateNote,
    "[data-message-field]": messageField
  };
  const window = {
    gtag(...args) {
      conversions.push(args);
    },
    TimerexCalendar() {}
  };
  const document = {
    querySelector: (selector) => elements[selector] || null,
    getElementById: () => null,
    createElement: () => createNode(),
    body: { append() {} }
  };

  const context = vm.createContext({
    console,
    Date,
    document,
    FormData: TestFormData,
    window,
    fetch: async () => {
      fetchCount += 1;
      return fetchResponse;
    }
  });
  new vm.Script(source, { filename: "assets/estimate-calculator.js" }).runInContext(context);

  estimateForm.listeners.submit({ preventDefault() {} });

  return {
    bookingSubmit,
    conversions,
    fetchCount: () => fetchCount,
    submitAsUser() {
      if (bookingSubmit.disabled) {
        return Promise.resolve(false);
      }
      return bookingForm.listeners.submit({ preventDefault() {} });
    }
  };
}

const success = createEnvironment({
  ok: true,
  json: async () => ({ success: true })
});
await success.submitAsUser();
assert.equal(success.fetchCount(), 1, "成功時のフォーム送信は1回であること");
assert.equal(success.conversions.length, 1, "成功時のコンバージョン発火は1回であること");
assert.equal(success.conversions[0][0], "event");
assert.equal(success.conversions[0][1], "conversion");
assert.equal(success.conversions[0][2].send_to, expectedSendTo);

const failure = createEnvironment({
  ok: false,
  json: async () => ({ success: false, message: "test failure" })
});
await failure.submitAsUser();
assert.equal(failure.fetchCount(), 1, "失敗応答まで送信処理が行われること");
assert.equal(failure.conversions.length, 0, "送信失敗時はコンバージョンを発火しないこと");
assert.equal(failure.bookingSubmit.disabled, false, "送信失敗時は再送できること");

const doubleClick = createEnvironment({
  ok: true,
  json: async () => ({ success: true })
});
const firstSubmission = doubleClick.submitAsUser();
const secondSubmission = doubleClick.submitAsUser();
await Promise.all([firstSubmission, secondSubmission]);
assert.equal(doubleClick.fetchCount(), 1, "連打時もフォーム送信は1回であること");
assert.equal(doubleClick.conversions.length, 1, "連打時もコンバージョン発火は1回であること");

console.log("Conversion tracking tests passed:");
console.log(`- configured send_to: ${expectedSendTo}`);
console.log("- success: 1 submission / 1 conversion");
console.log("- failure: 1 failed submission / 0 conversions");
console.log("- rapid double click: 1 submission / 1 conversion");
