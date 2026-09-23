export function sanitizeText(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/[<>"`]/g, "")
    .trim();
}

export function sanitizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https:\/\//i.test(url)) return url;
  if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(url)) return url;
  return "";
}

export function safeInteger(value, fallback = 0, minimum = 0) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.max(minimum, number);
}

export function sanitizeColor(value, fallback = "#111111") {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

export function sanitizePosition(value) {
  return ["POR", "DEF", "MED", "DEL"].includes(value) ? value : "DEL";
}