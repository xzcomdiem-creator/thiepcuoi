/* ============================================================
   MAIN.JS
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = WEDDING_CONFIG;

  /* ---------- 1. LOADER ---------- */
  const loader = document.getElementById("loader");
  document.getElementById("loader-initials").innerHTML =
    `${cfg.bride.initial}<span class="amp">&amp;</span>${cfg.groom.initial}`;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hidden"), 500);
  });
  // fallback in case 'load' already fired
  setTimeout(() => loader.classList.add("hidden"), 2200);

  /* ---------- 2. PERSONALIZATION THEO LINK RIÊNG ---------- */
  const params = new URLSearchParams(window.location.search);
  const guestCode = params.get("to");
  const rawName = params.get("name");
  const guestGreetingEl = document.getElementById("guestGreeting");

  function renderGreeting(name) {
    guestGreetingEl.textContent = `Trân trọng kính mời: ${name}`;
  }

  if (rawName) {
    renderGreeting(decodeURIComponent(rawName));
  } else if (guestCode) {
    // Hiện tạm lời chào chung trong lúc tra cứu (tránh trang trắng), rồi cập
    // nhật lại ngay khi có tên khách (từ danh sách tạo trong trang quản trị,
    // hoặc từ js/config.js cho các mã khai báo tay từ trước).
    renderGreeting(cfg.defaultGreeting);
    WeddingGuests.resolve(guestCode, (name) => {
      if (name) renderGreeting(name);
    });
    // Ghi nhận khách đã mở link riêng của mình (chỉ áp dụng với khách được
    // tạo qua trang quản trị — xem js/guest-directory.js).
    WeddingGuests.logView(guestCode);
  } else {
    renderGreeting(cfg.defaultGreeting);
  }

  /* ---------- 3. ĐIỀN THÔNG TIN CƠ BẢN ---------- */
  document.getElementById("brideName").textContent = cfg.bride.shortName;
  document.getElementById("groomName").textContent = cfg.groom.shortName;
  document.getElementById("heroTagline").textContent = cfg.heroTagline;
  document.getElementById("heroDateText").textContent = cfg.heroDate;
  document.title = `Thiệp Cưới — ${cfg.bride.shortName} & ${cfg.groom.shortName}`;
  document.getElementById("footerMonogram").innerHTML =
    `${cfg.bride.initial} &amp; ${cfg.groom.initial}`;

  // Đồng bộ thẻ mô tả/Open Graph theo config (lưu ý: các app nhắn tin như
  // Zalo/Facebook không chạy JS khi tạo preview link, nên vẫn cần sửa tay
  // các thẻ og:* tĩnh trong <head> của index.html khi đổi tên/ngày cưới —
  // đoạn này chỉ giúp đồng bộ cho trình duyệt/tab đang mở).
  const liveDesc = `Trân trọng kính mời bạn đến chung vui cùng ${cfg.bride.shortName} & ${cfg.groom.shortName}`;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute("content", liveDesc);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", document.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", liveDesc);

  /* ---------- 4. ĐẾM NGƯỢC (hero + tách riêng theo từng lễ) ---------- */
  function renderCountdown(el, targetIso) {
    function tick() {
      const diff = new Date(targetIso) - new Date();
      if (diff <= 0) {
        el.innerHTML = `<div class="unit"><span class="num">🎉</span><span class="label">Đã đến ngày!</span></div>`;
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      el.innerHTML = `
        <div class="unit"><span class="num">${d}</span><span class="label">Ngày</span></div>
        <div class="unit"><span class="num">${String(h).padStart(2,"0")}</span><span class="label">Giờ</span></div>
        <div class="unit"><span class="num">${String(m).padStart(2,"0")}</span><span class="label">Phút</span></div>
        <div class="unit"><span class="num">${String(s).padStart(2,"0")}</span><span class="label">Giây</span></div>`;
    }
    tick();
    const timer = setInterval(tick, 1000);
  }

  // Hero: đếm ngược tới lễ SỚM NHẤT còn chưa diễn ra
  const now = new Date();
  const upcoming = cfg.ceremonies
    .filter(c => new Date(c.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const primaryEvent = upcoming[0] || cfg.ceremonies[0];
  document.getElementById("countdownTitle").textContent =
    `Đếm ngược đến ${primaryEvent.name}`;
  renderCountdown(document.getElementById("heroCountdown"), primaryEvent.date);

  // Kiểm tra có nhiều ngày khác nhau không -> nếu có, mỗi thẻ lễ sẽ có đồng hồ riêng
  const distinctDates = new Set(cfg.ceremonies.map(c => new Date(c.date).toDateString()));
  const hasMultipleDates = distinctDates.size > 1;

  /* ---------- 5. LỊCH TRÌNH (SCHEDULE) ---------- */
  const scheduleGrid = document.getElementById("scheduleGrid");
  const dtFormatter = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  cfg.ceremonies.forEach((ev, idx) => {
    const card = document.createElement("div");
    card.className = "ceremony-card reveal";
    card.innerHTML = `
      <h3>${ev.name}</h3>
      <div class="venue">${ev.venueName} — ${ev.address}</div>
      <div class="datetime">${dtFormatter.format(new Date(ev.date))}</div>
      <div class="note">${ev.note || ""}</div>
      ${hasMultipleDates ? `<div class="mini-countdown" id="mini-${ev.id}"></div>` : ""}
      <div class="card-actions">
        <a class="btn ghost-dark" href="${ev.mapUrl}" target="_blank" rel="noopener">Chỉ đường</a>
        <button class="btn solid js-add-cal" data-idx="${idx}" type="button">＋ Thêm vào lịch</button>
      </div>`;
    scheduleGrid.appendChild(card);
    if (hasMultipleDates) {
      renderCountdown(card.querySelector(`#mini-${ev.id}`), ev.date);
    }
  });

  scheduleGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-add-cal");
    if (!btn) return;
    const ev = cfg.ceremonies[btn.dataset.idx];
    downloadICS(ev);
  });

  /* ---------- 6. LƯU VÀO LỊCH (HERO DROPDOWN) ---------- */
  const calendarDropdown = document.getElementById("calendarDropdown");
  const calendarBtn = document.getElementById("calendarBtn");
  const calendarMenu = document.getElementById("calendarMenu");
  calendarMenu.innerHTML = cfg.ceremonies.map((ev, i) => `
    <a href="${buildGoogleCalendarUrl(ev)}" target="_blank" rel="noopener">📅 Google — ${ev.name}</a>
  `).join("") + `<a href="#" id="icsAllBtn">🍎 Apple / Outlook (.ics)</a>`;

  calendarBtn.addEventListener("click", () => calendarDropdown.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!calendarDropdown.contains(e.target)) calendarDropdown.classList.remove("open");
  });
  document.getElementById("icsAllBtn").addEventListener("click", (e) => {
    e.preventDefault();
    cfg.ceremonies.forEach(ev => downloadICS(ev));
  });

  /* ---------- 7. CÂU CHUYỆN TÌNH YÊU (TIMELINE) ---------- */
  const timeline = document.getElementById("timeline");
  cfg.loveStory.forEach(item => {
    const el = document.createElement("div");
    el.className = "timeline-item reveal";
    el.innerHTML = `
      <span class="dot"></span>
      <span class="year">${item.year}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>`;
    timeline.appendChild(el);
  });

  /* ---------- 8. GALLERY + VIDEO ---------- */
  const galleryGrid = document.getElementById("galleryGrid");
  cfg.gallery.images.forEach((img, i) => {
    const fig = document.createElement("figure");
    fig.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy" data-idx="${i}"
      onerror="this.parentElement.style.background='linear-gradient(135deg,#1F3A2E,#B99A5B)'; this.remove();">`;
    fig.addEventListener("click", () => openLightbox(i));
    galleryGrid.appendChild(fig);
  });

  const videoWrap = document.getElementById("videoWrap");
  cfg.gallery.videos.forEach(v => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <video controls preload="none" poster="${v.poster}">
        <source src="${v.src}" type="video/mp4">
      </video>
      <p class="video-title">${v.title}</p>`;
    videoWrap.appendChild(wrap);
  });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  let lbIndex = 0;
  function openLightbox(i) {
    lbIndex = i;
    lightboxImg.src = cfg.gallery.images[i].src;
    lightboxImg.alt = cfg.gallery.images[i].alt;
    lightbox.classList.add("open");
  }
  function closeLightbox() { lightbox.classList.remove("open"); }
  function stepLightbox(delta) {
    lbIndex = (lbIndex + delta + cfg.gallery.images.length) % cfg.gallery.images.length;
    lightboxImg.src = cfg.gallery.images[lbIndex].src;
    lightboxImg.alt = cfg.gallery.images[lbIndex].alt;
  }
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => stepLightbox(-1));
  document.getElementById("lightboxNext").addEventListener("click", () => stepLightbox(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  /* ---------- 9. BẢN ĐỒ + QR ---------- */
  const primaryVenue = primaryEvent;
  document.getElementById("mapFrame").src =
    `https://maps.google.com/maps?q=${encodeURIComponent(primaryVenue.address)}&output=embed`;
  document.getElementById("mainVenueText").textContent =
    `${primaryVenue.venueName} — ${primaryVenue.address}`;
  document.getElementById("qrMap").src =
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(primaryVenue.mapUrl)}`;

  const bq = cfg.bankQR;
  document.getElementById("qrBank").src =
    `https://img.vietqr.io/image/${bq.bankId}-${bq.accountNumber}-${bq.template}.png?amount=&addInfo=${encodeURIComponent(bq.addInfo)}&accountName=${encodeURIComponent(bq.accountName)}`;

  /* ---------- 10. KHÁCH SẠN GẦN ĐÓ ---------- */
  const hotelList = document.getElementById("hotelList");
  cfg.hotels.forEach(h => {
    const card = document.createElement("div");
    card.className = "hotel-card reveal";
    card.innerHTML = `
      <h4>${h.name}</h4>
      <div class="meta"><span>${h.distance}</span><span>${h.price}</span></div>
      <a href="${h.mapUrl}" target="_blank" rel="noopener">Xem trên bản đồ →</a>`;
    hotelList.appendChild(card);
  });

  /* ---------- 11. DRESS CODE ---------- */
  document.getElementById("dressIntro").textContent = cfg.dressCode.intro;
  document.getElementById("dressNote").textContent = cfg.dressCode.note;
  const paletteRow = document.getElementById("paletteRow");
  cfg.dressCode.palette.forEach(c => {
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.innerHTML = `<div class="chip" style="background:${c.hex}"></div><div class="name">${c.name}</div>`;
    paletteRow.appendChild(sw);
  });

  /* ---------- 12. FAQ ---------- */
  const faqList = document.getElementById("faqList");
  cfg.faq.forEach(item => {
    const el = document.createElement("div");
    el.className = "faq-item";
    el.innerHTML = `
      <button class="faq-q" type="button"><span>${item.q}</span><span class="plus">+</span></button>
      <div class="faq-a"><p>${item.a}</p></div>`;
    faqList.appendChild(el);
  });
  faqList.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-q");
    if (!q) return;
    const item = q.closest(".faq-item");
    const answer = item.querySelector(".faq-a");
    const wasOpen = item.classList.contains("open");
    faqList.querySelectorAll(".faq-item.open").forEach(o => {
      o.classList.remove("open");
      o.querySelector(".faq-a").style.maxHeight = null;
    });
    if (!wasOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });

  /* ---------- 13. NHẠC NỀN ---------- */
  const musicToggle = document.getElementById("musicToggle");
  const bgMusic = document.getElementById("bgMusic");
  bgMusic.src = cfg.music.src;
  let musicStarted = false;
  function tryAutoplay() {
    bgMusic.play().then(() => {
      musicStarted = true;
      musicToggle.classList.remove("paused");
    }).catch(() => { /* trình duyệt chặn autoplay — chờ khách bấm */ });
  }
  window.addEventListener("load", tryAutoplay);
  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.remove("paused");
    } else {
      bgMusic.pause();
      musicToggle.classList.add("paused");
    }
  });

  /* ---------- 14. DOT NAV + SCROLL SPY ---------- */
  const dotLinks = document.querySelectorAll(".dot-nav a");
  const sections = [...dotLinks].map(a => document.querySelector(a.getAttribute("href")));
  function updateDotNav() {
    let currentIndex = 0;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.4) currentIndex = i;
    });
    dotLinks.forEach((a, i) => a.classList.toggle("active", i === currentIndex));
  }
  document.addEventListener("scroll", updateDotNav, { passive: true });
  updateDotNav();

  /* ---------- 14b. RSVP CTA ---------- */
  const rsvpDeadlinePill = document.getElementById("rsvpDeadlinePill");
  const rsvpDeadline = new Date(cfg.rsvp.deadline);
  const rsvpDtFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  rsvpDeadlinePill.textContent = new Date() > rsvpDeadline
    ? "Đã hết hạn xác nhận"
    : `Vui lòng phản hồi trước ${rsvpDtFormatter.format(rsvpDeadline)}`;

  // Giữ nguyên mã cá nhân hoá (?to=...) khi khách bấm sang trang RSVP
  const rsvpCtaLink = document.getElementById("rsvpCtaLink");
  if (guestCode) rsvpCtaLink.href = `rsvp.html?to=${encodeURIComponent(guestCode)}`;
  else if (rawName) rsvpCtaLink.href = `rsvp.html?name=${encodeURIComponent(rawName)}`;

  renderShareButtons("shareButtonsHome");

  /* ---------- 15. REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
});
