import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme, useThemedStyles, spacing, radius, shadow } from '../theme';
import { useI18n } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import { getFacilityDetail, formatRupiah } from '../data/facilities';
import { PrimaryButton, Divider } from '../components/common';

const L = {
  id: {
    mainInfo: 'Informasi Fasilitas Utama',
    specificInfo: 'INFORMASI FASILITAS SPESIFIK',
    ebooking: 'E-BOOKING TERSEDIA',
    bookTitle: 'Pesan Jadwal',
    purpose: 'TUJUAN PENGGUNAAN',
    purposePlaceholder: '-- Pilih Tujuan --',
    date: 'TANGGAL PEMAKAIAN',
    datePlaceholder: 'Pilih jadwal permainan',
    continue: 'LANJUT PILIH JADWAL',
    opHours: 'JAM OPERASIONAL VENUE',
    bookHours: 'JAM LAYANAN BOOKING',
    playHours: 'JAM MAIN TERSEDIA',
    capacity: 'KAPASITAS MAKSIMAL',
    choose: 'PILIHAN FASILITAS',
    chooseHint: 'Pilih sub-fasilitas untuk melihat ketersediaan jadwal.',
    searchArena: 'Cari nama arena...',
    allSports: 'Semua Olahraga',
    pick: 'PILIH FASILITAS',
    available: 'Tersedia',
    tariff: 'Tarif Retribusi',
    category: 'KATEGORI / PENGGUNAAN',
    duration: 'DURASI',
    price: 'HARGA',
    prev: 'Sebelumnya',
    next: 'Selanjutnya',
    total: 'Total',
    data: 'Data',
    page: 'Halaman',
    of: 'dari',
    support: 'FASILITAS PENDUKUNG',
    location: 'Lokasi & Kontak',
    mapTitle: 'PETA LOKASI',
    openMaps: 'Buka di Maps',
    contactTitle: 'INFORMASI KONTAK & LOKASI',
    phone: 'NO TELP',
    address: 'ALAMAT',
    subFacility: 'SUB-FASILITAS',
    needPurpose: 'Pilih tujuan penggunaan dan tanggal dulu.',
  },
  en: {
    mainInfo: 'Main Facility Information',
    specificInfo: 'SPECIFIC FACILITY INFORMATION',
    ebooking: 'E-BOOKING AVAILABLE',
    bookTitle: 'Book a Schedule',
    purpose: 'PURPOSE OF USE',
    purposePlaceholder: '-- Select Purpose --',
    date: 'USAGE DATE',
    datePlaceholder: 'Pick a play date',
    continue: 'CONTINUE TO SCHEDULE',
    opHours: 'VENUE OPERATING HOURS',
    bookHours: 'BOOKING SERVICE HOURS',
    playHours: 'AVAILABLE PLAY HOURS',
    capacity: 'MAXIMUM CAPACITY',
    choose: 'FACILITY OPTIONS',
    chooseHint: 'Pick a sub-facility to see schedule availability.',
    searchArena: 'Search arena name...',
    allSports: 'All Sports',
    pick: 'SELECT FACILITY',
    available: 'Available',
    tariff: 'Retribution Rates',
    category: 'CATEGORY / USAGE',
    duration: 'DURATION',
    price: 'PRICE',
    prev: 'Previous',
    next: 'Next',
    total: 'Total',
    data: 'Rows',
    page: 'Page',
    of: 'of',
    support: 'SUPPORTING FACILITIES',
    location: 'Location & Contact',
    mapTitle: 'LOCATION MAP',
    openMaps: 'Open in Maps',
    contactTitle: 'CONTACT & LOCATION INFO',
    phone: 'PHONE',
    address: 'ADDRESS',
    subFacility: 'SUB-FACILITY',
    needPurpose: 'Select a purpose and date first.',
  },
};

const SUPPORT_ICONS = {
  Parkir: 'car-outline',
  Kantin: 'restaurant-outline',
  'R.Medis': 'medkit-outline',
  Toilet: 'water-outline',
};

const TARIFF_PAGE_SIZE = 5;
const SUB_PAGE_SIZE = 4;

function nextDays(count) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push(d);
  }
  return out;
}

export default function FacilityDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { lang } = useI18n();
  const { user, isLoggedIn } = useAuth();
  const s = useThemedStyles(makeStyles);
  const tx = L[lang] || L.id;

  const facilityId = route.params?.facilityId ?? 684;
  const detail = useMemo(() => getFacilityDetail(facilityId), [facilityId]);

  const [selectedSub, setSelectedSub] = useState(detail?.subFacilities?.[0] || null);
  const [purpose, setPurpose] = useState(null);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [date, setDate] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [arenaQuery, setArenaQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('Semua');
  const [subPage, setSubPage] = useState(0);
  const [tariffPage, setTariffPage] = useState(0);

  if (!detail) {
    return (
      <View style={s.screen}>
        <Text style={s.emptyText}>Fasilitas tidak ditemukan.</Text>
      </View>
    );
  }

  const sports = ['Semua', ...new Set(detail.subFacilities.map((x) => x.sport))];

  const filteredSubs = detail.subFacilities.filter((x) => {
    const q = arenaQuery.trim().toLowerCase();
    const okQuery = !q || x.name.toLowerCase().includes(q);
    const okSport = sportFilter === 'Semua' || x.sport === sportFilter;
    return okQuery && okSport;
  });

  const subPages = Math.max(1, Math.ceil(filteredSubs.length / SUB_PAGE_SIZE));
  const subSlice = filteredSubs.slice(subPage * SUB_PAGE_SIZE, (subPage + 1) * SUB_PAGE_SIZE);

  const tariffPages = Math.max(1, Math.ceil(detail.tariffs.length / TARIFF_PAGE_SIZE));
  const tariffSlice = detail.tariffs.slice(
    tariffPage * TARIFF_PAGE_SIZE,
    (tariffPage + 1) * TARIFF_PAGE_SIZE
  );

  const formatDate = (d) =>
    d
      ? d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;

  const openMaps = () => {
    const q = encodeURIComponent(detail.mapsQuery || detail.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  };

  const proceed = () => {
    if (!purpose || !date) {
      Alert.alert(tx.bookTitle, tx.needPurpose);
      return;
    }
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    const matching =
      detail.tariffs.find((t) => t.label.toLowerCase().includes(purpose.toLowerCase())) ||
      detail.tariffs[0];

    navigation.navigate('Payment', {
      order: {
        item: selectedSub ? selectedSub.name : detail.name,
        amount: matching.price,
        detail: `${purpose} · ${formatDate(date)} · ${matching.duration}`,
      },
    });
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={s.banner}>
        {detail.banner ? (
          <Image source={{ uri: detail.banner }} style={s.bannerImage} resizeMode="cover" />
        ) : null}
        <LinearGradient
          colors={['rgba(11,12,16,0.15)', 'rgba(11,12,16,0.55)', 'rgba(11,12,16,0.92)']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View style={s.bannerBody}>
          <View style={s.bannerBadge}>
            <Text style={s.bannerBadgeText}>{detail.category}</Text>
          </View>
          <Text style={s.bannerTitle}>{detail.name}</Text>
          <View style={s.bannerAddrRow}>
            <Ionicons name="location" size={13} color="#D5D9E4" />
            <Text style={s.bannerAddr}>{detail.address}</Text>
          </View>
        </View>
      </View>

      {/* Panel pemesanan */}
      <View style={s.bookCard}>
        <View style={s.ebookingRow}>
          <View style={s.dot} />
          <Text style={s.ebookingText}>{tx.ebooking}</Text>
        </View>

        {isLoggedIn ? (
          <View style={s.userRow}>
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>{(user.name || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userEmail}>{user.email}</Text>
              <Text style={s.userName}>{user.name}</Text>
            </View>
          </View>
        ) : null}

        <Text style={s.bookTitle}>{tx.bookTitle}</Text>

        {selectedSub ? (
          <View style={s.selectedChip}>
            <Ionicons name="grid-outline" size={12} color={colors.primary} />
            <Text style={s.selectedChipText} numberOfLines={1}>
              {selectedSub.name.toUpperCase()}
            </Text>
          </View>
        ) : null}

        {/* Tujuan penggunaan */}
        <Text style={s.fieldLabel}>{tx.purpose}</Text>
        <Pressable style={s.select} onPress={() => setPurposeOpen((v) => !v)}>
          <Text style={[s.selectText, !purpose && s.selectPlaceholder]}>
            {purpose || tx.purposePlaceholder}
          </Text>
          <Ionicons
            name={purposeOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textFaint}
          />
        </Pressable>
        {purposeOpen ? (
          <View style={s.dropdown}>
            {detail.usagePurposes.map((p, i) => (
              <View key={p}>
                <Pressable
                  style={s.dropdownItem}
                  onPress={() => {
                    setPurpose(p);
                    setPurposeOpen(false);
                  }}
                >
                  <Text style={[s.dropdownText, purpose === p && s.dropdownTextActive]}>{p}</Text>
                  {purpose === p ? (
                    <Ionicons name="checkmark" size={15} color={colors.primary} />
                  ) : null}
                </Pressable>
                {i < detail.usagePurposes.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Tanggal pemakaian */}
        <Text style={s.fieldLabel}>{tx.date}</Text>
        <Pressable style={s.select} onPress={() => setDateOpen((v) => !v)}>
          <Ionicons name="calendar-outline" size={16} color={colors.textFaint} />
          <Text style={[s.selectText, !date && s.selectPlaceholder, { flex: 1 }]}>
            {formatDate(date) || tx.datePlaceholder}
          </Text>
          <Ionicons
            name={dateOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textFaint}
          />
        </Pressable>
        {dateOpen ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateStrip}>
            {nextDays(14).map((d) => {
              const active = date && d.toDateString() === date.toDateString();
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => {
                    setDate(d);
                    setDateOpen(false);
                  }}
                  style={[s.dateCell, active && s.dateCellActive]}
                >
                  <Text style={[s.dateDow, active && s.dateTextActive]}>
                    {d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short' })}
                  </Text>
                  <Text style={[s.dateNum, active && s.dateTextActive]}>{d.getDate()}</Text>
                  <Text style={[s.dateMon, active && s.dateTextActive]}>
                    {d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { month: 'short' })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <PrimaryButton
          label={tx.continue}
          icon="arrow-forward"
          onPress={proceed}
          disabled={!purpose || !date}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* Informasi fasilitas utama — galeri */}
      <SectionTitle icon="information-circle-outline" text={tx.mainInfo} s={s} colors={colors} />
      <View style={s.galleryCard}>
        <Image
          source={{ uri: (selectedSub && selectedSub.image) || detail.gallery[0] }}
          style={s.galleryImage}
          resizeMode="cover"
        />
        <View style={s.galleryBadge}>
          <Ionicons name="images-outline" size={11} color={colors.onPrimary} />
          <Text style={s.galleryBadgeText}>{tx.subFacility}</Text>
        </View>
      </View>

      {/* Informasi spesifik */}
      <View style={s.specCard}>
        <View style={s.specHeader}>
          <View style={s.specBar} />
          <Text style={s.specTitle}>{tx.specificInfo}</Text>
        </View>
        {selectedSub ? (
          <View style={s.specName}>
            <Text style={s.specNameText}>{selectedSub.name}</Text>
          </View>
        ) : null}

        <View style={s.specGrid}>
          <SpecBox
            s={s}
            colors={colors}
            icon="time-outline"
            label={tx.opHours}
            value={(selectedSub && selectedSub.operationalHours) || detail.operationalHours}
          />
          <SpecBox
            s={s}
            colors={colors}
            icon="calendar-outline"
            label={tx.bookHours}
            value={(selectedSub && selectedSub.bookingServiceHours) || detail.bookingServiceHours}
          />
          <SpecBox
            s={s}
            colors={colors}
            icon="football-outline"
            label={tx.playHours}
            value={(selectedSub && selectedSub.playHours) || detail.playHours}
          />
        </View>

        <View style={s.capacityRow}>
          <View style={s.capacityLeft}>
            <Ionicons name="people-outline" size={15} color={colors.primary} />
            <Text style={s.capacityLabel}>{tx.capacity}</Text>
          </View>
          <Text style={s.capacityValue}>
            {(selectedSub && selectedSub.maxCapacity) || detail.maxCapacity}
          </Text>
        </View>
      </View>

      {/* Pilihan fasilitas */}
      <View style={s.chooseCard}>
        <View style={s.specHeader}>
          <View style={s.specBar} />
          <View style={{ flex: 1 }}>
            <Text style={s.specTitle}>{tx.choose}</Text>
            <Text style={s.chooseHint}>{tx.chooseHint}</Text>
          </View>
        </View>

        <View style={s.searchRow}>
          <Ionicons name="search" size={15} color={colors.textFaint} />
          <TextInput
            value={arenaQuery}
            onChangeText={(v) => {
              setArenaQuery(v);
              setSubPage(0);
            }}
            placeholder={tx.searchArena}
            placeholderTextColor={colors.textFaint}
            style={s.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sportChips}>
          {sports.map((sp) => {
            const active = sp === sportFilter;
            return (
              <Pressable
                key={sp}
                onPress={() => {
                  setSportFilter(sp);
                  setSubPage(0);
                }}
                style={[s.sportChip, active && s.sportChipActive]}
              >
                <Text style={[s.sportChipText, active && s.sportChipTextActive]}>
                  {sp === 'Semua' ? tx.allSports : sp}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          horizontal
          data={subSlice}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.sm }}
          renderItem={({ item }) => {
            const active = selectedSub && selectedSub.id === item.id;
            return (
              <Pressable
                onPress={() => setSelectedSub(item)}
                style={[s.subCard, active && s.subCardActive]}
              >
                <View style={s.subMedia}>
                  <Image source={{ uri: item.image }} style={s.subImage} resizeMode="cover" />
                  {active ? (
                    <View style={s.subCheck}>
                      <Ionicons name="checkmark" size={13} color={colors.onPrimary} />
                    </View>
                  ) : null}
                </View>
                <Text style={s.subName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={s.subStatusRow}>
                  <View style={s.subStatusDot} />
                  <Text style={s.subStatus}>{tx.available}</Text>
                </View>
                <Text style={[s.subPick, active && s.subPickActive]}>{tx.pick} →</Text>
              </Pressable>
            );
          }}
        />

        <Pager
          s={s}
          page={subPage}
          pages={subPages}
          onPrev={() => setSubPage((p) => Math.max(0, p - 1))}
          onNext={() => setSubPage((p) => Math.min(subPages - 1, p + 1))}
          label={`${subPage + 1} / ${subPages}`}
          tx={tx}
        />
      </View>

      {/* Tarif retribusi */}
      <View style={s.tariffCard}>
        <View style={s.specHeader}>
          <View style={s.specBar} />
          <Text style={s.tariffTitle}>{tx.tariff}</Text>
        </View>

        <View style={s.tableHead}>
          <Text style={[s.tableHeadText, { flex: 3 }]}>{tx.category}</Text>
          <Text style={[s.tableHeadText, { width: 54, textAlign: 'center' }]}>{tx.duration}</Text>
          <Text style={[s.tableHeadText, { width: 78, textAlign: 'right' }]}>{tx.price}</Text>
        </View>

        {tariffSlice.map((row, i) => (
          <View key={row.id}>
            <View style={s.tableRow}>
              <View style={{ flex: 3, gap: 5 }}>
                <Text style={s.tariffLabel}>{row.label}</Text>
                <View
                  style={[
                    s.groupBadge,
                    row.group === 'PELAJAR' ? s.groupPelajar : s.groupMasyarakat,
                  ]}
                >
                  <Text
                    style={[
                      s.groupBadgeText,
                      row.group === 'PELAJAR' ? s.groupPelajarText : s.groupMasyarakatText,
                    ]}
                  >
                    {row.group}
                  </Text>
                </View>
              </View>
              <View style={s.durationCell}>
                <Text style={s.durationText}>{row.duration}</Text>
              </View>
              <Text style={s.priceText}>{formatRupiah(row.price)}</Text>
            </View>
            {i < tariffSlice.length - 1 ? <Divider /> : null}
          </View>
        ))}

        <Pager
          s={s}
          page={tariffPage}
          pages={tariffPages}
          onPrev={() => setTariffPage((p) => Math.max(0, p - 1))}
          onNext={() => setTariffPage((p) => Math.min(tariffPages - 1, p + 1))}
          label={`${tx.total}: ${detail.tariffs.length} ${tx.data} | ${tx.page} ${tariffPage + 1} ${tx.of} ${tariffPages}`}
          tx={tx}
        />

        <View style={s.tariffNote}>
          <Text style={s.tariffNoteText}>* {detail.tariffNote}</Text>
        </View>
      </View>

      {/* Fasilitas pendukung */}
      <View style={s.supportCard}>
        <View style={s.specHeader}>
          <View style={s.specBar} />
          <Text style={s.supportTitle}>{tx.support}</Text>
        </View>
        <View style={s.supportGrid}>
          {detail.supportFacilities.map((f) => (
            <View key={f} style={s.supportItem}>
              <Ionicons
                name={SUPPORT_ICONS[f] || 'checkmark-circle-outline'}
                size={16}
                color={colors.primary}
              />
              <Text style={s.supportText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Lokasi & kontak */}
      <SectionTitle icon="location-outline" text={tx.location} s={s} colors={colors} />

      <View style={s.mapCard}>
        <View style={s.mapHeader}>
          <Ionicons name="location" size={13} color={colors.primary} />
          <Text style={s.mapHeaderText}>{tx.mapTitle}</Text>
        </View>
        <Pressable style={s.mapButton} onPress={openMaps}>
          <Text style={s.mapButtonText}>{tx.openMaps}</Text>
          <Ionicons name="open-outline" size={13} color={colors.primary} />
        </Pressable>
        <View style={s.mapPlaceholder}>
          <Ionicons name="map-outline" size={28} color={colors.textFaint} />
          <Text style={s.mapAddress}>{detail.address}</Text>
        </View>
      </View>

      <View style={s.contactCard}>
        <View style={s.mapHeader}>
          <Ionicons name="call" size={13} color={colors.primary} />
          <Text style={s.mapHeaderText}>{tx.contactTitle}</Text>
        </View>

        {detail.contacts.map((ct, i) => (
          <View key={ct.label} style={s.contactPair}>
            <View style={s.contactBox}>
              <Text style={s.contactBoxLabel}>{ct.label.toUpperCase()}</Text>
              <Text style={s.contactBoxValue}>{ct.name}</Text>
            </View>
            <Pressable
              style={s.contactBox}
              onPress={() =>
                ct.phone && ct.phone !== 'Tidak Tersedia'
                  ? Linking.openURL(`tel:${ct.phone}`).catch(() => {})
                  : null
              }
            >
              <Text style={s.contactBoxLabel}>
                {tx.phone} {i > 0 ? '2' : ''}
              </Text>
              <Text
                style={[
                  s.contactBoxValue,
                  ct.phone !== 'Tidak Tersedia' && { color: colors.primary },
                ]}
              >
                {ct.phone}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={s.contactBoxFull}>
          <Text style={s.contactBoxLabel}>{tx.address}</Text>
          <Text style={s.contactBoxValue}>{detail.address}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ icon, text, s, colors }) {
  return (
    <View style={s.sectionTitleRow}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <Text style={s.sectionTitleText}>{text}</Text>
    </View>
  );
}

function SpecBox({ s, colors, icon, label, value }) {
  return (
    <View style={s.specBox}>
      <View style={s.specBoxHead}>
        <Ionicons name={icon} size={12} color={colors.primary} />
        <Text style={s.specBoxLabel}>{label}</Text>
      </View>
      <Text style={s.specBoxValue}>{value}</Text>
    </View>
  );
}

function Pager({ s, page, pages, onPrev, onNext, label, tx }) {
  const first = page === 0;
  const last = page >= pages - 1;
  return (
    <View style={s.pager}>
      <Pressable onPress={onPrev} disabled={first} style={[s.pagerBtn, first && s.pagerDisabled]}>
        <Text style={s.pagerText}>{tx.prev}</Text>
      </Pressable>
      <Text style={s.pagerLabel}>{label}</Text>
      <Pressable onPress={onNext} disabled={last} style={[s.pagerBtn, last && s.pagerDisabled]}>
        <Text style={s.pagerText}>{tx.next}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  content: { paddingBottom: spacing.xxl * 2 },
  emptyText: { ...t.body, textAlign: 'center', marginTop: spacing.xxl },

  banner: {
    height: 210,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
    justifyContent: 'flex-end',
  },
  bannerImage: { position: 'absolute', width: '100%', height: '100%' },
  bannerBody: { padding: spacing.lg, gap: 6 },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: c.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  bannerBadgeText: { color: c.onPrimary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  bannerTitle: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8 },
  bannerAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bannerAddr: { fontSize: 12, color: '#D5D9E4', flex: 1 },

  bookCard: {
    margin: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  ebookingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary },
  ebookingText: { color: c.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.base,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: c.onPrimary, fontSize: 14, fontWeight: '900' },
  userEmail: { ...t.subtitle, fontSize: 13 },
  userName: { ...t.small, fontSize: 11 },

  bookTitle: { ...t.title, fontSize: 24, marginTop: spacing.xs },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: c.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    maxWidth: '100%',
  },
  selectedChipText: { color: c.primary, fontSize: 10, fontWeight: '800', flexShrink: 1 },

  fieldLabel: {
    ...t.small,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: spacing.md,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  selectText: { ...t.subtitle, fontSize: 14, flex: 1 },
  selectPlaceholder: { color: c.textFaint, fontWeight: '500' },

  dropdown: {
    backgroundColor: c.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  dropdownText: { ...t.body, fontSize: 14, color: c.text },
  dropdownTextActive: { color: c.primary, fontWeight: '700' },

  dateStrip: { marginTop: spacing.sm },
  dateCell: {
    width: 58,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.base,
  },
  dateCellActive: { backgroundColor: c.primary, borderColor: c.primary },
  dateDow: { ...t.small, fontSize: 10, textTransform: 'uppercase' },
  dateNum: { color: c.text, fontSize: 18, fontWeight: '900' },
  dateMon: { ...t.small, fontSize: 10 },
  dateTextActive: { color: c.onPrimary },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitleText: { ...t.title, fontSize: 19 },

  galleryCard: {
    marginHorizontal: spacing.lg,
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
    borderWidth: 1,
    borderColor: c.line,
  },
  galleryImage: { width: '100%', height: '100%' },
  galleryBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: c.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  galleryBadgeText: { color: c.onPrimary, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },

  specCard: {
    margin: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  specHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  specBar: { width: 3, height: 20, borderRadius: 2, backgroundColor: c.primary },
  specTitle: { ...t.subtitle, fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  specName: {
    alignSelf: 'flex-start',
    backgroundColor: c.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  specNameText: { color: c.primary, fontSize: 13, fontWeight: '800' },

  specGrid: { gap: spacing.sm },
  specBox: {
    backgroundColor: c.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.md,
    gap: 5,
  },
  specBoxHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  specBoxLabel: { ...t.small, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  specBoxValue: { ...t.subtitle, fontSize: 14 },

  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  capacityLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  capacityLabel: { ...t.small, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  capacityValue: { color: c.primary, fontSize: 13, fontWeight: '900' },

  chooseCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  chooseHint: { ...t.small, marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 42,
    paddingHorizontal: spacing.md,
    backgroundColor: c.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  searchInput: { flex: 1, color: c.text, fontSize: 13, padding: 0 },
  sportChips: { flexGrow: 0 },
  sportChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.base,
  },
  sportChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  sportChipText: { color: c.textMuted, fontSize: 11, fontWeight: '700' },
  sportChipTextActive: { color: c.onPrimary },

  subCard: {
    width: 150,
    backgroundColor: c.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.md,
    gap: 6,
  },
  subCardActive: { borderColor: c.primary, borderWidth: 2 },
  subMedia: { height: 84, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: c.surfaceAlt },
  subImage: { width: '100%', height: '100%' },
  subCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subName: { ...t.subtitle, fontSize: 12, lineHeight: 16 },
  subStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subStatusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.success },
  subStatus: { color: c.success, fontSize: 10, fontWeight: '700' },
  subPick: { color: c.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  subPickActive: { color: c.primary },

  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pagerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.base,
  },
  pagerDisabled: { opacity: 0.4 },
  pagerText: { color: c.textMuted, fontSize: 11, fontWeight: '700' },
  pagerLabel: { ...t.small, fontSize: 10, flex: 1, textAlign: 'center' },

  tariffCard: {
    margin: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tariffTitle: { ...t.title, fontSize: 19 },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  tableHeadText: { ...t.small, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  tariffLabel: { ...t.body, fontSize: 12, lineHeight: 17, color: c.text },
  groupBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  groupPelajar: { backgroundColor: c.blueSoft },
  groupMasyarakat: { backgroundColor: c.successSoft },
  groupBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  groupPelajarText: { color: c.blue },
  groupMasyarakatText: { color: c.success },
  durationCell: {
    width: 54,
    alignItems: 'center',
    backgroundColor: c.base,
    borderRadius: radius.sm,
    paddingVertical: 5,
  },
  durationText: { ...t.small, fontSize: 10, fontWeight: '700' },
  priceText: { width: 78, textAlign: 'right', color: c.primary, fontSize: 13, fontWeight: '900' },
  tariffNote: { backgroundColor: c.base, borderRadius: radius.md, padding: spacing.md },
  tariffNoteText: { ...t.small, fontSize: 10, lineHeight: 15 },

  supportCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: c.mode === 'dark' ? '#0F1118' : '#101223',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  supportTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    minWidth: '46%',
    flexGrow: 1,
  },
  supportText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  mapCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapHeaderText: { ...t.small, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  mapButtonText: { color: c.primary, fontSize: 11, fontWeight: '800' },
  mapPlaceholder: {
    height: 120,
    borderRadius: radius.md,
    backgroundColor: c.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  mapAddress: { ...t.small, fontSize: 11, textAlign: 'center' },

  contactCard: {
    margin: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  contactPair: { flexDirection: 'row', gap: spacing.sm },
  contactBox: {
    flex: 1,
    backgroundColor: c.base,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  contactBoxFull: {
    backgroundColor: c.base,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  contactBoxLabel: { ...t.small, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  contactBoxValue: { ...t.subtitle, fontSize: 13 },
});
