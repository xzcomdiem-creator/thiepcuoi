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

## ✅ Đã hoàn thành trong đợt này (mục 2 — RSVP, sổ lưu bút, quản trị)

1. **RSVP có sẵn tên** — `rsvp.html`, vào bằng link riêng `?to=an-gia` sẽ tự điền tên (lấy từ `guests` trong config), khách chỉ cần xác nhận tham dự/vắng mặt, số người, chay/mặn, lời nhắn. Nếu khách quay lại đúng link đó lần nữa, form tự nạp lại câu trả lời cũ để **sửa** thay vì tạo bản ghi trùng.
2. **Sổ lưu bút** — `guestbook.html`, lời chúc hiển thị công khai cho mọi người xem, cập nhật ngay sau khi gửi.
3. **Thông tin mừng cưới** — số tài khoản + QR chuyển khoản (đã có sẵn ở mục 1, phần "Bản đồ + QR").
4. **Chia sẻ nhanh** — nút Zalo / Facebook / Messenger / sao chép liên kết, đặt ở cuối trang chính và trang cảm ơn (`js/share.js`).
5. **Deadline RSVP** — cấu hình ở `rsvp.deadline` trong `js/config.js`; qua hạn form tự khoá và báo rõ cho khách.
6. **Chống spam form** — honeypot field (bẫy bot), giới hạn thời gian chờ giữa các lần gửi trên cùng thiết bị, và Firestore Rules kiểm tra định dạng dữ liệu trước khi ghi.
7. **Trang quản trị** — `admin.html` (đăng nhập qua `login.html`): xem thống kê (đã phản hồi / chưa phản hồi / tổng số người tham dự / chay-mặn / vắng mặt), bảng RSVP + sổ lưu bút có thể tìm kiếm, xoá, và **xuất CSV**.

## ✅ Đã hoàn thành trong đợt này (mục 3 — quản trị nâng cao)

1. **Nhập danh sách khách 1 lần → tự sinh link riêng** — mục "Quản lý khách mời" trong `admin.html`: dán mỗi khách 1 dòng (`Tên khách` hoặc `Tên khách, ghi chú`) vào ô lớn rồi bấm **Tạo link hàng loạt**; hệ thống tự sinh mã (không trùng khách đã có) và lưu vào Firestore (collection `guests`). Có thể thêm nhanh từng khách một ở ô bên cạnh. Mỗi khách có link riêng dạng `index.html?to=mã-khách`, hiện ngay trong bảng kèm nút **Sao chép** để gửi qua Zalo/Facebook/Messenger.
2. **Bảng khách + RSVP + tổng số người tham dự + xuất Excel báo nhà hàng** — bảng "Danh sách RSVP" đã có sẵn từ trước; giờ có thêm nút **Xuất Excel báo nhà hàng** (`.xlsx`, dùng thư viện SheetJS tải qua CDN) gồm 2 sheet: "Bao nha hang" (chỉ khách xác nhận tham dự, số người + thực đơn chay/mặn + tổng cộng cuối bảng — gửi thẳng cho nhà hàng) và "Toan bo RSVP" (đầy đủ dữ liệu). Nút "Xuất CSV" cũ vẫn giữ nguyên.
3. **Xem/xuất toàn bộ lời chúc** — bảng "Sổ lưu bút" có thêm nút **Xuất CSV**.
4. **Thống kê lượt xem theo từng khách** — mỗi lần ai đó mở đúng link riêng của mình (`?to=mã-khách`) ở trang chính hoặc trang RSVP, hệ thống âm thầm ghi nhận (`lastViewedAt`, `viewCount`) vào tài liệu khách đó. Bảng "Danh sách khách" hiển thị cột **Đã xem?** (kèm số lần + thời điểm gần nhất) và có thể lọc theo "Đã xem/Chưa xem link", "Đã RSVP/Chưa RSVP". Ô thống kê tổng "Đã xem link" ở đầu trang cho biết tỉ lệ chung.
5. **Sao lưu dữ liệu** — nút **Sao lưu ngay (.json)** ở cuối trang admin tải toàn bộ RSVP + lời chúc + danh sách khách thành 1 file JSON. Vì đây là website tĩnh (không có máy chủ chạy nền), không thể tự động chạy backup định kỳ thật sự — trang sẽ hiện banner nhắc nếu đã hơn 7 ngày chưa bấm sao lưu lần nào trên trình duyệt đó. Nếu cần backup tự động thật sự (chạy dù không mở trang admin), xem gợi ý bên dưới.
6. **Đăng nhập admin bảo mật hơn** — `login.html` không còn so khớp 1 mật khẩu viết cứng trong `js/config.js` nữa, mà dùng **Firebase Authentication (Email/Password) thật** — xem bước thiết lập bên dưới. Firestore Rules cũng được cập nhật để phân biệt "admin thật" (đăng nhập email/mật khẩu) với truy cập ẩn danh, nên chỉ admin thật mới liệt kê/xoá/tạo được dữ liệu.

## 🔥 Thiết lập Firebase từ đầu

Dự án dùng **Firestore** (lưu RSVP + lời chúc + danh sách khách) và **Authentication kiểu Email/Password** (cho tài khoản admin thật). Làm theo các bước sau — mất khoảng 10-15 phút, hoàn toàn miễn phí ở quy mô 1 đám cưới:

1. **Tạo project** — vào [console.firebase.google.com](https://console.firebase.google.com) → *Add project* → đặt tên (vd: `dam-cuoi-han-khoi`) → có thể tắt Google Analytics nếu không cần → *Create project*.
2. **Bật Firestore** — trong project, vào menu trái *Build → Firestore Database* → *Create database* → chọn **Production mode** → chọn khu vực gần bạn nhất (vd: `asia-southeast1` cho khu vực Đông Nam Á) → *Enable*.
3. **Tạo tài khoản đăng nhập admin** — vào *Build → Authentication* → tab *Sign-in method* → bật **Email/Password** → *Save*. Sau đó qua tab *Users* → *Add user* → nhập email + mật khẩu bất kỳ (đây chính là thông tin bạn sẽ dùng để đăng nhập ở `login.html`).
4. **Đăng ký Web App để lấy config** — ở trang tổng quan project, bấm biểu tượng `</>` (Web) → đặt tên app bất kỳ → *Register app*. Firebase sẽ hiện đoạn `const firebaseConfig = {...}` — copy toàn bộ object đó, dán đè vào `js/firebase-config.js` (thay cho object mẫu có sẵn).
5. **Áp dụng Security Rules** — vào *Firestore Database → tab Rules* → xoá nội dung mặc định → dán toàn bộ nội dung file `firebase/firestore.rules` vào → *Publish*. (File `firebase/storage.rules` chỉ dùng nếu bạn có bật Storage — dự án này không cần Storage vì ảnh/video/nhạc host tĩnh cùng website.)
6. **Đặt hạn RSVP** — sửa `rsvp.deadline` trong `js/config.js` theo ngày bạn muốn chốt số lượng với nhà hàng.
7. **Tạo danh sách khách + link riêng** — mở `admin.html`, đăng nhập bằng tài khoản vừa tạo ở bước 3, vào mục "Quản lý khách mời" và dán danh sách khách để sinh link hàng loạt (xem chi tiết ở mục "mục 3" phía trên). Bạn không cần khai `guests` trong `js/config.js` nữa trừ khi muốn giữ tương thích với các mã khách đã gửi từ trước.
8. **Kiểm tra** — mở `index.html` bằng 1 local server bất kỳ (vd extension "Live Server" của VS Code, hoặc `npx serve`), thử mở 1 link riêng vừa tạo, gửi thử 1 lượt RSVP, rồi vào `admin.html` xem dữ liệu + lượt xem có hiện đúng không.
9. **Deploy** — có thể dùng **Firebase Hosting** (`npm i -g firebase-tools` → `firebase login` → `firebase init hosting` → `firebase deploy`), hoặc bất kỳ static host nào khác (Netlify, Vercel, GitHub Pages...) vì toàn bộ site chỉ là HTML/CSS/JS tĩnh.

### ⚠️ Lưu ý về bảo mật trang admin

- Đăng nhập admin giờ dùng **Firebase Authentication thật** (email/mật khẩu được Firebase xác thực ở phía máy chủ) — không còn mật khẩu viết cứng trong mã nguồn JS như phiên bản trước, và Firestore Rules chỉ cho phép tài khoản này (không phải đăng nhập ẩn danh) liệt kê/xoá/tạo dữ liệu.
- Các form công khai (RSVP, sổ lưu bút) vẫn chỉ có chống spam **phía trình duyệt** (honeypot + thời gian chờ giữa các lần gửi) — đây là rào cản hợp lý cho spam thông thường, không phải rate-limiting cấp máy chủ. Firestore Rules là lớp bảo vệ thật sự cho định dạng dữ liệu.
- Vẫn **không nên đưa dữ liệu thật sự nhạy cảm** (số điện thoại, CMND/CCCD, số tiền mừng cụ thể...) vào các trường RSVP/sổ lưu bút/ghi chú khách mời, vì các trường `get theo ID` (RSVP, khách mời) có thể đọc được bởi bất kỳ ai biết đúng đường link/mã.
- Muốn thêm admin thứ 2 (vd. cả cô dâu và chú rể cùng quản lý)? Chỉ cần tạo thêm 1 user trong Firebase Console → Authentication → Users, không cần sửa code.

### 💾 Nếu muốn backup tự động thật sự (không cần mở trang admin)

Nút "Sao lưu ngay" trong `admin.html` là backup **thủ công** (chỉ chạy khi bạn bấm). Vì đây là site tĩnh, không có máy chủ để tự chạy nền. Nếu muốn có bản sao lưu chạy đều đặn dù không mở trang, có 2 hướng phổ biến (cần thêm cấu hình ngoài phạm vi các file trong dự án này):
- **Google Apps Script + Google Sheet**: viết 1 script chạy theo lịch (`Time-driven trigger`), gọi Firestore REST API để lấy dữ liệu `rsvps`/`guestbook`/`guests`, ghi vào 1 Google Sheet — miễn phí, không cần nâng cấp gói Firebase.
- **Cloud Scheduler + Cloud Function** (cần chuyển Firebase sang gói trả phí theo lượng dùng "Blaze"): tạo 1 Cloud Function xuất dữ liệu Firestore ra Cloud Storage theo lịch, dùng tính năng "Scheduled Firestore export" chính thức của Google Cloud.

## ✅ Đã hoàn thành trong đợt này (mục 4 — chuẩn bị cho mục đích thương mại)

1. **Trang Chính sách bảo mật & Điều khoản sử dụng** — `privacy.html`, `terms.html`, liệt kê rõ dữ liệu nào được thu thập (RSVP, sổ lưu bút, lượt xem link cá nhân hoá), lưu ở đâu (Firebase/Firestore của Google), ai xem được, và cách khách mời yêu cầu chỉnh sửa/xoá dữ liệu của họ. Đã gắn link ở footer trang chính và ngay dưới nút gửi form RSVP/sổ lưu bút. Sửa thông tin liên hệ ở `legal.contactEmail` / `legal.contactPhone` trong `js/config.js`.
2. **Favicon** — `assets/icons/favicon.svg` (monogram "H&K" mẫu), đã gắn vào tất cả các trang. Đổi 2 chữ cái trong file SVG này khi dùng cho khách hàng khác.
3. **Thẻ Open Graph / Twitter Card** — thêm vào `<head>` của `index.html`, `rsvp.html`, `guestbook.html` để có ảnh/tiêu đề preview đẹp khi khách dán link vào Zalo/Facebook/Messenger. **Lưu ý quan trọng**: các app nhắn tin này không chạy JavaScript khi tạo preview, nên các thẻ `og:title`/`og:description`/`og:image` phải **sửa tay trực tiếp trong HTML** (không tự động theo `config.js`) — mỗi lần đổi tên/ngày cưới cho khách hàng mới, nhớ sửa cả phần này. `js/main.js` chỉ đồng bộ lại các thẻ này cho tab trình duyệt đang mở, không ảnh hưởng tới preview của app nhắn tin.
4. **`robots.txt`** — chặn công cụ tìm kiếm index các trang `admin.html`, `login.html`, `privacy.html`, `terms.html`.

## ✅ Đã hoàn thành trong đợt này (mục 5 — phần kỹ thuật nền)

1. **Open Graph preview đẹp trên Zalo/Facebook** — đã sửa `og:image` và thêm `og:url` ở `index.html`, `rsvp.html`, `guestbook.html` thành **đường dẫn tuyệt đối** (`https://ten-mien-cua-ban.com/...`) thay vì đường dẫn tương đối như trước. Đây là lỗi phổ biến khiến ảnh preview không hiện: Zalo/Facebook lấy ảnh bằng cách gọi thẳng URL từ máy chủ của họ (không mở trang trong trình duyệt), nên đường dẫn tương đối thường không ra ảnh. **Việc bạn cần làm**: khi có domain thật, tìm-thay toàn bộ chuỗi `ten-mien-cua-ban.com` trong 3 file trên bằng domain thật, và bỏ ảnh `assets/images/og-cover.jpg` (1200×630px, dưới ~300KB) vào đúng chỗ.
2. **Tối ưu tốc độ trên điện thoại, mạng yếu**:
   - Font Google Fonts giờ tải theo kiểu **không chặn render** (`preload` + `media="print" onload`) ở tất cả các trang — trang vẽ nội dung ngay bằng font hệ thống rồi mới đổi sang font thật khi tải xong, thay vì đứng hình chờ font trên mạng chậm. Thêm `preconnect` tới `fonts.gstatic.com` (trước đây thiếu, chỉ có `fonts.googleapis.com` — thiếu domain này khiến trình duyệt mất thêm 1 vòng round-trip mới bắt đầu tải được font).
   - Ảnh trong thư viện đã có sẵn `loading="lazy"`, video/nhạc nền đã có sẵn `preload="none"` (chỉ tải khi khách bấm play) — không tải trước những phần khách chưa xem tới.
   - Phần còn lại **bạn cần tự làm** vì cần ảnh/video thật: nén ảnh trước khi tải lên (khuyến nghị JPG/WebP, mỗi ảnh dưới ~300-500KB, chiều rộng không cần quá 1600px vì hiển thị trên điện thoại), nén video (dưới vài chục MB, hoặc cân nhắc host video trên YouTube/Vimeo ẩn và nhúng thay vì file `.mp4` nặng), nén nhạc nền (mp3 ~128kbps là đủ cho web).
3. **Trang "Cảm ơn" cá nhân hoá sau khi RSVP** — đã có sẵn từ mục 2 (`thankyou.html`): hiện đúng tên khách, trạng thái tham dự/vắng mặt, số người, chay/mặn dựa trên dữ liệu vừa gửi ở RSVP.
4. **`robots.txt`** đã chặn index các trang không cần lên Google (`admin.html`, `login.html`, `privacy.html`, `terms.html`) từ mục 4 — giữ nguyên, không ảnh hưởng tới preview Zalo/Facebook (2 việc khác nhau: `robots.txt` chỉ ảnh hưởng Google Search, không ảnh hưởng app nhắn tin).

## 📋 3 việc còn lại thuộc về hosting/hạ tầng — không sửa được bằng code trong dự án này

Đây là các việc bạn (hoặc người deploy) làm ở nơi lưu trữ website, không phải sửa file trong thư mục này:

- **HTTPS/SSL toàn trang** — hầu hết các dịch vụ host tĩnh miễn phí đều tự cấp SSL miễn phí, không cần làm gì thêm: **Firebase Hosting**, **Netlify**, **Vercel**, **GitHub Pages** đều tự động HTTPS khi trỏ domain vào. Chỉ cần tránh các host rẻ tiền không hỗ trợ SSL miễn phí. Sau khi trỏ domain, kiểm tra ổ khoá HTTPS hiện đúng trên cả `index.html` lẫn các trang con (`rsvp.html`, `admin.html`...).
- **Domain ngắn gọn dễ nhớ** — ưu tiên dạng `tenco-tendau.vn` hoặc `.com` ngắn (vd `hankhoi2027.com`), tránh gạch nối/số dài khó đọc khi đọc miệng cho khách lớn tuổi. Mua ở nhà cung cấp trong nước (Mắt Bão, PA Vietnam, Nhân Hoà) nếu cần `.vn`, hoặc Namecheap/Cloudflare Registrar nếu `.com` — deploy xong nhớ quay lại sửa domain thật vào chỗ `ten-mien-cua-ban.com` ở mục 1 phía trên.
- **Test kỹ trên Zalo in-app browser** — đây là bước QA thủ công cần làm trên điện thoại thật sau khi deploy, không thể tự động hoá trong code. Checklist nên thử:
  - Dán link vào 1 đoạn chat Zalo (chưa gửi) xem preview ảnh/tiêu đề có hiện đúng không (sau khi đã làm mục 1 phía trên).
  - Bấm mở link từ trong Zalo (mở bằng webview riêng của Zalo, không phải Safari/Chrome) — thử cuộn trang, mở nhạc nền, mở lightbox ảnh, bấm "Lưu vào lịch" (tải file `.ics` — 1 số webview chặn tải file, nếu gặp lỗi cần hướng dẫn khách "Mở bằng trình duyệt" qua menu ⋯ của Zalo).
  - Thử điền form RSVP/sổ lưu bút ngay trong webview Zalo — kiểm tra bàn phím ảo hiện lên không che mất nút "Gửi", và trang không bị co giãn kỳ lạ khi bàn phím đóng/mở.
  - Thử trên cả Android và iOS nếu có thể — 2 nền tảng render webview khác nhau.
  - Nếu phát hiện lỗi hiển thị riêng ở Zalo mà không có ở Chrome/Safari thường, quay lại đây báo cụ thể lỗi + ảnh chụp màn hình để mình sửa tiếp — mình không có cách tự kiểm tra webview Zalo từ môi trường hiện tại.

## ⏭️ Chưa nằm trong phạm vi đợt này (cần bạn tự làm thêm nếu kinh doanh)

- Chưa có ảnh/video/nhạc thật — bỏ file thật vào `assets/` theo README.txt trong từng thư mục con. Thêm cả `assets/images/og-cover.jpg` (1200×630px) để preview link đẹp. Nhớ đảm bảo có quyền sử dụng nhạc nền nếu không phải nhạc tự sáng tác/mua bản quyền.
- Chưa điền thông tin Firebase thật vào `js/firebase-config.js` và chưa tạo tài khoản admin thật — xem các mục hướng dẫn phía trên.
- Chưa có tính năng cho khách tự upload ảnh (vd ảnh check-in tại tiệc) — `firebase/storage.rules` đã để sẵn chỗ, có thể làm thêm nếu cần.
- Backup mới dừng ở mức thủ công (bấm nút) — muốn tự động thật sự cần thêm Google Apps Script hoặc Cloud Function như gợi ý ở trên.
- **Giới hạn Firebase API key theo domain** (Google Cloud Console → Credentials → HTTP referrer restriction) và cân nhắc bật **App Check** — cần làm thủ công trên console, không sửa được qua code trong dự án này.
- **Theo dõi hạn mức Firebase (gói Spark/free)** nếu vận hành nhiều đám cưới/nhiều khách hàng cùng lúc — cân nhắc chuyển gói Blaze và ước tính chi phí.
- **Kiến trúc multi-tenant**: hiện tại 1 project Firebase = 1 đám cưới (config cứng trong `js/firebase-config.js`). Nếu bán cho nhiều khách hàng, cần quyết định giữ mô hình "mỗi khách 1 project" (đơn giản, cô lập dữ liệu tốt) hay xây multi-tenant chung 1 backend — việc này nằm ngoài phạm vi chỉnh sửa file tĩnh và cần thiết kế lại phần backend.
- **Đăng ký kinh doanh / thuế** nếu bán dịch vụ này thu phí tại Việt Nam — không phải việc code có thể xử lý được, nên hỏi thêm kế toán/luật sư. Nội dung `privacy.html`/`terms.html` trong dự án chỉ mang tính tham khảo, không thay thế tư vấn pháp lý.
- Kiểm tra điều khoản sử dụng của các API miễn phí bên thứ ba đang dùng (`img.vietqr.io`, `api.qrserver.com`) nếu gọi với tần suất cao ở quy mô thương mại.
