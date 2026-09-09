// Lapisan akses data. Semua panggilan jaringan lewat file ini
// supaya gampang diganti kalau endpoint berubah.

export const BASE_URL = 'https://dispora.jakarta.go.id';

export const ENDPOINTS = {
  hero: '/api/news/hero',
  chatbot: '/api/chatbot/chat',
  helpdeskTickets: '/admin/api/helpdesk/tickets?limit=100',
};

const TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Ambil daftar hero/pengumuman utama.
// Bentuk respons: array objek berita.
export async function fetchHero() {
  const data = await request(ENDPOINTS.hero);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// Endpoint admin — sangat mungkin menolak tanpa sesi login.
// Pemanggil wajib menyiapkan fallback.
export async function fetchHelpdeskTickets() {
  const data = await request(ENDPOINTS.helpdeskTickets);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.tickets)) return data.tickets;
  return [];
}

// Kirim pesan ke chatbot Dispora.
// Payload mengikuti yang terlihat di Network tab situs aslinya.
export async function sendChatMessage({
  sessionId = null,
  message,
  attachmentUrl = null,
  attachmentName = null,
}) {
  const data = await request(ENDPOINTS.chatbot, {
    method: 'POST',
    body: JSON.stringify({ sessionId, message, attachmentUrl, attachmentName }),
  });

  // Bentuk respons chatbot belum dipastikan, jadi dicari di beberapa kemungkinan field.
  const reply =
    (data && (data.reply || data.message || data.answer || data.response || data.text)) ||
    (data && data.data && (data.data.reply || data.data.message || data.data.answer)) ||
    null;

  const nextSession =
    (data && (data.sessionId || data.session_id)) ||
    (data && data.data && (data.data.sessionId || data.data.session_id)) ||
    sessionId;

  return { reply, sessionId: nextSession, raw: data };
}

// Membersihkan teks dari API (banyak konten memakai \r\n dan emoji).
export function cleanText(value) {
  if (!value) return '';
  return String(value).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export default { fetchHero, fetchHelpdeskTickets, sendChatMessage, cleanText, BASE_URL, ENDPOINTS };
