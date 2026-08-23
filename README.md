# Thiệp Cưới Online — Gia Hân & Minh Khôi

## ✅ Đã hoàn thành trong đợt này (mục 1 — trang chính)

Trang `index.html` bao gồm đầy đủ:

1. **Thiệp cá nhân hoá** — gửi link kèm `?to=an-gia` (mã khách khai báo trong `js/config.js -> guests`), hoặc `?name=Tên%20Khách` để cá nhân hoá tự do không cần khai báo trước.
2. **Đếm ngược** — đồng hồ chính ở đầu trang tính tới lễ gần nhất; nếu các lễ khác ngày nhau, mỗi thẻ lễ trong mục "Lịch trình" sẽ có đồng hồ đếm ngược riêng.
3. **Câu chuyện tình yêu** — dòng thời gian dạng timeline, sửa nội dung ở `loveStory` trong config.
4. **Lịch trình chi tiết** — mỗi nghi lễ có giờ, địa chỉ, ghi chú và nút chỉ đường + thêm vào lịch riêng.
5. **Thư viện ảnh/video** — lưới ảnh có lightbox (bấm để phóng to, điều hướng bằng phím mũi tên) + khung video.
6. **Bản đồ + QR chỉ đường** — nhúng Google Maps và tự sinh QR chỉ đường + QR mừng cưới (VietQR) từ dữ liệu config, không cần tự tạo ảnh QR.
7. **Nhạc nền** — nút bật/tắt nổi góc trái; tự phát nếu trình duyệt cho phép (di động thường chặn, khách cần bấm 1 lần).
8. **Lưu vào lịch (Google/Apple)** — nút dropdown ở đầu trang, và nút riêng trong từng thẻ lễ; Apple/Outlook dùng file `.ics` tự tải xuống.
9. **Gợi ý khách sạn gần đó** — danh sách chỗ ở kèm khoảng cách, giá tham khảo, link bản đồ.
10. **Dress code** — bảng màu gợi ý dạng swatch tròn.
11. **FAQ dạng accordion** — trẻ em, chỗ đậu xe, giờ nên tới, quà mừng, trang phục.

## 🎨 Định hướng thiết kế

- Chủ đề "khu vườn lúc hoàng hôn": xanh rêu đậm (#1F3A2E), ngà (#FBF7EF), vàng đồng cổ (#B99A5B), hồng đất (#D8A7A1).
- Font chữ: **Playfair Display** (tiêu đề) + **Be Vietnam Pro** (nội dung — font hỗ trợ tiếng Việt tốt, do người Việt thiết kế).
- Dây leo (vine) SVG mảnh làm hoạ tiết xuyên suốt, tượng trưng cho hành trình tình yêu "đâm chồi" qua từng mốc thời gian.
- Có hiệu ứng mở màn (loader monogram), cuộn hiện dần (`reveal`), tôn trọng `prefers-reduced-motion`.

## ✏️ Cách chỉnh sửa nội dung

**Chỉ cần sửa file `js/config.js`** — mọi tên, ngày giờ, địa điểm, câu chuyện, ảnh, khách sạn, dress code, FAQ, QR ngân hàng, danh sách khách mời đều nằm ở đó. Không cần sửa HTML/CSS/JS khác.

Sau đó:
- Bỏ ảnh thật vào `assets/images/`, video vào `assets/videos/`, nhạc vào `assets/music/` (xem README.txt trong từng thư mục).
- Sửa `bankQR` trong config với thông tin tài khoản thật để QR mừng cưới hoạt động đúng.

## ⏭️ Chưa nằm trong phạm vi đợt này

Cấu trúc thư mục đã có sẵn chỗ cho các trang sau, nhưng **chưa được xây dựng**:
`rsvp.html`, `thankyou.html`, `guestbook.html`, `admin.html`, `login.html`, và kết nối Firebase (`js/firebase-config.js`, `firebase/*.rules`). Đây là các mục cần một bước riêng (đặc biệt là RSVP + sổ lưu bút + trang quản trị cần backend Firebase thật với dữ liệu của bạn) — mình có thể làm tiếp nếu bạn muốn.
