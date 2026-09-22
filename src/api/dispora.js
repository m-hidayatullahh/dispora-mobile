// Lapisan akses data Dispora.
//
// Endpoint publik yang terverifikasi (GET, balas JSON):
//   /api/news/hero    pengumuman utama
//   /api/programs     program unggulan
//   /api/inspiration  profil atlet inspiratif
//   /api/quotes       kutipan tokoh  -> {success, quotes:[...]}
//   /api/gallery      galeri foto
//   /api/social       postingan media sosial
//   /api/chatbot/chat live chat (POST saja)
//
// Rute seperti /api/programs/[id] membalas 405 untuk GET, jadi tidak dipakai.

export const BASE_URL = 'https://dispora.jakarta.go.id';

export const ENDPOINTS = {
  hero: '/api/news/hero',
  programs: '/api/programs',
  inspiration: '/api/inspiration',
  quotes: '/api/quotes',
  gallery: '/api/gallery',
  social: '/api/social',
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

// Beberapa endpoint membalas array polos, sebagian dibungkus objek.
function toArray(data, ...keys) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const k of keys) {
    if (Array.isArray(data[k])) return data[k];
  }
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function cleanText(value) {
  if (!value) return '';
  return String(value).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function stripQuotes(value) {
  return cleanText(value).replace(/^["“”']+|["“”']+$/g, '');
}

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj && obj[k]) return obj[k];
  }
  return null;
};

// ---------- Normalisasi ----------
// Struktur balasan API belum terdokumentasi, jadi tiap field dicari
// di beberapa nama yang mungkin dipakai.

const ACCENTS = ['primary', 'blue', 'gold'];

export function normalizeProgram(p, i = 0) {
  return {
    id: String(p.id ?? p.slug ?? i),
    title: p.title || p.name || '-',
    description: cleanText(pick(p, 'description', 'excerpt', 'summary', 'content')),
    content: cleanText(pick(p, 'content', 'description')),
    image: pick(p, 'image', 'bannerImage', 'thumbnail', 'cover', 'imageUrl'),
    tag: p.type || p.category || 'Program',
    accent: ACCENTS[i % ACCENTS.length],
    url: pick(p, 'url', 'link', 'externalUrl'),
    children: [],
  };
}

export function normalizeInspiration(a, i = 0) {
  return {
    id: String(a.id ?? i),
    name: a.name || '-',
    achievement: pick(a, 'title', 'achievement', 'subtitle') || '',
    quote: stripQuotes(pick(a, 'quote', 'text', 'description')),
    image: pick(a, 'image', 'photo', 'imageUrl', 'thumbnail'),
  };
}

export function normalizeQuote(q, i = 0) {
  const author = cleanText(pick(q, 'author', 'name') || '');
  // "Matt Biondi (Atlet Renang)" -> nama + peran
  const m = author.match(/^(.*?)\s*\((.*)\)\s*$/);
  return {
    id: String(q.id ?? i),
    quote: stripQuotes(pick(q, 'text', 'quote', 'content')),
    name: m ? m[1].trim() : author,
    role: m ? m[2].trim() : pick(q, 'role', 'position') || '',
  };
}

export function normalizeGalleryItem(g, i = 0) {
  return {
    id: String(g.id ?? i),
    image: pick(g, 'image', 'imageUrl', 'thumbnail', 'displayUrl', 'url'),
    caption: cleanText(pick(g, 'caption', 'shortCaption', 'title', 'description') || ''),
    link: pick(g, 'permalink', 'link', 'postUrl'),
  };
}

export function normalizeSocialItem(s, i = 0) {
  return {
    id: String(s.id ?? s.instagramPostId ?? i),
    image: pick(s, 'image', 'imageUrl', 'thumbnail', 'displayUrl', 'mediaUrl'),
    title: s.title || 'Dispora',
    caption: cleanText(pick(s, 'shortCaption', 'caption', 'description') || ''),
    link: pick(s, 'permalink', 'link', 'postUrl'),
    handle: s.username ? `@${s.username}` : '@disporadkijkt',
  };
}

export function normalizeHeroItem(h) {
  return {
    id: h.id,
    type: h.type || 'INFO',
    title: h.title,
    excerpt: cleanText(h.excerpt),
    content: cleanText(h.content || h.excerpt),
    date: h.date,
    image: h.image,
    bannerImage: h.bannerImage || h.image,
    heroBadge: h.heroBadge,
    heroCtaText: h.heroCtaText,
    heroCtaUrl: h.heroCtaUrl,
    registrationUrl: h.registrationUrl,
  };
}

// ---------- Pemanggilan ----------

export async function fetchHero() {
  const data = await request(ENDPOINTS.hero);
  return toArray(data, 'news', 'hero').map(normalizeHeroItem);
}

export async function fetchPrograms() {
  const data = await request(ENDPOINTS.programs);
  return toArray(data, 'programs').map(normalizeProgram);
}

export async function fetchInspiration() {
  const data = await request(ENDPOINTS.inspiration);
  return toArray(data, 'inspiration', 'profiles').map(normalizeInspiration);
}

export async function fetchQuotes() {
  const data = await request(ENDPOINTS.quotes);
  return toArray(data, 'quotes').map(normalizeQuote);
}

export async function fetchGallery() {
  const data = await request(ENDPOINTS.gallery);
  return toArray(data, 'gallery', 'images')
    .map(normalizeGalleryItem)
    .filter((x) => !!x.image);
}

export async function fetchSocial() {
  const data = await request(ENDPOINTS.social);
  return toArray(data, 'social', 'posts').map(normalizeSocialItem);
}

// Endpoint admin — biasanya menolak tanpa sesi login.
export async function fetchHelpdeskTickets() {
  const data = await request(ENDPOINTS.helpdeskTickets);
  return toArray(data, 'tickets');
}

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

// Ambil semua konten beranda sekaligus. Tiap bagian gagal sendiri-sendiri
// supaya satu endpoint bermasalah tidak mengosongkan seluruh halaman.
export async function fetchHomeContent() {
  const jobs = [
    ['hero', fetchHero],
    ['programs', fetchPrograms],
    ['inspiration', fetchInspiration],
    ['quotes', fetchQuotes],
    ['gallery', fetchGallery],
    ['social', fetchSocial],
  ];

  const settled = await Promise.all(
    jobs.map(async ([key, fn]) => {
      try {
        return [key, await fn(), null];
      } catch (e) {
        return [key, null, e];
      }
    })
  );

  const result = {};
  const errors = {};
  settled.forEach(([key, value, err]) => {
    result[key] = value;
    if (err) errors[key] = err;
  });
  result.errors = errors;
  return result;
}

export default {
  BASE_URL,
  ENDPOINTS,
  fetchHero,
  fetchPrograms,
  fetchInspiration,
  fetchQuotes,
  fetchGallery,
  fetchSocial,
  fetchHelpdeskTickets,
  fetchHomeContent,
  sendChatMessage,
  cleanText,
};