# Hướng dẫn cài đặt phần khách mời tương tác

## 1. Tạo Firebase project
1. Vào https://console.firebase.google.com → **Add project**.
2. Bật **Firestore Database** (chế độ production) và **Storage**.
3. Bật **Authentication → Sign-in method → Email/Password**, rồi tạo 1 tài khoản admin (email + mật khẩu) trong tab **Users**.
4. Vào **Project settings → General → Your apps → Web app**, copy đoạn `firebaseConfig` rồi dán vào `js/firebase-config.js` (thay các giá trị `YOUR_...`).

## 2. Deploy security rules
Cài Firebase CLI rồi chạy trong thư mục dự án:
```
firebase init firestore storage
firebase deploy --only firestore:rules,storage:rules
```
(hoặc copy nội dung `firebase/firestore.rules` và `firebase/storage.rules` vào tab **Rules** trên Console).

## 3. Thêm khách mời
Sau khi đăng nhập `login.html` → vào `admin.html` → **+ Thêm khách** để tạo từng khách (tên, SĐT, số khách tối đa). Mỗi khách sẽ có 1 liên kết RSVP riêng dạng:
```
rsvp.html?g=<id-tu-dong-sinh>
```
Bấm vào ô liên kết trong bảng để sao chép, rồi gửi cho khách qua Zalo/SMS.

## 4. Cấu hình thông tin cá nhân hoá
- `js/rsvp.js`: chỉnh `RSVP_DEADLINE` (hạn chót phản hồi) và `BANK_ACCOUNT_NUMBER`.
- `rsvp.html`: thay ảnh `assets/qr/qr-bank.png` bằng QR chuyển khoản thật.
- `guestbook.html`, `thankyou.html`: có thể chỉnh văn án theo ý bạn.

## 5. Cấu trúc dữ liệu Firestore

**Collection `guests`** (mỗi document = 1 khách/1 hộ gia đình):
| field | type | mô tả |
|---|---|---|
| name | string | tên hiển thị trên thiệp |
| phone | string | SĐT (tùy chọn) |
| maxGuests | number | số người tối đa được mời |
| rsvpStatus | string | `pending` / `yes` / `no` |
| numAttending | number | số người thực tế tham dự |
| mealPref | string | `chay` / `man` |
| message | string | lời nhắn của khách |
| respondedAt | timestamp | thời điểm phản hồi |

**Collection `guestbook`** (mỗi document = 1 lời chúc công khai):
| field | type | mô tả |
|---|---|---|
| name | string | tên người gửi |
| message | string | nội dung lời chúc |
| createdAt | timestamp | thời điểm gửi |
| approved | boolean | luôn `true` khi tạo (dành cho kiểm duyệt sau này) |

## 6. Liên kết từ trang chính
Thêm vào `index.html` (nav hoặc nút CTA) các đường dẫn:
- `rsvp.html` — hoặc gửi link cá nhân hoá `rsvp.html?g=<id>` cho từng khách
- `guestbook.html` — sổ lưu bút công khai
