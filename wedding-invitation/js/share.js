/* ============================================================
   SHARE.JS
   Hàm dùng chung: render nhóm nút "Chia sẻ nhanh" (Zalo / Facebook /
   Messenger / Sao chép liên kết). Dùng ở index.html, thankyou.html,
   guestbook.html — gọi renderShareButtons(elementId).
   ============================================================ */
function renderShareButtons(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const url = window.location.href.split("#")[0];
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(document.title);

  el.innerHTML = `
    <a class="share-btn zalo" href="https://zalo.me/share/link?url=${encodedUrl}&text=${text}" target="_blank" rel="noopener" aria-label="Chia sẻ qua Zalo">
      <span class="share-ic">Z</span><span>Zalo</span>
    </a>
    <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener" aria-label="Chia sẻ qua Facebook">
      <span class="share-ic">f</span><span>Facebook</span>
    </a>
    <a class="share-btn messenger" href="https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=&redirect_uri=${encodedUrl}" target="_blank" rel="noopener" aria-label="Chia sẻ qua Messenger">
      <span class="share-ic">M</span><span>Messenger</span>
    </a>
    <button class="share-btn copy" type="button" id="copyLinkBtn" aria-label="Sao chép liên kết">
      <span class="share-ic">⧉</span><span>Sao chép liên kết</span>
    </button>
  `;

  const copyBtn = el.querySelector("#copyLinkBtn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const tmp = document.createElement("input");
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    const label = copyBtn.querySelector("span:last-child");
    const original = label.textContent;
    label.textContent = "Đã sao chép!";
    setTimeout(() => { label.textContent = original; }, 1800);
  });
}
