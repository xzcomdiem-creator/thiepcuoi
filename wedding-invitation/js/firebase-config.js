/* ============================================================
   FIREBASE-CONFIG.JS
   Kết nối tới Firebase (Firestore + Authentication).

   CÁCH LẤY THÔNG TIN BÊN DƯỚI:
   1. Vào https://console.firebase.google.com → tạo project mới.
   2. Trong project → bấm biểu tượng "</>" (Add app → Web) để đăng ký
      1 web app → Firebase sẽ hiện đúng object "firebaseConfig" y hệt
      cấu trúc bên dưới → copy đè vào đây.
   3. Xem hướng dẫn đầy đủ từng bước trong README.md, mục
      "Thiết lập Firebase từ đầu".
   ============================================================ */

const firebaseConfig = {
  apiKey: "DÁN_API_KEY_VÀO_ĐÂY",
  authDomain: "TEN-PROJECT.firebaseapp.com",
  projectId: "TEN-PROJECT",
  storageBucket: "TEN-PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxxxx",
};

// Dùng Firebase SDK bản "compat" (nạp qua thẻ <script>, không cần build tool)
// để đồng bộ với cách viết JS thuần của các file khác trong dự án.
firebase.initializeApp(firebaseConfig);

// Chỉ khởi tạo Firestore/Auth nếu trang hiện tại có nạp đúng SDK con tương
// ứng (không phải trang nào cũng cần cả hai) — tránh lỗi "firebase.firestore
// is not a function" trên các trang chỉ dùng 1 trong 2 dịch vụ.
let db, auth;
if (typeof firebase.firestore === "function") db = firebase.firestore();
if (typeof firebase.auth === "function") auth = firebase.auth();

// Cảnh báo sớm nếu quên điền config thật — tránh lỗi khó hiểu ở console.
if (firebaseConfig.apiKey === "DÁN_API_KEY_VÀO_ĐÂY") {
  console.warn(
    "⚠️ Chưa cấu hình Firebase: hãy điền thông tin thật vào js/firebase-config.js (xem README.md)."
  );
}
