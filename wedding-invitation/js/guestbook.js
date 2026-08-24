/* ============================================================
   GUESTBOOK.JS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = WEDDING_CONFIG;
  document.title = `Sổ Lưu Bút — ${cfg.bride.shortName} & ${cfg.groom.shortName}`;
  document.getElementById("monogramSm").innerHTML = `${cfg.bride.initial} &amp; ${cfg.groom.initial}`;
  document.getElementById("gbIntro").textContent = cfg.guestbook.intro;

  const listEl = document.getElementById("gbList");
  const loadMoreBtn = document.getElementById("gbLoadMore");
  const relTimeFormatter = new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" });

  function timeAgo(date) {
    const diffSec = Math.round((date - new Date()) / 1000);
    const abs = Math.abs(diffSec);
    if (abs < 60) return "Vừa xong";
    if (abs < 3600) return relTimeFormatter.format(Math.round(diffSec / 60), "minute");
    if (abs < 86400) return relTimeFormatter.format(Math.round(diffSec / 3600), "hour");
    return relTimeFormatter.format(Math.round(diffSec / 86400), "day");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- 1. TẢI + HIỂN THỊ LỜI CHÚC (mới nhất trước, phân trang bằng "xem thêm") ---------- */
  let pageSize = 12;

  function renderList(docs) {
    if (docs.length === 0) {
      listEl.innerHTML = `<p class="gb-empty">Chưa có lời chúc nào — hãy là người đầu tiên!</p>`;
      loadMoreBtn.style.display = "none";
      return;
    }
    listEl.innerHTML = docs.map(d => {
      const data = d.data();
      const created = data.createdAt ? data.createdAt.toDate() : new Date();
      return `
        <div class="gb-card">
          <div class="gb-name">${escapeHtml(data.name || "Ẩn danh")}</div>
          <div class="gb-msg">${escapeHtml(data.message || "")}</div>
          <div class="gb-time">${timeAgo(created)}</div>
        </div>`;
    }).join("");
  }

  function loadWishes() {
    if (typeof db === "undefined") {
      listEl.innerHTML = `<p class="gb-empty">Chưa kết nối được hệ thống lưu bút.</p>`;
      return;
    }
    db.collection("guestbook").orderBy("createdAt", "desc").limit(pageSize).get()
      .then((snap) => {
        renderList(snap.docs);
        loadMoreBtn.style.display = snap.docs.length >= pageSize ? "block" : "none";
      })
      .catch((err) => {
        console.error(err);
        listEl.innerHTML = `<p class="gb-empty">Không tải được lời chúc — vui lòng thử lại sau.</p>`;
      });
  }
  loadWishes();

  loadMoreBtn.addEventListener("click", () => {
    pageSize += 12;
    loadWishes();
  });

  /* ---------- 2. GỬI LỜI CHÚC MỚI ---------- */
  const form = document.getElementById("guestbookForm");
  const submitBtn = document.getElementById("gbSubmitBtn");
  const statusEl = document.getElementById("gbStatus");

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `form-status show ${type}`;
  }

  const LS_LAST_GB = "gb_last_submit";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    // Honeypot
    if (document.getElementById("gbWebsite").value.trim() !== "") {
      form.reset();
      showStatus("Đã gửi. Cảm ơn bạn!", "info");
      return;
    }

    const cooldownMs = (cfg.guestbook.cooldownSeconds || 45) * 1000;
    const lastSubmit = parseInt(localStorage.getItem(LS_LAST_GB) || "0", 10);
    if (Date.now() - lastSubmit < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (Date.now() - lastSubmit)) / 1000);
      showStatus(`Bạn vừa gửi lời chúc — vui lòng đợi ${waitSec} giây rồi gửi tiếp.`, "error");
      return;
    }

    const name = document.getElementById("gbName").value.trim();
    const message = document.getElementById("gbMessage").value.trim();
    if (!name || !message) { showStatus("Vui lòng nhập tên và lời chúc.", "error"); return; }
    if (typeof db === "undefined") { showStatus("Chưa kết nối được hệ thống — vui lòng thử lại sau.", "error"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    try {
      await db.collection("guestbook").add({
        name: name.slice(0, 60),
        message: message.slice(0, 300),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      localStorage.setItem(LS_LAST_GB, String(Date.now()));
      form.reset();
      showStatus("Đã gửi lời chúc — cảm ơn bạn!", "info");
      pageSize = Math.max(pageSize, 12);
      loadWishes();
    } catch (err) {
      console.error(err);
      showStatus("Có lỗi khi gửi — vui lòng thử lại.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi lời chúc";
    }
  });
});
