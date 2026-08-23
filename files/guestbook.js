// js/guestbook.js
import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ------------------------------------------------------------------
// Chống spam: giới hạn 1 lời chúc mỗi 60 giây / trình duyệt
// ------------------------------------------------------------------
const RATE_LIMIT_MS = 60 * 1000;
const RATE_LIMIT_KEY = "guestbook_last_submit";

function canSubmitNow() {
  const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
  return Date.now() - last > RATE_LIMIT_MS;
}
function markSubmitted() {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
}
function secondsUntilAllowed() {
  const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
  return Math.max(0, Math.ceil((RATE_LIMIT_MS - (Date.now() - last)) / 1000));
}

// ------------------------------------------------------------------
// DOM refs
// ------------------------------------------------------------------
const form = document.getElementById("guestbookForm");
const nameInput = document.getElementById("gbName");
const messageInput = document.getElementById("gbMessage");
const charCount = document.getElementById("gbCharCount");
const submitBtn = document.getElementById("gbSubmitBtn");
const formMsg = document.getElementById("gbFormMsg");
const list = document.getElementById("gbList");

messageInput.addEventListener("input", () => {
  charCount.textContent = messageInput.value.length;
});

// ------------------------------------------------------------------
// Render helpers (dùng textContent để tránh XSS)
// ------------------------------------------------------------------
function timeAgo(ts) {
  if (!ts) return "";
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return date.toLocaleDateString("vi-VN");
}

function renderList(docs) {
  if (docs.length === 0) {
    list.innerHTML = '<p class="gb-empty">Chưa có lời chúc nào. Hãy là người đầu tiên! 💛</p>';
    return;
  }
  list.innerHTML = "";
  docs.forEach((docSnap) => {
    const d = docSnap.data();
    const note = document.createElement("div");
    note.className = "gb-note";

    const msg = document.createElement("p");
    msg.className = "msg";
    msg.textContent = d.message || "";

    const who = document.createElement("div");
    who.className = "who";
    who.textContent = `— ${d.name || "Ẩn danh"}`;

    const when = document.createElement("div");
    when.className = "when";
    when.textContent = timeAgo(d.createdAt);

    note.appendChild(msg);
    note.appendChild(who);
    note.appendChild(when);
    list.appendChild(note);
  });
}

// ------------------------------------------------------------------
// Realtime listener (mới nhất trước, giới hạn 200 lời chúc gần nhất)
// ------------------------------------------------------------------
const gbQuery = query(collection(db, "guestbook"), orderBy("createdAt", "desc"), limit(200));

onSnapshot(
  gbQuery,
  (snapshot) => renderList(snapshot.docs),
  (err) => {
    console.error("Lỗi tải sổ lưu bút:", err);
    list.innerHTML = '<p class="gb-empty">Không thể tải lời chúc lúc này.</p>';
  }
);

// ------------------------------------------------------------------
// Submit
// ------------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  formMsg.className = "form-msg";

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    formMsg.textContent = "Vui lòng nhập đầy đủ tên và lời chúc.";
    formMsg.classList.add("error");
    return;
  }
  if (message.length > 280) {
    formMsg.textContent = "Lời chúc quá dài, vui lòng rút gọn.";
    formMsg.classList.add("error");
    return;
  }
  if (!canSubmitNow()) {
    formMsg.textContent = `Bạn vừa gửi lời chúc. Vui lòng đợi ${secondsUntilAllowed()} giây để gửi tiếp.`;
    formMsg.classList.add("error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang gửi…";

  try {
    await addDoc(collection(db, "guestbook"), {
      name: name.slice(0, 60),
      message: message.slice(0, 280),
      createdAt: serverTimestamp(),
      approved: true,
    });
    markSubmitted();
    form.reset();
    charCount.textContent = "0";
    formMsg.textContent = "Cảm ơn bạn đã gửi lời chúc! 💐";
    formMsg.classList.add("ok");
  } catch (err) {
    console.error("Lỗi gửi lời chúc:", err);
    formMsg.textContent = "Có lỗi xảy ra, vui lòng thử lại.";
    formMsg.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi lời chúc 💌";
  }
});
