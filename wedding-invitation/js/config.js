/* ============================================================
   CONFIG.JS — Toàn bộ nội dung thiệp cưới nằm ở đây.
   Chỉ cần sửa file này, KHÔNG cần đụng vào HTML/CSS/JS khác.
   ============================================================ */

const WEDDING_CONFIG = {

  // ---------- CÔ DÂU & CHÚ RỂ ----------
  groom: {
    fullName: "Nguyễn Minh Khôi",
    shortName: "Minh Khôi",
    initial: "K",
    parents: "Ông Nguyễn Văn Hải & Bà Trần Thị Lan",
  },
  bride: {
    fullName: "Lê Gia Hân",
    shortName: "Gia Hân",
    initial: "H",
    parents: "Ông Lê Văn Minh & Bà Phạm Thị Thu",
  },

  // Câu mở đầu thiệp
  heroTagline: "Chúng tôi sắp về chung một nhà",
  heroDate: "14 . 02 . 2027",

  // ---------- CÁC NGHI LỄ (có thể khác ngày / khác nơi) ----------
  // Mỗi lễ sẽ có đồng hồ đếm ngược RIÊNG nếu ngày khác nhau.
  ceremonies: [
    {
      id: "an-hoi",
      name: "Lễ Ăn Hỏi",
      date: "2027-02-10T09:00:00+07:00",
      venueName: "Tư gia nhà gái",
      address: "123 Đường Hoa Ban, Phường 5, TP. Yên Bái, Lào Cai",
      mapUrl: "https://maps.google.com/?q=123+Đường+Hoa+Ban,+Yên+Bái",
      note: "Trang phục kín đáo, lịch sự",
    },
    {
      id: "le-cuoi",
      name: "Lễ Vu Quy & Tân Hôn",
      date: "2027-02-14T10:30:00+07:00",
      venueName: "Trung tâm Tiệc cưới Ngọc Lan",
      address: "45 Đại lộ Sông Hồng, TP. Yên Bái, Lào Cai",
      mapUrl: "https://maps.google.com/?q=Trung+Tâm+Tiệc+Cưới+Ngọc+Lan+Yên+Bái",
      note: "Đón khách từ 10:00, tiệc bắt đầu 11:00",
    },
    {
      id: "tiec-toi",
      name: "Tiệc Chiêu Đãi Tối",
      date: "2027-02-14T18:00:00+07:00",
      venueName: "Sảnh Rồng Vàng — Khách sạn Sông Hồng",
      address: "88 Trần Phú, TP. Yên Bái, Lào Cai",
      mapUrl: "https://maps.google.com/?q=Khách+Sạn+Sông+Hồng+Yên+Bái",
      note: "Dạ tiệc — khuyến khích trang phục dạ hội nhẹ nhàng",
    },
  ],

  // ---------- CÂU CHUYỆN TÌNH YÊU ----------
  loveStory: [
    { year: "2019", title: "Lần đầu gặp gỡ", text: "Một buổi chiều mưa ở giảng đường đại học, hai đứa cùng trú dưới một mái hiên." },
    { year: "2020", title: "Bắt đầu hẹn hò", text: "Sau nhiều lần \"tình cờ\" gặp nhau, lời tỏ tình được nói ra trong một chuyến đi Sa Pa." },
    { year: "2023", title: "Về ra mắt hai bên gia đình", text: "Bữa cơm đầu tiên cùng gia đình hai bên, đầy ắp tiếng cười và... một chút hồi hộp." },
    { year: "2026", title: "Lời cầu hôn", text: "Dưới ánh hoàng hôn Yên Bái, chàng trai quỳ gối và cô gái đã gật đầu." },
    { year: "2027", title: "Về chung một nhà", text: "Và hôm nay, chúng tôi mời bạn cùng chứng kiến khoảnh khắc hạnh phúc nhất." },
  ],

  // ---------- THƯ VIỆN ẢNH / VIDEO ----------
  // Đặt file thật vào assets/images và assets/videos rồi đổi "src" tương ứng.
  gallery: {
    images: [
      { src: "assets/images/album-01.jpg", alt: "Ảnh cưới 1" },
      { src: "assets/images/album-02.jpg", alt: "Ảnh cưới 2" },
      { src: "assets/images/album-03.jpg", alt: "Ảnh cưới 3" },
      { src: "assets/images/album-04.jpg", alt: "Ảnh cưới 4" },
      { src: "assets/images/album-05.jpg", alt: "Ảnh cưới 5" },
      { src: "assets/images/album-06.jpg", alt: "Ảnh cưới 6" },
    ],
    videos: [
      { src: "assets/videos/pre-wedding.mp4", poster: "assets/images/video-poster.jpg", title: "Prewedding Film" },
    ],
  },

  // ---------- NHẠC NỀN ----------
  music: {
    src: "assets/music/background.mp3",
    title: "A Thousand Years — Piano Cover",
  },

  // ---------- KHÁCH SẠN / CHỖ Ở GẦN ĐỊA ĐIỂM ----------
  hotels: [
    { name: "Khách sạn Sông Hồng", distance: "0.2 km từ nơi tổ chức", price: "từ 650.000đ/đêm", mapUrl: "https://maps.google.com/?q=Khách+Sạn+Sông+Hồng+Yên+Bái" },
    { name: "Mường Thanh Grand Yên Bái", distance: "1.5 km từ nơi tổ chức", price: "từ 850.000đ/đêm", mapUrl: "https://maps.google.com/?q=Mường+Thanh+Grand+Yên+Bái" },
    { name: "Yên Bái Riverside Homestay", distance: "2.1 km từ nơi tổ chức", price: "từ 450.000đ/đêm", mapUrl: "https://maps.google.com/?q=Homestay+Yên+Bái" },
  ],

  // ---------- DRESS CODE ----------
  dressCode: {
    intro: "Để những khung hình thêm hài hoà, cô dâu chú rể gợi ý bảng màu trang phục sau:",
    palette: [
      { name: "Xanh rêu", hex: "#4A5D45" },
      { name: "Be sữa", hex: "#E8DFCB" },
      { name: "Nâu đất", hex: "#8B6A4F" },
      { name: "Vàng cổ", hex: "#B99A5B" },
    ],
    note: "Ưu tiên trang phục lịch sự, tránh màu trắng & đỏ đô (dành riêng cho cô dâu chú rể).",
  },

  // ---------- FAQ ----------
  faq: [
    { q: "Tiệc cưới có nhận trẻ em không?", a: "Có ạ! Các bé luôn được chào đón. Ban tổ chức sẽ chuẩn bị thêm ghế cho bé và thực đơn nhẹ phù hợp." },
    { q: "Chỗ đậu xe ở đâu?", a: "Bãi đậu xe miễn phí ngay trong khuôn viên trung tâm tiệc cưới, có bảo vệ trông giữ xe suốt buổi tiệc." },
    { q: "Mấy giờ nên tới là hợp lý?", a: "Khách mời nên có mặt trước giờ bắt đầu khoảng 30 phút để ổn định chỗ ngồi và dùng tiệc trà nhẹ." },
    { q: "Có thể mang theo quà mừng không?", a: "Tấm lòng của quý khách là điều quý giá nhất. Nếu muốn gửi mừng cưới, quý khách có thể quét mã QR tại bàn đón khách." },
    { q: "Trang phục có bắt buộc theo dress code không?", a: "Không bắt buộc, đây chỉ là gợi ý để ảnh chụp chung thêm hài hoà. Quý khách mặc thoải mái theo phong cách của mình." },
  ],

  // ---------- QR NGÂN HÀNG (dùng dịch vụ VietQR — điền thông tin thật) ----------
  bankQR: {
    bankId: "VCB",              // Mã ngân hàng theo chuẩn VietQR, vd: VCB, TCB, MB...
    accountNumber: "0123456789",
    accountName: "LE GIA HAN",
    template: "compact2",
    addInfo: "Mung cuoi Khoi Han",
  },

  // ---------- KHÁCH MỜI (cá nhân hoá theo link riêng) ----------
  // Link gửi khách: index.html?to=an-gia  ->  hiện "Kính mời: Anh Gia và gia đình"
  // Nếu không có mã hoặc không khớp -> hiện lời chào chung.
  guests: {
    "an-gia":   { name: "Anh Gia và gia đình" },
    "chi-hoa":  { name: "Chị Hoa" },
    "bac-thanh":{ name: "Bác Thành và Bác Hương" },
  },
  defaultGreeting: "Quý khách quý mến",

  // ---------- RSVP ----------
  rsvp: {
    // Hạn chót xác nhận tham dự — sau thời điểm này form sẽ tự khoá.
    deadline: "2027-02-05T23:59:59+07:00",
    note: "Xác nhận giúp mình trước ngày trên để tiện báo số lượng cho nhà hàng nhé!",
    // Số người tối đa cho phép khai trong 1 lượt RSVP (chống nhập bậy / spam).
    maxGuestCount: 10,
  },

  // ---------- SỔ LƯU BÚT ----------
  guestbook: {
    intro: "Gửi lời chúc phúc đến cô dâu chú rể — lời chúc của bạn sẽ hiển thị công khai ở đây.",
    // Số giây phải chờ giữa 2 lần gửi trên cùng 1 thiết bị (chống spam).
    cooldownSeconds: 45,
  },

  // ---------- LIÊN HỆ / PHÁP LÝ (dùng trong privacy.html, terms.html) ----------
  // Email/SĐT để khách mời liên hệ nếu muốn hỏi hoặc yêu cầu xoá dữ liệu của họ.
  legal: {
    contactEmail: "giahan.minhkhoi.wedding@gmail.com",
    contactPhone: "090xxxxxxx",
  },
};

/* ============================================================
   ADMIN — đăng nhập trang quản trị (login.html) giờ dùng tài khoản
   Firebase Authentication (Email/Password) THẬT, không còn mật khẩu
   viết cứng trong file này nữa.

   Tạo tài khoản admin: Firebase Console → Authentication → Users →
   Add user → nhập email + mật khẩu bất kỳ → dùng đúng email/mật khẩu
   đó để đăng nhập ở login.html. Xem chi tiết trong README.md, mục
   "Thiết lập đăng nhập admin".
   ============================================================ */
