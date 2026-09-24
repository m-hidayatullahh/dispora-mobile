import AsyncStorage from '@react-native-async-storage/async-storage';

// SIMULASI payment gateway Bank DKI. Tidak ada transaksi nyata.
//
// Tiap metode menghasilkan instruksi yang berbeda:
//   va_bank_dki        -> nomor Virtual Account
//   transfer_bank_dki  -> nomor rekening + nama penerima
//   qris               -> payload QRIS yang dirender jadi kode QR
//
// Untuk integrasi asli, ganti isi createCharge() dan checkStatus() dengan
// panggilan ke endpoint merchant Bank DKI. Bentuk objek yang dikembalikan
// sudah menyerupai respons payment gateway sehingga layar tidak perlu diubah.

const ORDERS_KEY = 'dispora.orders';

const BANK_DKI = {
  name: 'Bank DKI',
  vaPrefix: '8901',
  accountNumber: '11900123456789',
  accountName: 'BLUD Dispora Provinsi DKI Jakarta',
  branch: 'KCU Juanda',
};

const QRIS_MERCHANT = {
  name: 'DISPORA DKI JAKARTA',
  city: 'JAKARTA BARAT',
  nmid: 'ID1024398765432',
  terminal: 'A01',
};

export const PAYMENT_METHODS = [
  {
    id: 'qris',
    labelKey: 'pay.qris',
    icon: 'qr-code-outline',
    fee: 750,
    hint: 'Scan dari aplikasi bank atau e-wallet apa pun',
  },
  {
    id: 'va_bank_dki',
    labelKey: 'pay.vaBankDki',
    icon: 'card-outline',
    fee: 0,
    hint: 'Bayar lewat JakOne Mobile atau ATM Bank DKI',
  },
  {
    id: 'transfer_bank_dki',
    labelKey: 'pay.transferBankDki',
    icon: 'swap-horizontal-outline',
    fee: 0,
    hint: 'Transfer manual, verifikasi maksimal 1x24 jam',
  },
];

export function formatRupiah(value) {
  return 'Rp ' + (Number(value) || 0).toLocaleString('id-ID');
}

export function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function randomDigits(n) {
  let out = '';
  for (let i = 0; i < n; i += 1) out += Math.floor(Math.random() * 10);
  return out;
}

// Payload QRIS gaya EMVCo. Untuk demo saja — tidak valid di aplikasi bank.
function buildQrisPayload({ orderId, amount }) {
  const amountStr = String(Math.round(amount));
  const parts = [
    '000201',
    '010212',
    `26${String(44).padStart(2, '0')}0014ID.CO.QRIS.WWW0215${QRIS_MERCHANT.nmid}0303UMI`,
    '52044900',
    '5303360',
    `54${String(amountStr.length).padStart(2, '0')}${amountStr}`,
    '5802ID',
    `59${String(QRIS_MERCHANT.name.length).padStart(2, '0')}${QRIS_MERCHANT.name}`,
    `60${String(QRIS_MERCHANT.city.length).padStart(2, '0')}${QRIS_MERCHANT.city}`,
    `62${String(orderId.length + 4).padStart(2, '0')}05${String(orderId.length).padStart(2, '0')}${orderId}`,
    '6304DEMO',
  ];
  return parts.join('');
}

async function readOrders() {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function writeOrders(orders) {
  try {
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 50)));
  } catch (e) {
    // abaikan
  }
}

async function upsertOrder(order) {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.orderId === order.orderId);
  if (idx >= 0) orders[idx] = order;
  else orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function createCharge({ methodId, amount, item, customer }) {
  await new Promise((r) => setTimeout(r, 900)); // meniru latensi jaringan

  const method = PAYMENT_METHODS.find((m) => m.id === methodId) || PAYMENT_METHODS[0];
  const orderId = 'DSP' + Date.now().toString().slice(-10);
  const total = Number(amount) + Number(method.fee || 0);

  const charge = {
    orderId,
    methodId: method.id,
    bank: BANK_DKI.name,
    amount: Number(amount),
    fee: Number(method.fee || 0),
    total,
    item: item || '-',
    customerName: (customer && customer.name) || null,
    customerEmail: (customer && customer.email) || null,
    status: 'PENDING',
    createdAt: Date.now(),
    expiredAt: Date.now() + 15 * 60 * 1000,
    settleAfter: Date.now() + 6000, // waktu simulasi lunas
  };

  if (method.id === 'va_bank_dki') {
    charge.vaNumber = BANK_DKI.vaPrefix + randomDigits(10);
  } else if (method.id === 'transfer_bank_dki') {
    charge.accountNumber = BANK_DKI.accountNumber;
    charge.accountName = BANK_DKI.accountName;
    charge.branch = BANK_DKI.branch;
    // Tiga digit unik agar transfer manual bisa dicocokkan otomatis
    charge.uniqueCode = Number(randomDigits(3));
    charge.total = total + charge.uniqueCode;
  } else if (method.id === 'qris') {
    charge.qrPayload = buildQrisPayload({ orderId, amount: total });
    charge.merchantName = QRIS_MERCHANT.name;
    charge.nmid = QRIS_MERCHANT.nmid;
    charge.terminal = QRIS_MERCHANT.terminal;
  }

  await upsertOrder(charge);
  return charge;
}

export async function checkStatus(orderId) {
  await new Promise((r) => setTimeout(r, 1200));

  const orders = await readOrders();
  const charge = orders.find((o) => o.orderId === orderId);
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

  await upsertOrder(charge);
  return charge;
}

export async function listOrders() {
  const orders = await readOrders();
  // Perbarui status kedaluwarsa saat daftar dibuka
  const now = Date.now();
  let changed = false;
  orders.forEach((o) => {
    if (o.status === 'PENDING' && now > o.expiredAt) {
      o.status = 'EXPIRED';
      changed = true;
    }
  });
  if (changed) await writeOrders(orders);
  return orders;
}

export async function findOrder(orderId) {
  const orders = await readOrders();
  const q = String(orderId || '').trim().toUpperCase();
  return orders.find((o) => o.orderId.toUpperCase() === q) || null;
}

export async function clearOrders() {
  await AsyncStorage.removeItem(ORDERS_KEY);
}

export const BANK_INFO = BANK_DKI;

export default {
  PAYMENT_METHODS,
  createCharge,
  checkStatus,
  listOrders,
  findOrder,
  clearOrders,
  formatRupiah,
  formatCountdown,
  BANK_INFO,
};