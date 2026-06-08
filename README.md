# WARUNG-STOCK: Smart Inventory Management

WARUNG-STOCK adalah aplikasi Android berbasis React Native dan Expo untuk membantu UMKM warung makan atau toko grosir kecil mencatat stok bahan baku, memantau stok rendah, melihat bahan yang mendekati kedaluwarsa, dan mencatat barang masuk/keluar secara offline dengan SQLite.

## Konsep Aplikasi

Aplikasi ini dirancang untuk pengguna yang membutuhkan proses cepat dan sederhana: buka dashboard, lihat status stok, tambah bahan, catat pemakaian, lalu cek rekomendasi tindakan. Fokus desainnya adalah tombol besar, ikon jelas, teks mudah dibaca, dan warna status yang informatif.

## Fitur Lengkap

- Autentikasi: splash/loading, onboarding, login, register, forgot password simulasi, setup profil warung, mode demo, remember me, dan PIN lokal.
- Dashboard ringkasan: total item, stok rendah, hampir kedaluwarsa, barang masuk/keluar hari ini, nilai stok, dan rekomendasi tindakan.
- CRUD bahan baku: tambah, lihat detail, edit, hapus, harga beli opsional, catatan opsional, kategori, satuan, minimum stok, dan tanggal kedaluwarsa.
- Status stok: `Aman`, `Hampir Habis`, dan `Stok Rendah` dengan badge hijau, oranye, dan merah.
- Log stok: barang masuk menambah stok, barang keluar mengurangi stok, plus catatan transaksi.
- Peringatan kedaluwarsa: `Segera digunakan` untuk 7 hari ke depan dan `Kedaluwarsa` jika tanggal sudah lewat.
- Search dan filter: nama bahan, kategori, status stok, segera digunakan, dan kedaluwarsa.
- Statistik: bahan paling sering keluar, masuk/keluar minggu ini, estimasi nilai stok, dan kartu ringkasan.
- Pengaturan: nama warung, reset data lokal, dan tentang aplikasi.

## User Flow

1. Pengguna membuka aplikasi dan melihat splash/loading.
2. Pengguna baru melihat onboarding 3 slide.
3. Pengguna login, register, atau mencoba mode demo.
4. Setelah register, pengguna melengkapi profil warung.
5. Pengguna dapat membuat PIN 4 digit atau memilih gunakan nanti.
6. Pengguna masuk ke dashboard untuk membaca kondisi stok.
7. Pengguna menambah bahan baku dan menentukan minimum stok.
8. Pengguna membuka detail barang untuk mencatat barang masuk atau keluar.
9. Aplikasi memperbarui stok otomatis dan membuat log transaksi.
10. Pengguna melihat badge stok rendah atau label kedaluwarsa.
11. Pengguna membuka statistik untuk melihat pola pemakaian.

## Struktur Folder React Native

```text
app/
  _layout.tsx
  (auth)/
    onboarding.tsx
    login.tsx
    register.tsx
    forgot-password.tsx
    setup-business.tsx
    pin-lock.tsx
    logout.tsx
  (app)/
    dashboard.tsx
    add-item.tsx
    item/[id].tsx
    history.tsx
    statistics.tsx
    settings.tsx
src/
  components/
    auth/
      AuthCard.tsx
      AuthHeader.tsx
      AuthTextInput.tsx
      PasswordInput.tsx
      AuthButtons.tsx
      OnboardingSlide.tsx
      PinInput.tsx
      BusinessTypeCard.tsx
  services/
    db.ts
    inventory.ts
    alerts.ts
    storage.ts
  screens/
    auth/
    components/
  hooks/
  theme.ts
assets/
```

## Struktur Database SQLite

### Tabel `users`

| Kolom | Keterangan |
| --- | --- |
| `id` | Primary key |
| `name` | Nama pengguna |
| `business_name` | Nama warung/toko |
| `email` | Email unik |
| `phone` | Nomor HP opsional |
| `password_hash` | Hash password lokal |
| `pin_code` | Hash PIN lokal |
| `created_at` | Waktu dibuat |
| `updated_at` | Waktu diperbarui |

### Tabel `business_profile`

| Kolom | Keterangan |
| --- | --- |
| `id` | Primary key |
| `user_id` | Relasi ke user lokal |
| `business_name` | Nama warung |
| `business_type` | Jenis usaha |
| `location` | Lokasi opsional |
| `default_currency` | Default `IDR` |
| `default_unit` | Default satuan |
| `created_at` | Waktu dibuat |
| `updated_at` | Waktu diperbarui |

### Tabel `items`

| Kolom | Keterangan |
| --- | --- |
| `id` | Primary key |
| `name` | Nama bahan |
| `category` | Kategori bahan |
| `quantity` | Jumlah stok |
| `unit` | Satuan, contoh kg/liter/pcs |
| `minimum_stock` | Batas minimum stok |
| `expiry_date` | Tanggal kedaluwarsa format `YYYY-MM-DD` |
| `purchase_price` | Harga beli opsional |
| `notes` | Catatan opsional |
| `created_at` | Waktu dibuat |
| `updated_at` | Waktu diperbarui |

### Tabel `stock_logs`

| Kolom | Keterangan |
| --- | --- |
| `id` | Primary key |
| `item_id` | Relasi ke `items.id` |
| `type` | `IN` atau `OUT` |
| `quantity` | Jumlah perubahan stok |
| `description` | Keterangan transaksi |
| `date` | Tanggal transaksi |
| `created_at` | Waktu dibuat |

## Desain UI/UX

- Palet warna: primary `#22C55E`, secondary `#1E3A8A`, background `#F8FAFC`, card `#FFFFFF`, warning `#F59E0B`, danger `#EF4444`, success `#10B981`.
- Layout: card ringkas, whitespace cukup, form pendek, filter chip horizontal, FAB untuk tambah stok.
- Tipografi: heading tebal, body sederhana, ukuran cukup besar untuk pengguna non-teknis.
- Navigasi: drawer navigation saat ini, dengan struktur screen yang siap dipindah ke bottom tabs jika dibutuhkan.

## Wireframe Tekstual

- Splash: logo WARUNG-STOCK, indikator loading.
- Onboarding: logo, ilustrasi ikon besar, judul slide, deskripsi singkat, tombol Lewati/Lanjut.
- Dashboard: header sapaan, search bar, 6 kartu ringkasan, rekomendasi tindakan, filter, daftar stok.
- Daftar Stok: card bahan berisi nama, kategori, jumlah, badge status, label exp.
- Tambah/Edit Stok: input nama, jumlah, satuan, kategori, minimum stok, exp, harga beli, catatan, tombol simpan.
- Detail Stok: info lengkap bahan, tombol edit/hapus, form transaksi masuk/keluar, riwayat terbaru.
- Riwayat: search, filter Semua/Masuk/Keluar, daftar transaksi dengan pill plus/minus.
- Statistik: kartu mingguan, grafik bar sederhana, ranking bahan paling sering keluar.
- Pengaturan: nama warung, reset data, tentang aplikasi.

## Komponen Reusable yang Disarankan

- `AuthHeader`: logo, judul, subtitle auth.
- `AuthTextInput`: input dengan ikon, label, dan error message.
- `PasswordInput`: input password dengan show/hide.
- `PrimaryButton`, `SecondaryButton`, `SocialDemoButton`: tombol auth konsisten.
- `AuthCard`: container putih form auth.
- `OnboardingSlide`: slide onboarding.
- `PinInput`: input PIN 4 digit.
- `BusinessTypeCard`: pilihan jenis usaha.
- `SummaryCard`: kartu angka ringkasan dashboard/statistik.
- `FilterChip`: chip pilihan kategori/status.
- `StockBadge`: badge status stok.
- `EmptyState`: tampilan data kosong.
- `AppHeader`: header dengan menu, judul, dan aksi.
- `InventoryForm`: form tambah/edit stok.

## Contoh Kode Awal React Native

```tsx
export default function SummaryCard({ label, value, icon, color }) {
  return (
    <View style={styles.card}>
      <Icon name={icon} size={20} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
```

## Contoh Kode SQLite Setup

```ts
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    minimum_stock REAL NOT NULL DEFAULT 0,
    expiry_date TEXT,
    purchase_price REAL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);
```

## Contoh Screen

- Dashboard: implementasi utama ada di `app/(app)/dashboard.tsx`.
- Daftar stok: daftar dan filter stok berada di dashboard agar pengguna langsung melihat kondisi stok.
- Tambah/Edit stok: implementasi ada di `app/(app)/add-item.tsx`.

## Rekomendasi Package

- `expo-sqlite`: database lokal.
- `expo-router`: routing berbasis folder.
- `@react-navigation/drawer` atau `@react-navigation/bottom-tabs`: navigasi utama.
- `@expo/vector-icons` atau `react-native-vector-icons`: ikon UI.
- `@react-native-async-storage/async-storage`: preferensi lokal non-sensitif.
- `expo-notifications`: pengembangan notifikasi stok rendah.

## Saran Pengembangan Lanjutan

- Pindahkan drawer ke bottom tabs agar sesuai kebutuhan navigasi mobile harian.
- Hubungkan login/register/forgot password ke backend agar reset password, verifikasi email, dan multi-device session benar-benar aman.
- Gunakan hashing password yang kuat di backend seperti Argon2/bcrypt; SQLite lokal saat ini hanya simulasi untuk kebutuhan project.
- Tambahkan rate limiting dan lockout untuk percobaan PIN/login berulang.
- Tambahkan export laporan ke PDF/CSV.
- Tambahkan scan barcode untuk toko grosir.
- Tambahkan multi-warung atau multi-gudang.
- Tambahkan backup cloud opsional.
- Tambahkan notifikasi terjadwal menggunakan `expo-notifications`.

## Menjalankan Project

```bash
npm install
npm run android
```
