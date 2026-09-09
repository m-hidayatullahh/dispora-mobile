// Data fasilitas. Struktur mengikuti halaman detail di
// https://dispora.jakarta.go.id/facilities/{id}
//
// Kalau nanti endpoint publik untuk fasilitas tersedia, cukup ganti
// getFacilityDetail() dengan pemanggilan API — bentuk objeknya sudah sama.

export const facilityList = [
  {
    id: 684,
    name: 'GRK Tebet',
    category: 'STADION',
    area: 'Jakarta Selatan',
    sport: 'Serbaguna',
    address: 'Jl. Tebet Timur Dalam III Tebet Jakarta Selatan.',
    image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
    operationalHours: '08:00 – 22:00',
    ebooking: true,
    subCount: 6,
    priceFrom: 20000,
  },
  {
    id: 512,
    name: 'Jakarta International Climbing Wall Park',
    category: 'ARENA',
    area: 'Jakarta Utara',
    sport: 'Panjat Tebing',
    address: 'Kawasan Olahraga Jakarta Utara.',
    image: null,
    operationalHours: '08:00 – 21:00',
    ebooking: true,
    subCount: 3,
    priceFrom: 35000,
  },
  {
    id: 431,
    name: 'Gelanggang Remaja Jakarta Timur',
    category: 'GELANGGANG',
    area: 'Jakarta Timur',
    sport: 'Serbaguna',
    address: 'Jl. Raya Bekasi, Jakarta Timur.',
    image: null,
    operationalHours: '07:00 – 22:00',
    ebooking: true,
    subCount: 5,
    priceFrom: 25000,
  },
  {
    id: 388,
    name: 'Gelanggang Olahraga Ciracas',
    category: 'GOR',
    area: 'Jakarta Timur',
    sport: 'Futsal & Basket',
    address: 'Jl. Raya Ciracas, Jakarta Timur.',
    image: null,
    operationalHours: '06:00 – 23:00',
    ebooking: true,
    subCount: 4,
    priceFrom: 60000,
  },
  {
    id: 355,
    name: 'Gelanggang Remaja Jakarta Selatan',
    category: 'GELANGGANG',
    area: 'Jakarta Selatan',
    sport: 'Bulu Tangkis',
    address: 'Jl. Bulungan, Jakarta Selatan.',
    image: null,
    operationalHours: '07:00 – 22:00',
    ebooking: false,
    subCount: 4,
    priceFrom: 30000,
  },
  {
    id: 301,
    name: 'Lapangan Atletik Rawamangun',
    category: 'STADION',
    area: 'Jakarta Timur',
    sport: 'Atletik',
    address: 'Jl. Pemuda, Rawamangun, Jakarta Timur.',
    image: null,
    operationalHours: '05:30 – 20:00',
    ebooking: false,
    subCount: 2,
    priceFrom: 25000,
  },
];

export const facilityAreas = [
  'Semua',
  'Jakarta Pusat',
  'Jakarta Utara',
  'Jakarta Selatan',
  'Jakarta Timur',
  'Jakarta Barat',
];

// Detail lengkap GRK Tebet (id 684)
const GRK_TEBET = {
  id: 684,
  name: 'GRK Tebet',
  category: 'STADION',
  area: 'Jakarta Selatan',
  address: 'Jl. Tebet Timur Dalam III Tebet Jakarta Selatan.',
  banner: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
  ebooking: true,

  gallery: [
    'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
  ],

  // Jam yang berlaku untuk venue
  operationalHours: '08:00 – 22:00',
  bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
  playHours: 'Sesuai Jadwal Arena',
  maxCapacity: 'STANDAR',

  supportFacilities: ['Parkir', 'Kantin', 'R.Medis', 'Toilet'],

  contacts: [
    { label: 'Narahubung', name: 'Admin GRK Tebet', phone: '082319584251' },
    { label: 'Narahubung 2', name: 'Tidak Tersedia', phone: 'Tidak Tersedia' },
  ],

  mapsQuery: 'GRK Tebet Jl. Tebet Timur Dalam III Jakarta Selatan',

  // Sub-fasilitas / arena di dalam venue
  subFacilities: [
    {
      id: 'bt1',
      name: 'Lapangan Bulu Tangkis 1 GRK Tebet',
      sport: 'Bulu Tangkis',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
    {
      id: 'bt2',
      name: 'Lapangan Bulu Tangkis 2 GRK Tebet',
      sport: 'Bulu Tangkis',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
    {
      id: 'bt3',
      name: 'Lapangan Bulu Tangkis 3 GRK Tebet',
      sport: 'Bulu Tangkis',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
    {
      id: 'voli',
      name: 'Lapangan Bola Voli GRK Tebet',
      sport: 'Bola Voli',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
    {
      id: 'basket',
      name: 'Lapangan Bola Basket GRK Tebet',
      sport: 'Bola Basket',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
    {
      id: 'aula',
      name: 'Aula Serbaguna GRK Tebet',
      sport: 'Serbaguna',
      status: 'Tersedia',
      image: 'https://fs.dispora.id/image-uploader/assets/img/product_product/GRKTebet684.png',
      operationalHours: '08:00 – 22:00',
      bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
      playHours: 'Sesuai Jadwal Arena',
      maxCapacity: 'STANDAR',
    },
  ],

  // Tarif retribusi. Lima baris pertama sesuai yang tampil di web,
  // sisanya mengikuti pola kategori yang sama untuk arena lain.
  tariffs: [
    {
      id: 't1',
      label: 'Latihan Olahraga, Sekolah/Perguruan Tinggi, Lapangan Bola Basket',
      group: 'PELAJAR',
      duration: '2 Jam',
      price: 20000,
    },
    {
      id: 't2',
      label: 'Pertandingan Olahraga, Sekolah/Perguruan Tinggi, Lapangan Bola Basket',
      group: 'PELAJAR',
      duration: '2 Jam',
      price: 35000,
    },
    {
      id: 't3',
      label: 'Latihan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bola Basket',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 60000,
    },
    {
      id: 't4',
      label: 'Pertandingan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bola Basket',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 120000,
    },
    {
      id: 't5',
      label: 'Masyarakat/Instansi/Umum, Latihan hari libur, Lapangan Bola Basket',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 90000,
    },
    {
      id: 't6',
      label: 'Latihan Olahraga, Sekolah/Perguruan Tinggi, Lapangan Bulu Tangkis',
      group: 'PELAJAR',
      duration: '2 Jam',
      price: 15000,
    },
    {
      id: 't7',
      label: 'Pertandingan Olahraga, Sekolah/Perguruan Tinggi, Lapangan Bulu Tangkis',
      group: 'PELAJAR',
      duration: '2 Jam',
      price: 25000,
    },
    {
      id: 't8',
      label: 'Latihan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bulu Tangkis',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 45000,
    },
    {
      id: 't9',
      label: 'Pertandingan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bulu Tangkis',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 90000,
    },
    {
      id: 't10',
      label: 'Latihan Olahraga, Sekolah/Perguruan Tinggi, Lapangan Bola Voli',
      group: 'PELAJAR',
      duration: '2 Jam',
      price: 20000,
    },
    {
      id: 't11',
      label: 'Latihan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bola Voli',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 60000,
    },
    {
      id: 't12',
      label: 'Pertandingan Olahraga, Masyarakat/Instansi/Umum, Lapangan Bola Voli',
      group: 'MASYARAKAT',
      duration: '2 Jam',
      price: 120000,
    },
  ],

  tariffNote: 'Tarif di atas sesuai dengan Perda Retribusi Nomor 1 Tahun 2024',

  // Pilihan pada dropdown "Tujuan Penggunaan"
  usagePurposes: [
    'Latihan Olahraga',
    'Pertandingan Olahraga',
    'Kegiatan Sekolah',
    'Kegiatan Instansi',
    'Kegiatan Umum',
  ],
};

const DETAILS = {
  684: GRK_TEBET,
};

// Detail generik untuk fasilitas yang belum punya data lengkap.
function buildGenericDetail(base) {
  return {
    ...base,
    banner: base.image,
    gallery: base.image ? [base.image] : [],
    bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
    playHours: 'Sesuai Jadwal Arena',
    maxCapacity: 'STANDAR',
    supportFacilities: ['Parkir', 'Toilet'],
    contacts: [{ label: 'Narahubung', name: `Admin ${base.name}`, phone: 'Tidak Tersedia' }],
    mapsQuery: `${base.name} ${base.address}`,
    subFacilities: [
      {
        id: 'main',
        name: `Arena Utama ${base.name}`,
        sport: base.sport,
        status: 'Tersedia',
        image: base.image,
        operationalHours: base.operationalHours,
        bookingServiceHours: 'Senin – Sabtu (07:00 – 17:00)',
        playHours: 'Sesuai Jadwal Arena',
        maxCapacity: 'STANDAR',
      },
    ],
    tariffs: [
      {
        id: 'g1',
        label: `Latihan Olahraga, Sekolah/Perguruan Tinggi, ${base.sport}`,
        group: 'PELAJAR',
        duration: '2 Jam',
        price: base.priceFrom,
      },
      {
        id: 'g2',
        label: `Latihan Olahraga, Masyarakat/Instansi/Umum, ${base.sport}`,
        group: 'MASYARAKAT',
        duration: '2 Jam',
        price: base.priceFrom * 3,
      },
    ],
    tariffNote: 'Tarif di atas sesuai dengan Perda Retribusi Nomor 1 Tahun 2024',
    usagePurposes: ['Latihan Olahraga', 'Pertandingan Olahraga', 'Kegiatan Umum'],
  };
}

export function getFacilityDetail(id) {
  if (DETAILS[id]) return DETAILS[id];
  const base = facilityList.find((f) => String(f.id) === String(id));
  return base ? buildGenericDetail(base) : null;
}

export function formatRupiah(value) {
  return 'Rp ' + (Number(value) || 0).toLocaleString('id-ID');
}

export default { facilityList, facilityAreas, getFacilityDetail, formatRupiah };
