/* ============================================================
   ADMIN.JS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = WEDDING_CONFIG;
  document.getElementById("adminBrand").textContent =
    `Quản trị — ${cfg.bride.shortName} & ${cfg.groom.shortName}`;

  const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 giờ

  function sessionValid() {
    const t = parseInt(sessionStorage.getItem("admin_session") || "0", 10);
    return t > 0 && (Date.now() - t) < SESSION_MAX_AGE_MS;
  }

  /* ---------- GUARD: bắt buộc đã đăng nhập (session hợp lệ + đã xác thực Firebase) ---------- */
  if (typeof auth === "undefined") {
    window.location.href = "login.html";
    return;
  }

  auth.onAuthStateChanged((user) => {
    // Chỉ chấp nhận tài khoản admin THẬT (email/mật khẩu) — không chấp nhận
    // đăng nhập ẩn danh (Firestore Rules cũng đã chặn ở phía máy chủ, đây là
    // lớp kiểm tra thêm ở phía trình duyệt để chuyển hướng gọn hơn).
    if (!user || user.isAnonymous || !sessionValid()) {
      window.location.href = "login.html";
      return;
    }
    initDashboard();
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    sessionStorage.removeItem("admin_session");
    try { await auth.signOut(); } catch { /* ignore */ }
    window.location.href = "login.html";
  });

  /* ---------- DASHBOARD ---------- */
  let rsvpDocs = [];   // { id, name, attending, guestCount, meal, message, updatedAt }
  let gbDocs = [];
  let guestDocs = [];  // { id (=mã khách), name, note, viewCount, lastViewedAt, ... }

  function initDashboard() {
    loadRsvps();
    loadGuestbook();
    loadGuests();
    checkBackupReminder();
  }

  function fmtTime(ts) {
    if (!ts || !ts.toDate) return "–";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(ts.toDate());
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /* ---------- RSVP TABLE ---------- */
  function loadRsvps() {
    db.collection("rsvps").orderBy("updatedAt", "desc").get()
      .then((snap) => {
        rsvpDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderStats();
        renderRsvpTable(rsvpDocs);
        renderGuestTable(); // cập nhật lại cột "Đã RSVP?" ở bảng khách mời
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("rsvpEmpty").style.display = "block";
        document.getElementById("rsvpEmpty").textContent = "Không tải được danh sách RSVP.";
      });
  }

  function renderRsvpTable(docs) {
    const tbody = document.getElementById("rsvpTableBody");
    const empty = document.getElementById("rsvpEmpty");
    if (docs.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      empty.textContent = "Chưa có phản hồi RSVP nào.";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = docs.map(d => `
      <tr data-id="${d.id}">
        <td>${escapeHtml(d.name)}</td>
        <td><span class="badge ${d.attending ? "yes" : "no"}">${d.attending ? "Có" : "Không"}</span></td>
        <td>${d.attending ? (d.guestCount || 1) : "–"}</td>
        <td>${d.attending ? (d.meal === "chay" ? "Chay" : "Mặn") : "–"}</td>
        <td class="wrap">${escapeHtml(d.message) || "–"}</td>
        <td>${fmtTime(d.updatedAt || d.createdAt)}</td>
        <td><button class="row-delete" data-type="rsvp" data-id="${d.id}">Xoá</button></td>
      </tr>`).join("");
  }

  document.getElementById("rsvpSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderRsvpTable(rsvpDocs.filter(d => (d.name || "").toLowerCase().includes(q)));
  });

  /* ---------- GUESTBOOK TABLE ---------- */
  function loadGuestbook() {
    db.collection("guestbook").orderBy("createdAt", "desc").get()
      .then((snap) => {
        gbDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderStats();
        renderGbTable();
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("gbEmpty").style.display = "block";
        document.getElementById("gbEmpty").textContent = "Không tải được sổ lưu bút.";
      });
  }

  function renderGbTable() {
    const tbody = document.getElementById("gbTableBody");
    const empty = document.getElementById("gbEmpty");
    if (gbDocs.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      empty.textContent = "Chưa có lời chúc nào.";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = gbDocs.map(d => `
      <tr data-id="${d.id}">
        <td>${escapeHtml(d.name)}</td>
        <td class="wrap">${escapeHtml(d.message)}</td>
        <td>${fmtTime(d.createdAt)}</td>
        <td><button class="row-delete" data-type="gb" data-id="${d.id}">Xoá</button></td>
      </tr>`).join("");
  }

  /* ---------- XOÁ (ủy quyền qua event delegation) ---------- */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".row-delete");
    if (!btn) return;
    const { type, id } = btn.dataset;
    if (!confirm("Bạn chắc chắn muốn xoá mục này?")) return;
    const coll = type === "rsvp" ? "rsvps" : type === "gb" ? "guestbook" : "guests";
    try {
      await db.collection(coll).doc(id).delete();
      if (type === "rsvp") {
        rsvpDocs = rsvpDocs.filter(d => d.id !== id);
        renderRsvpTable(rsvpDocs);
      } else if (type === "gb") {
        gbDocs = gbDocs.filter(d => d.id !== id);
        renderGbTable();
      } else {
        guestDocs = guestDocs.filter(d => d.id !== id);
        renderGuestTable();
      }
      renderStats();
    } catch (err) {
      console.error(err);
      alert("Xoá thất bại — vui lòng thử lại.");
    }
  });

  /* ---------- THỐNG KÊ ---------- */
  function renderStats() {
    const responded = rsvpDocs.length;
    const attending = rsvpDocs.filter(d => d.attending);
    const notAttending = rsvpDocs.filter(d => !d.attending);
    const totalGuests = attending.reduce((sum, d) => sum + (d.guestCount || 1), 0);
    const chay = attending.filter(d => d.meal === "chay").length;
    const man = attending.filter(d => d.meal === "man").length;

    // Danh sách "đã mời": ưu tiên khách tạo qua trang quản trị (guests),
    // cộng thêm mã khách khai báo tay trong config.js chưa có trong đó
    // (tương thích ngược cho các dự án tạo từ trước khi có tính năng này).
    const dynamicCodes = new Set(guestDocs.map(g => g.id));
    const staticCodes = Object.keys(cfg.guests || {}).filter(c => !dynamicCodes.has(c));
    const invitedCodes = [...dynamicCodes, ...staticCodes];
    const respondedCodes = new Set(rsvpDocs.map(d => d.guestCode).filter(Boolean));
    const pending = invitedCodes.filter(c => !respondedCodes.has(c)).length;
    const viewed = guestDocs.filter(g => (g.viewCount || 0) > 0).length;

    document.getElementById("statResponded").textContent = responded;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statAttendingGuests").textContent = totalGuests;
    document.getElementById("statNotAttending").textContent = notAttending.length;
    document.getElementById("statMealChay").textContent = chay;
    document.getElementById("statMealMan").textContent = man;
    document.getElementById("statGuestbook").textContent = gbDocs.length;
    document.getElementById("statViewed").textContent = `${viewed}/${guestDocs.length}`;
  }

  /* ============================================================
     QUẢN LÝ KHÁCH MỜI — tạo link riêng hàng loạt + theo dõi lượt xem
     ============================================================ */
  const baseInviteUrl = window.location.href.replace(/admin\.html.*$/, "index.html");

  function slugify(str) {
    return str
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "khach";
  }

  function uniqueCode(base, takenSet) {
    let code = base, n = 2;
    while (takenSet.has(code)) { code = `${base}-${n}`; n++; }
    takenSet.add(code);
    return code;
  }

  function loadGuests() {
    db.collection("guests").orderBy("createdAt", "desc").get()
      .then((snap) => {
        guestDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderStats();
        renderGuestTable();
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("guestEmpty").style.display = "block";
        document.getElementById("guestEmpty").textContent = "Không tải được danh sách khách.";
      });
  }

  function inviteLink(code) {
    return `${baseInviteUrl}?to=${encodeURIComponent(code)}`;
  }

  function guestRsvpStatus(code) {
    const r = rsvpDocs.find(d => d.guestCode === code);
    if (!r) return { label: "Chưa RSVP", cls: "muted" };
    return r.attending ? { label: "Tham dự", cls: "yes" } : { label: "Vắng mặt", cls: "no" };
  }

  function renderGuestTable() {
    const tbody = document.getElementById("guestTableBody");
    const empty = document.getElementById("guestEmpty");
    const q = document.getElementById("guestSearch").value.trim().toLowerCase();
    const filter = document.getElementById("guestFilter").value;

    let docs = guestDocs.filter(g => (g.name || "").toLowerCase().includes(q));
    if (filter === "viewed") docs = docs.filter(g => (g.viewCount || 0) > 0);
    if (filter === "not-viewed") docs = docs.filter(g => !(g.viewCount > 0));
    if (filter === "rsvped") docs = docs.filter(g => rsvpDocs.some(d => d.guestCode === g.id));
    if (filter === "not-rsvped") docs = docs.filter(g => !rsvpDocs.some(d => d.guestCode === g.id));

    if (docs.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      empty.textContent = guestDocs.length === 0 ? "Chưa có khách nào — nhập danh sách ở khung phía trên." : "Không tìm thấy khách phù hợp.";
      return;
    }
    empty.style.display = "none";

    tbody.innerHTML = docs.map(g => {
      const link = inviteLink(g.id);
      const viewed = (g.viewCount || 0) > 0;
      const rsvpStat = guestRsvpStatus(g.id);
      return `
        <tr data-id="${g.id}">
          <td>${escapeHtml(g.name)}</td>
          <td class="wrap">${escapeHtml(g.note) || "–"}</td>
          <td>
            <div class="link-cell">
              <input type="text" readonly value="${escapeHtml(link)}">
              <button class="copy-btn" data-link="${escapeHtml(link)}" type="button">Sao chép</button>
            </div>
          </td>
          <td><span class="badge ${viewed ? "yes" : "muted"}">${viewed ? `Đã xem (${g.viewCount})` : "Chưa xem"}</span>${viewed && g.lastViewedAt ? `<div class="hint" style="margin-top:4px;">${fmtTime(g.lastViewedAt)}</div>` : ""}</td>
          <td><span class="badge ${rsvpStat.cls}">${rsvpStat.label}</span></td>
          <td><button class="row-delete" data-type="guest" data-id="${g.id}">Xoá</button></td>
        </tr>`;
    }).join("");
  }

  document.getElementById("guestSearch").addEventListener("input", renderGuestTable);
  document.getElementById("guestFilter").addEventListener("change", renderGuestTable);

  // Sao chép link riêng (Clipboard API, dự phòng execCommand cho trình duyệt cũ).
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const link = btn.dataset.link;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = link;
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(tmp);
    }
    const original = btn.textContent;
    btn.textContent = "Đã chép!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1500);
  });

  /* ---------- THÊM KHÁCH HÀNG LOẠT ---------- */
  document.getElementById("bulkGuestBtn").addEventListener("click", async () => {
    const raw = document.getElementById("bulkGuestInput").value;
    const statusEl = document.getElementById("bulkGuestStatus");
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      statusEl.textContent = "Vui lòng nhập ít nhất 1 khách.";
      statusEl.className = "form-status show error";
      return;
    }

    const taken = new Set(guestDocs.map(g => g.id));
    const btn = document.getElementById("bulkGuestBtn");
    btn.disabled = true;
    btn.textContent = "Đang tạo...";

    let created = 0;
    try {
      for (const line of lines) {
        const [namePart, ...noteParts] = line.split(",");
        const name = namePart.trim();
        const note = noteParts.join(",").trim();
        if (!name) continue;
        const code = uniqueCode(slugify(name), taken);
        const payload = {
          name,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          viewCount: 0,
        };
        if (note) payload.note = note;
        await db.collection("guests").doc(code).set(payload);
        created++;
      }
      statusEl.textContent = `Đã tạo ${created} link khách mời.`;
      statusEl.className = "form-status show info";
      document.getElementById("bulkGuestInput").value = "";
      loadGuests();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Có lỗi khi tạo danh sách — vui lòng thử lại.";
      statusEl.className = "form-status show error";
    } finally {
      btn.disabled = false;
      btn.textContent = "Tạo link hàng loạt";
    }
  });

  /* ---------- THÊM 1 KHÁCH ---------- */
  document.getElementById("singleGuestBtn").addEventListener("click", async () => {
    const nameInput = document.getElementById("singleGuestName");
    const noteInput = document.getElementById("singleGuestNote");
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    const taken = new Set(guestDocs.map(g => g.id));
    const code = uniqueCode(slugify(name), taken);
    const payload = { name, createdAt: firebase.firestore.FieldValue.serverTimestamp(), viewCount: 0 };
    const note = noteInput.value.trim();
    if (note) payload.note = note;
    try {
      await db.collection("guests").doc(code).set(payload);
      nameInput.value = "";
      noteInput.value = "";
      loadGuests();
    } catch (err) {
      console.error(err);
      alert("Thêm khách thất bại — vui lòng thử lại.");
    }
  });

  /* ---------- XUẤT CSV DANH SÁCH LINK ---------- */
  document.getElementById("exportGuestsCsvBtn").addEventListener("click", () => {
    const header = ["Ten", "Ghi chu", "Link rieng", "Da xem", "So lan xem", "Da RSVP"];
    const rows = guestDocs.map(g => {
      const rsvpStat = guestRsvpStatus(g.id);
      return [
        g.name || "", g.note || "", inviteLink(g.id),
        (g.viewCount || 0) > 0 ? "Co" : "Chua",
        g.viewCount || 0,
        rsvpStat.label,
      ];
    });
    downloadCsv(header, rows, `danh-sach-khach-${cfg.bride.shortName}-${cfg.groom.shortName}.csv`);
  });

  /* ---------- XUẤT CSV SỔ LƯU BÚT ---------- */
  document.getElementById("exportGbCsvBtn").addEventListener("click", () => {
    const header = ["Ten", "Loi chuc", "Thoi gian"];
    const rows = gbDocs.map(d => [
      d.name || "", (d.message || "").replace(/\n/g, " "),
      d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString("vi-VN") : "",
    ]);
    downloadCsv(header, rows, `so-luu-but-${cfg.bride.shortName}-${cfg.groom.shortName}.csv`);
  });

  function downloadCsv(header, rows, filename) {
    const csv = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename.replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ---------- XUẤT CSV (RSVP) ---------- */
  document.getElementById("exportCsvBtn").addEventListener("click", () => {
    const header = ["Ten", "Tham du", "So nguoi", "Thuc don", "Loi nhan", "Cap nhat luc"];
    const rows = rsvpDocs.map(d => [
      d.name || "",
      d.attending ? "Co" : "Khong",
      d.attending ? (d.guestCount || 1) : "",
      d.attending ? (d.meal === "chay" ? "Chay" : "Man") : "",
      (d.message || "").replace(/\n/g, " "),
      d.updatedAt && d.updatedAt.toDate ? d.updatedAt.toDate().toLocaleString("vi-VN") : "",
    ]);
    downloadCsv(header, rows, `rsvp-${cfg.bride.shortName}-${cfg.groom.shortName}.csv`);
  });

  /* ---------- XUẤT EXCEL BÁO NHÀ HÀNG (.xlsx, nhiều sheet) ---------- */
  document.getElementById("exportExcelBtn").addEventListener("click", () => {
    if (typeof XLSX === "undefined") {
      alert("Chưa tải được thư viện xuất Excel — kiểm tra kết nối mạng rồi thử lại.");
      return;
    }
    const attending = rsvpDocs.filter(d => d.attending);
    const restaurantRows = attending.map(d => ([
      d.name || "", d.guestCount || 1, d.meal === "chay" ? "Chay" : "Mặn", d.message || "",
    ]));
    const totalGuests = attending.reduce((s, d) => s + (d.guestCount || 1), 0);
    const totalChay = attending.reduce((s, d) => s + (d.meal === "chay" ? (d.guestCount || 1) : 0), 0);
    const totalMan = totalGuests - totalChay;
    restaurantRows.push([]);
    restaurantRows.push(["TỔNG", totalGuests, `${totalChay} chay / ${totalMan} mặn`, ""]);

    const wsRestaurant = XLSX.utils.aoa_to_sheet([
      ["Tên khách", "Số người", "Thực đơn", "Ghi chú"],
      ...restaurantRows,
    ]);
    wsRestaurant["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 12 }, { wch: 36 }];

    const wsAll = XLSX.utils.aoa_to_sheet([
      ["Tên", "Tham dự", "Số người", "Thực đơn", "Lời nhắn", "Cập nhật lúc"],
      ...rsvpDocs.map(d => [
        d.name || "", d.attending ? "Có" : "Không",
        d.attending ? (d.guestCount || 1) : "", d.attending ? (d.meal === "chay" ? "Chay" : "Mặn") : "",
        d.message || "", d.updatedAt && d.updatedAt.toDate ? d.updatedAt.toDate().toLocaleString("vi-VN") : "",
      ]),
    ]);
    wsAll["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 36 }, { wch: 16 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsRestaurant, "Bao nha hang");
    XLSX.utils.book_append_sheet(wb, wsAll, "Toan bo RSVP");
    XLSX.writeFile(wb, `bao-nha-hang-${cfg.bride.shortName}-${cfg.groom.shortName}.xlsx`.replace(/\s+/g, "-"));
  });

  /* ============================================================
     SAO LƯU DỮ LIỆU — xuất toàn bộ RSVP + lời chúc + khách mời (.json)
     Website tĩnh không có máy chủ chạy nền nên không thể "tự backup
     định kỳ" thật sự — nút này để admin chủ động bấm, và trang sẽ
     nhắc nếu đã lâu (>7 ngày) chưa bấm lần nào trên trình duyệt này.
     ============================================================ */
  const LS_LAST_BACKUP = "admin_last_backup";
  const BACKUP_REMIND_MS = 7 * 24 * 60 * 60 * 1000;

  function checkBackupReminder() {
    const last = parseInt(localStorage.getItem(LS_LAST_BACKUP) || "0", 10);
    const banner = document.getElementById("backupBanner");
    if (!last) {
      banner.style.display = "block";
      banner.textContent = "Bạn chưa từng sao lưu dữ liệu trên trình duyệt này — nên bấm \"Sao lưu ngay\" ở cuối trang.";
    } else if (Date.now() - last > BACKUP_REMIND_MS) {
      const days = Math.floor((Date.now() - last) / 86400000);
      banner.style.display = "block";
      banner.textContent = `Đã ${days} ngày kể từ lần sao lưu gần nhất — nên sao lưu lại để tránh mất dữ liệu.`;
    }
    updateLastBackupText();
  }

  function updateLastBackupText() {
    const last = parseInt(localStorage.getItem(LS_LAST_BACKUP) || "0", 10);
    document.getElementById("lastBackupText").textContent = last
      ? `Lần sao lưu gần nhất (trên trình duyệt này): ${new Date(last).toLocaleString("vi-VN")}`
      : "Chưa có lần sao lưu nào trên trình duyệt này.";
  }

  document.getElementById("backupBtn").addEventListener("click", async () => {
    const btn = document.getElementById("backupBtn");
    btn.disabled = true;
    btn.textContent = "Đang chuẩn bị...";
    try {
      const [rsvpSnap, gbSnap, guestSnap] = await Promise.all([
        db.collection("rsvps").get(),
        db.collection("guestbook").get(),
        db.collection("guests").get(),
      ]);
      const toPlain = (snap) => snap.docs.map(d => {
        const data = d.data();
        const plain = { id: d.id };
        Object.keys(data).forEach(k => {
          const v = data[k];
          plain[k] = (v && typeof v.toDate === "function") ? v.toDate().toISOString() : v;
        });
        return plain;
      });
      const backup = {
        exportedAt: new Date().toISOString(),
        wedding: `${cfg.bride.shortName} & ${cfg.groom.shortName}`,
        rsvps: toPlain(rsvpSnap),
        guestbook: toPlain(gbSnap),
        guests: toPlain(guestSnap),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      localStorage.setItem(LS_LAST_BACKUP, String(Date.now()));
      document.getElementById("backupBanner").style.display = "none";
      updateLastBackupText();
    } catch (err) {
      console.error(err);
      alert("Sao lưu thất bại — vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Sao lưu ngay (.json)";
    }
  });
});
