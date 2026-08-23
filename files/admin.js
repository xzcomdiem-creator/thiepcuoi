// js/admin.js
import { db, auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------------
// Auth guard
// ------------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    initData();
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// ------------------------------------------------------------------
// Tabs
// ------------------------------------------------------------------
document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const name = tab.dataset.tab;
    $("panel-guests").style.display = name === "guests" ? "block" : "none";
    $("panel-guestbook").style.display = name === "guestbook" ? "block" : "none";
  });
});

// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
let allGuests = []; // {id, ...data}
let allGuestbook = [];
let dataInitialized = false;

function initData() {
  if (dataInitialized) return;
  dataInitialized = true;
  listenGuests();
  listenGuestbook();
}

// ------------------------------------------------------------------
// Guests: realtime listener
// ------------------------------------------------------------------
function listenGuests() {
  const q = query(collection(db, "guests"), orderBy("name"));
  onSnapshot(
    q,
    (snap) => {
      allGuests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderStats();
      renderGuestTable();
    },
    (err) => {
      console.error("Lỗi tải danh sách khách:", err);
      $("guestTableBody").innerHTML =
        '<tr class="empty-row"><td colspan="9">Không thể tải dữ liệu.</td></tr>';
    }
  );
}

function renderStats() {
  const total = allGuests.length;
  const confirmed = allGuests.filter((g) => g.rsvpStatus === "yes");
  const declined = allGuests.filter((g) => g.rsvpStatus === "no");
  const pending = allGuests.filter((g) => !g.rsvpStatus || g.rsvpStatus === "pending");
  const headcount = confirmed.reduce((sum, g) => sum + (Number(g.numAttending) || 0), 0);

  $("statTotal").textContent = total;
  $("statConfirmed").textContent = confirmed.length;
  $("statDeclined").textContent = declined.length;
  $("statPending").textContent = pending.length;
  $("statHeadcount").textContent = headcount;
}

function statusBadge(status) {
  if (status === "yes") return '<span class="badge yes">Tham dự</span>';
  if (status === "no") return '<span class="badge no">Báo bận</span>';
  return '<span class="badge pending">Chưa phản hồi</span>';
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function rsvpLinkFor(guestId) {
  return `${location.origin}${location.pathname.replace(/admin\.html.*/, "")}rsvp.html?g=${guestId}`;
}

function renderGuestTable() {
  const search = $("guestSearch").value.trim().toLowerCase();
  const filter = $("guestFilter").value;

  let rows = allGuests.filter((g) => {
    const matchesSearch = !search || (g.name || "").toLowerCase().includes(search);
    const status = g.rsvpStatus || "pending";
    const matchesFilter = filter === "all" || status === filter;
    return matchesSearch && matchesFilter;
  });

  const tbody = $("guestTableBody");
  if (rows.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="9">Không tìm thấy khách mời nào.</td></tr>';
    return;
  }

  tbody.innerHTML = rows
    .map((g) => {
      const link = rsvpLinkFor(g.id);
      return `
        <tr>
          <td><strong>${escapeHtml(g.name)}</strong></td>
          <td>${escapeHtml(g.phone || "—")}</td>
          <td>${escapeHtml(g.maxGuests ?? 1)}</td>
          <td>${statusBadge(g.rsvpStatus)}</td>
          <td>${g.rsvpStatus === "yes" ? escapeHtml(g.numAttending ?? "—") : "—"}</td>
          <td>${g.mealPref ? (g.mealPref === "chay" ? "Chay" : "Mặn") : "—"}</td>
          <td style="max-width:180px;white-space:normal;">${escapeHtml(g.message || "—")}</td>
          <td><span class="link-copy" data-link="${escapeHtml(link)}" title="Bấm để sao chép">rsvp.html?g=${g.id.slice(0, 6)}…</span></td>
          <td>
            <button class="icon-btn" data-action="edit" data-id="${g.id}" title="Sửa">✏️</button>
            <button class="icon-btn danger" data-action="delete" data-id="${g.id}" title="Xóa">🗑️</button>
          </td>
        </tr>`;
    })
    .join("");
}

$("guestSearch").addEventListener("input", renderGuestTable);
$("guestFilter").addEventListener("change", renderGuestTable);

// Copy link / edit / delete via delegation
$("guestTableBody").addEventListener("click", async (e) => {
  const copyEl = e.target.closest(".link-copy");
  if (copyEl) {
    try {
      await navigator.clipboard.writeText(copyEl.dataset.link);
      const original = copyEl.textContent;
      copyEl.textContent = "Đã sao chép!";
      setTimeout(() => (copyEl.textContent = original), 1400);
    } catch {
      alert(copyEl.dataset.link);
    }
    return;
  }

  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const guest = allGuests.find((g) => g.id === id);
  if (!guest) return;

  if (btn.dataset.action === "edit") {
    openGuestModal(guest);
  } else if (btn.dataset.action === "delete") {
    if (confirm(`Xóa khách mời "${guest.name}"? Hành động này không thể hoàn tác.`)) {
      try {
        await deleteDoc(doc(db, "guests", id));
      } catch (err) {
        console.error(err);
        alert("Không thể xóa khách mời.");
      }
    }
  }
});

// ------------------------------------------------------------------
// Add / edit guest modal
// ------------------------------------------------------------------
const guestModalBackdrop = $("guestModalBackdrop");
const guestForm = $("guestForm");

function openGuestModal(guest = null) {
  $("guestModalTitle").textContent = guest ? "Sửa thông tin khách" : "Thêm khách mời";
  $("guestDocId").value = guest ? guest.id : "";
  $("modalGuestName").value = guest ? guest.name || "" : "";
  $("modalGuestPhone").value = guest ? guest.phone || "" : "";
  $("modalGuestMax").value = guest ? guest.maxGuests || 1 : 1;
  guestModalBackdrop.style.display = "flex";
  $("modalGuestName").focus();
}
function closeGuestModal() {
  guestModalBackdrop.style.display = "none";
  guestForm.reset();
}

$("addGuestBtn").addEventListener("click", () => openGuestModal());
$("guestModalCancel").addEventListener("click", closeGuestModal);
guestModalBackdrop.addEventListener("click", (e) => {
  if (e.target === guestModalBackdrop) closeGuestModal();
});

guestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("guestDocId").value;
  const name = $("modalGuestName").value.trim();
  const phone = $("modalGuestPhone").value.trim();
  const maxGuests = Number($("modalGuestMax").value) || 1;

  if (!name) return;

  const saveBtn = $("guestModalSave");
  saveBtn.disabled = true;
  saveBtn.textContent = "Đang lưu…";

  try {
    if (id) {
      await updateDoc(doc(db, "guests", id), { name, phone, maxGuests });
    } else {
      await addDoc(collection(db, "guests"), {
        name,
        phone,
        maxGuests,
        rsvpStatus: "pending",
        numAttending: 0,
        mealPref: null,
        message: "",
      });
    }
    closeGuestModal();
  } catch (err) {
    console.error(err);
    alert("Không thể lưu thông tin khách mời.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Lưu";
  }
});

// ------------------------------------------------------------------
// Export CSV
// ------------------------------------------------------------------
$("exportCsvBtn").addEventListener("click", () => {
  const header = ["Tên", "SĐT", "Tối đa", "Trạng thái", "Số dự", "Thực đơn", "Lời nhắn", "Link RSVP"];
  const rows = allGuests.map((g) => [
    g.name || "",
    g.phone || "",
    g.maxGuests ?? "",
    g.rsvpStatus === "yes" ? "Tham dự" : g.rsvpStatus === "no" ? "Báo bận" : "Chưa phản hồi",
    g.rsvpStatus === "yes" ? g.numAttending ?? "" : "",
    g.mealPref === "chay" ? "Chay" : g.mealPref === "man" ? "Mặn" : "",
    g.message || "",
    rsvpLinkFor(g.id),
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `khach-moi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ------------------------------------------------------------------
// Guestbook moderation
// ------------------------------------------------------------------
function listenGuestbook() {
  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
  onSnapshot(
    q,
    (snap) => {
      allGuestbook = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderGuestbookTable();
    },
    (err) => {
      console.error("Lỗi tải sổ lưu bút:", err);
      $("guestbookTableBody").innerHTML =
        '<tr class="empty-row"><td colspan="4">Không thể tải dữ liệu.</td></tr>';
    }
  );
}

function renderGuestbookTable() {
  const search = $("gbSearch").value.trim().toLowerCase();
  const rows = allGuestbook.filter(
    (m) =>
      !search ||
      (m.name || "").toLowerCase().includes(search) ||
      (m.message || "").toLowerCase().includes(search)
  );

  const tbody = $("guestbookTableBody");
  if (rows.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Chưa có lời chúc nào.</td></tr>';
    return;
  }

  tbody.innerHTML = rows
    .map((m) => {
      const when = m.createdAt?.toDate
        ? m.createdAt.toDate().toLocaleString("vi-VN")
        : "—";
      return `
        <tr>
          <td><strong>${escapeHtml(m.name)}</strong></td>
          <td style="max-width:320px;white-space:normal;">${escapeHtml(m.message)}</td>
          <td>${when}</td>
          <td><button class="icon-btn danger" data-id="${m.id}" title="Xóa">🗑️</button></td>
        </tr>`;
    })
    .join("");
}

$("gbSearch").addEventListener("input", renderGuestbookTable);

$("guestbookTableBody").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const item = allGuestbook.find((m) => m.id === btn.dataset.id);
  if (!item) return;
  if (confirm(`Xóa lời chúc của "${item.name}"?`)) {
    try {
      await deleteDoc(doc(db, "guestbook", item.id));
    } catch (err) {
      console.error(err);
      alert("Không thể xóa lời chúc.");
    }
  }
});
