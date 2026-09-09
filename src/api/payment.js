// SIMULASI payment gateway Bank DKI.
// Tidak ada transaksi nyata di sini — semua dihitung di perangkat.
//
// Untuk integrasi asli nanti, ganti isi createCharge() dan checkStatus()
// dengan panggilan ke endpoint merchant Bank DKI. Bentuk data yang
// dikembalikan sudah dibuat menyerupai respons payment gateway
// (orderId, vaNumber, amount, expiredAt, status) supaya layar
// PaymentScreen tidak perlu diubah.

const BANK_DKI_VA_PREFIX = '8901'; // prefix contoh, bukan prefix resmi

const store = new Map();

function randomDigits(n) {
  let out = '';
  for (let i = 0; i < n; i += 1) out += Math.floor(Math.random() * 10);
  return out;
}

export const PAYMENT_METHODS = [
  { id: 'va_bank_dki', labelKey: 'pay.vaBankDki', icon: 'card-outline', fee: 0 },
  { id: 'transfer_bank_dki', labelKey: 'pay.transferBankDki', icon: 'swap-horizontal-outline', fee: 0 },
  { id: 'qris', labelKey: 'pay.qris', icon: 'qr-code-outline', fee: 750 },
];

export function formatRupiah(value) {
  const n = Number(value) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Membuat tagihan baru.
export async function createCharge({ methodId, amount, item, customer }) {
  await new Promise((r) => setTimeout(r, 900)); // meniru latensi jaringan

  const method = PAYMENT_METHODS.find((m) => m.id === methodId) || PAYMENT_METHODS[0];
  const orderId = 'DSP' + Date.now().toString().slice(-10);
  const total = Number(amount) + Number(method.fee || 0);

  const charge = {
    orderId,
    methodId: method.id,
    vaNumber: BANK_DKI_VA_PREFIX + randomDigits(10),
    amount: Number(amount),
    fee: Number(method.fee || 0),
    total,
    item: item || '-',
    customer: customer || null,
    status: 'PENDING',
    createdAt: Date.now(),
    expiredAt: Date.now() + 15 * 60 * 1000, // 15 menit
    // waktu simulasi: tagihan dianggap lunas setelah 6 detik sejak dibuat
    settleAfter: Date.now() + 6000,
  };

  store.set(orderId, charge);
  return charge;
}

// Mengecek status tagihan.
export async function checkStatus(orderId) {
  await new Promise((r) => setTimeout(r, 1200));

  const charge = store.get(orderId);
  if (!charge) {
    const err = new Error('Order tidak ditemukan');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (charge.status === 'PAID') return charge;

  if (Date.now() > charge.expiredAt) {
    charge.status = 'EXPIRED';
  } else if (Date.now() >= charge.settleAfter) {
    charge.status = 'PAID';
    charge.paidAt = Date.now();
  }

  store.set(orderId, charge);
  return charge;
}

export function getCharge(orderId) {
  return store.get(orderId) || null;
}

export default { PAYMENT_METHODS, createCharge, checkStatus, getCharge, formatRupiah, formatCountdown };
