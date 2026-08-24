/* ============================================================
   RSVP.JS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = WEDDING_CONFIG;
  document.title = `Xác Nhận Tham Dự — ${cfg.bride.shortName} & ${cfg.groom.shortName}`;
  document.getElementById("monogramSm").innerHTML = `${cfg.bride.initial} &amp; ${cfg.groom.initial}`;

  /* ---------- 1. XÁC ĐỊNH KHÁCH MỜI (theo link riêng hoặc tên tự do) ---------- */
  const params = new URLSearchParams(window.location.search);
  const guestCode = params.get("to");
  const rawName = params.get("name");
  const knownGuest = guestCode && cfg.guests[guestCode];

  const greetingEl = document.getElementById("rsvpGreeting");
  const nameInput = document.getElementById("rsvpName");

  function applyGuestName(name) {
    greetingEl.textContent = `Kính mời ${name} xác nhận tham dự`;
    if (!nameInput.value) nameInput.value = name;
  }

  if (knownGuest) {
    applyGuestName(cfg.guests[guestCode].name);
  } else if (rawName) {
    applyGuestName(decodeURIComponent(rawName));
  }

  // Tra thêm ở danh sách khách tạo qua trang quản trị (Firestore) — sẽ ghi đè
  // tên tĩnh ở trên nếu có (ưu tiên dữ liệu mới nhất), và ghi nhận lượt xem.
  if (guestCode && typeof WeddingGuests !== "undefined") {
    WeddingGuests.resolve(guestCode, (name) => { if (name) applyGuestName(name); });
    WeddingGuests.logView(guestCode);
  }

  // Mã tài liệu Firestore cho lượt RSVP này:
  // - nếu có link riêng (?to=...) -> dùng luôn mã đó (cho phép sửa lại sau này).
  // - nếu không -> tạo mã từ tên khách + số ngẫu nhiên, lưu vào trình duyệt để lần sau tự nhận lại đúng lượt RSVP của mình.
  function slugify(str) {
    return str
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "khach";
  }

  const LS_DOC_KEY = "rsvp_doc_id";
  let docId = guestCode || localStorage.getItem(LS_DOC_KEY);

  /* ---------- 2. HẠN CHÓT RSVP ---------- */
  const deadline = new Date(cfg.rsvp.deadline);
  const isClosed = new Date() > deadline;
  const dtFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const banner = document.getElementById("deadlineBanner");
  const form = document.getElementById("rsvpForm");
  const closedNote = document.getElementById("closedNote");

  if (isClosed) {
    banner.textContent = "Đã hết hạn xác nhận tham dự — vui lòng liên hệ trực tiếp cô dâu/chú rể nếu có thay đổi.";
    banner.classList.add("closed");
    form.style.display = "none";
    closedNote.style.display = "block";
    closedNote.textContent = "Rất tiếc, form xác nhận đã đóng. Cảm ơn bạn đã quan tâm!";
  } else {
    banner.textContent = `${cfg.rsvp.note} (hạn phản hồi: ${dtFormatter.format(deadline)})`;
  }

  /* ---------- 3. HIỆN/ẨN Ô SỐ NGƯỜI + THỰC ĐƠN THEO LỰA CHỌN THAM DỰ ---------- */
  const attendYes = document.getElementById("attendYes");
  const attendNo = document.getElementById("attendNo");
  const attendingExtra = document.getElementById("attendingExtra");
  const guestCountInput = document.getElementById("guestCount");

  function syncAttendingUI() {
    const attending = attendYes.checked;
    attendingExtra.classList.toggle("show", attending);
    guestCountInput.required = attending;
  }
  attendYes.addEventListener("change", syncAttendingUI);
  attendNo.addEventListener("change", syncAttendingUI);

  document.getElementById("stepDown").addEventListener("click", () => {
    const max = cfg.rsvp.maxGuestCount || 10;
    guestCountInput.value = Math.max(1, Math.min(max, (parseInt(guestCountInput.value, 10) || 1) - 1));
  });
  document.getElementById("stepUp").addEventListener("click", () => {
    const max = cfg.rsvp.maxGuestCount || 10;
    guestCountInput.value = Math.max(1, Math.min(max, (parseInt(guestCountInput.value, 10) || 1) + 1));
  });

  /* ---------- 4. NẠP LẠI RSVP CŨ (nếu khách đã từng gửi) — để họ SỬA thay vì gửi trùng ---------- */
  const submitBtn = document.getElementById("rsvpSubmitBtn");
  const statusEl = document.getElementById("formStatus");

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `form-status show ${type}`;
  }

  if (!isClosed && docId && typeof db !== "undefined") {
    db.collection("rsvps").doc(docId).get().then((snap) => {
      if (!snap.exists) return;
      const d = snap.data();
      if (d.name) nameInput.value = d.name;
      (d.attending ? attendYes : attendNo).checked = true;
      syncAttendingUI();
      if (d.attending) {
        guestCountInput.value = d.guestCount || 1;
        if (d.meal === "chay") document.getElementById("mealChay").checked = true;
        if (d.meal === "man") document.getElementById("mealMan").checked = true;
      }
      document.getElementById("rsvpMessage").value = d.message || "";
      submitBtn.textContent = "Cập nhật xác nhận";
      showStatus("Bạn đã từng phản hồi trước đó — có thể chỉnh sửa lại bên dưới nếu cần.", "info");
    }).catch(() => { /* im lặng bỏ qua — không có RSVP cũ hoặc lỗi mạng */ });
  }

  /* ---------- 5. CHỐNG SPAM: honeypot + khoảng cách tối thiểu giữa 2 lần gửi ---------- */
  const LS_LAST_SUBMIT = "rsvp_last_submit";
  const COOLDOWN_MS = 15000;

  /* ---------- 6. GỬI FORM ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    // Honeypot: nếu field ẩn bị điền -> gần như chắc chắn là bot, âm thầm bỏ qua.
    if (document.getElementById("website").value.trim() !== "") {
      showStatus("Đã ghi nhận. Cảm ơn bạn!", "info");
      form.reset();
      return;
    }

    const lastSubmit = parseInt(localStorage.getItem(LS_LAST_SUBMIT) || "0", 10);
    if (Date.now() - lastSubmit < COOLDOWN_MS) {
      showStatus("Bạn vừa gửi xác nhận rồi — vui lòng đợi ít phút rồi thử lại nếu cần sửa.", "error");
      return;
    }

    const name = nameInput.value.trim();
    if (!name) { showStatus("Vui lòng nhập họ tên.", "error"); return; }
    if (!attendYes.checked && !attendNo.checked) { showStatus("Vui lòng chọn có/không tham dự.", "error"); return; }

    const attending = attendYes.checked;
    const max = cfg.rsvp.maxGuestCount || 10;
    let guestCount = 1;
    if (attending) {
      guestCount = Math.max(1, Math.min(max, parseInt(guestCountInput.value, 10) || 1));
      if (!document.getElementById("mealMan").checked && !document.getElementById("mealChay").checked) {
        showStatus("Vui lòng chọn thực đơn (chay/mặn).", "error");
        return;
      }
    }
    const meal = attending ? (document.getElementById("mealChay").checked ? "chay" : "man") : null;
    const message = document.getElementById("rsvpMessage").value.trim().slice(0, 500);

    if (typeof db === "undefined") {
      showStatus("Chưa kết nối được hệ thống — vui lòng thử lại sau hoặc liên hệ trực tiếp.", "error");
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Đang gửi...";

    if (!docId) {
      docId = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem(LS_DOC_KEY, docId);
    }

    const isUpdate = originalLabel === "Cập nhật xác nhận";
    const payload = {
      guestCode: guestCode || null,
      name,
      attending,
      guestCount,
      meal,
      message,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (!isUpdate) payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();

    try {
      await db.collection("rsvps").doc(docId).set(payload, { merge: true });
      localStorage.setItem(LS_LAST_SUBMIT, String(Date.now()));
      sessionStorage.setItem("rsvpSummary", JSON.stringify({ name, attending, guestCount, meal }));
      window.location.href = "thankyou.html";
    } catch (err) {
      console.error(err);
      showStatus("Có lỗi khi gửi — vui lòng kiểm tra kết nối mạng và thử lại.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
