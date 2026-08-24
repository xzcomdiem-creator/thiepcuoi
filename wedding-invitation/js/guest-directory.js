/* ============================================================
   GUEST-DIRECTORY.JS
   Dùng chung cho index.html và rsvp.html.

   Từ khi có trang quản trị tạo khách hàng loạt, danh sách khách
   "thật" nằm trong Firestore (collection "guests"), KHÔNG còn nằm
   trong js/config.js nữa (config.js vẫn được đọc để tương thích
   ngược với các mã khách đã khai báo tay từ trước).

   Cung cấp 2 hàm dùng ở main.js / rsvp.js:
   - WeddingGuests.resolve(code, callback) : tìm tên khách theo mã.
       Thử Firestore trước (mới, hỗ trợ đếm lượt xem), nếu không có
       thì thử js/config.js -> guests (cách cũ). callback(nameOrNull, source)
       source: "dynamic" | "static" | null
   - WeddingGuests.logView(code) : âm thầm ghi nhận 1 lượt xem link
       riêng của khách (chỉ áp dụng cho khách tạo qua trang quản trị —
       "dynamic"). Không chặn hiển thị trang, lỗi thì bỏ qua.
   ============================================================ */
window.WeddingGuests = (function () {

  function resolve(code, callback) {
    if (!code) { callback(null, null); return; }

    const staticGuest = (typeof WEDDING_CONFIG !== "undefined" && WEDDING_CONFIG.guests) ? WEDDING_CONFIG.guests[code] : null;

    if (typeof db === "undefined") {
      // Chưa kết nối Firebase (vd. lỗi mạng) -> chỉ dùng danh sách tĩnh nếu có.
      callback(staticGuest ? staticGuest.name : null, staticGuest ? "static" : null);
      return;
    }

    db.collection("guests").doc(code).get().then((snap) => {
      if (snap.exists && snap.data().name) {
        callback(snap.data().name, "dynamic");
      } else if (staticGuest) {
        callback(staticGuest.name, "static");
      } else {
        callback(null, null);
      }
    }).catch(() => {
      callback(staticGuest ? staticGuest.name : null, staticGuest ? "static" : null);
    });
  }

  function logView(code) {
    if (!code || typeof db === "undefined") return;
    const ref = db.collection("guests").doc(code);
    ref.get().then((snap) => {
      if (!snap.exists) return; // chỉ đếm với khách tạo qua trang quản trị
      const data = snap.data();
      const update = {
        lastViewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        viewCount: (data.viewCount || 0) + 1,
      };
      if (!data.firstViewedAt) update.firstViewedAt = firebase.firestore.FieldValue.serverTimestamp();
      ref.update(update).catch(() => { /* im lặng bỏ qua — không ảnh hưởng trải nghiệm khách */ });
    }).catch(() => { /* im lặng bỏ qua */ });
  }

  return { resolve, logView };
})();
