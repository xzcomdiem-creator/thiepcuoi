/* ============================================================
   CALENDAR.JS
   Tạo link "Thêm vào Google Calendar" và file .ics cho
   Apple Calendar / Outlook từ dữ liệu ceremonies trong config.js
   ============================================================ */

function toGCalDate(isoString) {
  const d = new Date(isoString);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildGoogleCalendarUrl(event) {
  const start = toGCalDate(event.date);
  const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000); // mặc định +2 giờ
  const end = toGCalDate(endDate.toISOString());
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${start}/${end}`,
    details: event.note || "",
    location: event.address || event.venueName || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildICS(event) {
  const start = toGCalDate(event.date);
  const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000);
  const end = toGCalDate(endDate.toISOString());
  const uid = `${event.id}-${Date.now()}@wedding-invitation`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//VI",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toGCalDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${(event.note || "").replace(/,/g, "\\,")}`,
    `LOCATION:${(event.address || event.venueName || "").replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadICS(event) {
  const blob = new Blob([buildICS(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
