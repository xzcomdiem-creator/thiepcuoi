// js/rsvp.js
import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ------------------------------------------------------------------
// Cấu hình
// ------------------------------------------------------------------
const RSVP_DEADLINE = new Date("2027-01-31T23:59:59+07:00");
const WEDDING_URL = location.origin + location.pathname.replace(/rsvp\.html.*/, "index.html");
const BANK_ACCOUNT_NUMBER = "0123456789";

// ------------------------------------------------------------------
// DOM refs
// ------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const loadingState = $("loadingState");
const notFoundState = $("notFoundState");
const alreadyRespondedState = $("alreadyRespondedState");
const rsvpFormState = $("rsvpFormState");

const guestNameReveal = $("guestNameReveal");
const guestMeta = $("guestMeta");
const guestNameInput = $("guestNameInput");
const attendGroup = $("attendGroup");
const attendingDetail = $("attendingDetail");
const guestCountEl = $("guestCount");
const decBtn = $("decBtn");
const incBtn = $("incBtn");
const maxGuestHint = $("maxGuestHint");
const mealGroup = $("mealGroup");
const messageInput = $("messageInput");
const rsvpForm = $("rsvpForm");
const submitBtn = $("submitBtn");
const formMsg = $("formMsg");
const editResponseBtn = $("editResponseBtn");
const alreadyRespondedText = $("alreadyRespondedText");

let currentGuestId = null;
let currentGuestData = null;
let maxAllowed = 2;
let count = 1;
let editMode = false;

// ------------------------------------------------------------------
// Anti-spam: giới hạn gửi trùng lặp bằng localStorage + trạng thái Firestore
// ------------------------------------------------------------------
function localSubmitKey(id) { return `rsvp_submitted_${id}`; }
function hasSubmittedLocally(id) { return !!localStorage.getItem(localSubmitKey(id)); }
function markSubmittedLocally(id) { localStorage.setItem(localSubmitKey(id), "1"); }

// ------------------------------------------------------------------
// Deadline banner
// ------------------------------------------------------------------
function renderDeadline() {
  const banner = $("deadlineBanner");
  const dateEl = $("deadlineDate");
  const fmt = RSVP_DEADLINE.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  dateEl.textContent = fmt;
  banner.style.display = "flex";
}

// ------------------------------------------------------------------
// UI state helpers
// ------------------------------------------------------------------
function showState(name) {
  loadingState.style.display = name === "loading" ? "block" : "none";
  notFoundState.style.display = name === "notfound" ? "block" : "none";
  alreadyRespondedState.style.display = name === "responded" ? "block" : "none";
  rsvpFormState.style.display = name === "form" ? "block" : "none";
}

function setPillActive(group, value) {
  group.querySelectorAll(".choice-pill").forEach((pill) => {
    const input = pill.querySelector("input");
    const active = pill.dataset.value === value;
    pill.classList.toggle("active", active);
    if (active) input.checked = true;
  });
}

function updateCount() {
  guestCountEl.textContent = count;
  decBtn.disabled = count <= 1;
  incBtn.disabled = count >= maxAllowed;
}

// ------------------------------------------------------------------
// Load guest from Firestore by URL param `g`
// ------------------------------------------------------------------
async function loadGuest() {
  const params = new URLSearchParams(location.search);
  const guestId = params.get("g");

  if (!guestId) {
    showState("notfound");
    return;
  }

  currentGuestId = guestId;
  renderDeadline();

  try {
    const snap = await getDoc(doc(db, "guests", guestId));
    if (!snap.exists()) {
      showState("notfound");
      return;
    }
    currentGuestData = snap.data();
    maxAllowed = currentGuestData.maxGuests || 1;

    const alreadyResponded =
      currentGuestData.rsvpStatus && currentGuestData.rsvpStatus !== "pending";
    const spamLocked = hasSubmittedLocally(guestId) && alreadyResponded;

    if ((alreadyResponded || spamLocked) && !editMode) {
      renderAlreadyResponded();
      showState("responded");
      return;
    }

    populateForm();
    showState("form");
  } catch (err) {
    console.error("Lỗi tải thông tin khách:", err);
    showState("notfound");
  }
}

function renderAlreadyResponded() {
  const d = currentGuestData;
  if (d.rsvpStatus === "yes") {
    alreadyRespondedText.textContent = `Bạn đã xác nhận tham dự cùng ${d.numAttending || 1} người. Hẹn gặp bạn trong ngày trọng đại!`;
  } else if (d.rsvpStatus === "no") {
    alreadyRespondedText.textContent = "Bạn đã báo bận không thể tham dự. Cảm ơn bạn đã dành thời gian phản hồi.";
  } else {
    alreadyRespondedText.textContent = "Chúng tôi đã ghi nhận phản hồi của bạn.";
  }
}

function populateForm() {
  guestNameInput.value = currentGuestData.name || "";
  guestNameReveal.textContent = `Kính gửi, ${currentGuestData.name || "Quý khách"}`;
  guestMeta.textContent = maxAllowed > 1 ? `Số lượng khách mời: tối đa ${maxAllowed} người` : "";
  maxGuestHint.textContent = `Tối đa ${maxAllowed} người (kể cả bạn).`;

  // Nếu đã từng phản hồi (chế độ sửa), khôi phục lựa chọn cũ
  if (currentGuestData.rsvpStatus && currentGuestData.rsvpStatus !== "pending") {
    setPillActive(attendGroup, currentGuestData.rsvpStatus);
    attendingDetail.classList.toggle("open", currentGuestData.rsvpStatus === "yes");
    count = currentGuestData.numAttending || 1;
    updateCount();
    if (currentGuestData.mealPref) setPillActive(mealGroup, currentGuestData.mealPref);
    messageInput.value = currentGuestData.message || "";
  } else {
    count = 1;
    updateCount();
  }
}

// ------------------------------------------------------------------
// Interactions
// ------------------------------------------------------------------
attendGroup.addEventListener("click", (e) => {
  const pill = e.target.closest(".choice-pill");
  if (!pill) return;
  const value = pill.dataset.value;
  setPillActive(attendGroup, value);
  attendingDetail.classList.toggle("open", value === "yes");
});

mealGroup.addEventListener("click", (e) => {
  const pill = e.target.closest(".choice-pill");
  if (!pill) return;
  setPillActive(mealGroup, pill.dataset.value);
});

decBtn.addEventListener("click", () => { if (count > 1) { count--; updateCount(); } });
incBtn.addEventListener("click", () => { if (count < maxAllowed) { count++; updateCount(); } });

editResponseBtn.addEventListener("click", () => {
  editMode = true;
  populateForm();
  showState("form");
});

$("copyAccountBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(BANK_ACCOUNT_NUMBER);
    const btn = $("copyAccountBtn");
    const original = btn.textContent;
    btn.textContent = "✅ Đã sao chép!";
    setTimeout(() => (btn.textContent = original), 1800);
  } catch {
    alert(`Số tài khoản: ${BANK_ACCOUNT_NUMBER}`);
  }
});

// Share links
function setupShareLinks() {
  const shareText = encodeURIComponent("Thiệp mời cưới Gia Hân & Minh Khôi 💍");
  const shareUrl = encodeURIComponent(location.href);
  $("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  $("shareMessenger").href = `https://www.facebook.com/dialog/send?link=${shareUrl}&app_id=&redirect_uri=${shareUrl}`;
  $("shareZalo").href = `https://zalo.me/share?u=${shareUrl}&t=${shareText}`;
}
setupShareLinks();

// ------------------------------------------------------------------
// Submit
// ------------------------------------------------------------------
rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  formMsg.className = "form-msg";

  const attendingInput = attendGroup.querySelector("input:checked");
  if (!attendingInput) {
    formMsg.textContent = "Vui lòng chọn bạn có thể tham dự hay không.";
    formMsg.classList.add("error");
    return;
  }
  const attending = attendingInput.value;

  let mealPref = null;
  if (attending === "yes") {
    const mealInput = mealGroup.querySelector("input:checked");
    if (!mealInput) {
      formMsg.textContent = "Vui lòng chọn thực đơn (chay hoặc mặn).";
      formMsg.classList.add("error");
      return;
    }
    mealPref = mealInput.value;
  }

  // Chống spam: chặn gửi lại quá nhanh nhiều lần trong 1 phiên
  submitBtn.disabled = true;
  submitBtn.textContent = "Đang gửi…";

  try {
    await updateDoc(doc(db, "guests", currentGuestId), {
      rsvpStatus: attending,
      numAttending: attending === "yes" ? count : 0,
      mealPref: mealPref,
      message: messageInput.value.trim().slice(0, 300),
      respondedAt: serverTimestamp(),
    });

    markSubmittedLocally(currentGuestId);
    const params = new URLSearchParams({
      name: currentGuestData.name || "",
      status: attending,
    });
    window.location.href = `thankyou.html?${params.toString()}`;
  } catch (err) {
    console.error("Lỗi gửi RSVP:", err);
    formMsg.textContent = "Có lỗi xảy ra, vui lòng thử lại sau.";
    formMsg.classList.add("error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi xác nhận";
  }
});

// ------------------------------------------------------------------
// Init
// ------------------------------------------------------------------
loadGuest();
