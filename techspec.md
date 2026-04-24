---

# Technical Specification: UKM PCC Handover Registration System 2026

## 1. Project Overview
Sistem pendaftaran berbasis web untuk mendata kehadiran pengurus/anggota dalam acara Serah Terima Jabatan (Sertijab) UKM PCC 2026. Website ini menggantikan Google Form konvensional dengan tampilan yang lebih modern, responsif, dan terintegrasi.

## 2. Technical Stack (Recommended)
* **Frontend**: Next.js (App Router) atau React.
* **Styling**: Tailwind CSS & Flowbite (untuk komponen UI yang cepat dan responsif).
* **Backend/Database**: Supabase (PostgreSQL + Storage untuk bukti bayar) atau Laravel (sebagai API).
* **Deployment**: Vercel (Frontend) atau Hosting Kampus/VPS.

## 3. Functional Requirements
### 3.1 Multi-Step Form Logic
Sistem harus menangani logika kondisional berdasarkan pilihan kehadiran:
1.  **Step 1: Identitas Dasar**
    * Nama Lengkap (String)
    * NIM (String, Validation: format Polines)
    * Kelas (String)
    * Program Studi (Select Option)
    * No WhatsApp (String/Number)
    * Status Kehadiran (Boolean: Ya/Tidak)

2.  **Step 2 (Kondisional - Jika Hadir)**
    * Alergi Makanan (String)
    * Penyakit Bawaan (String)
    * Kepemilikan Kendaraan (Boolean)
    * Kesediaan Membawa Kendaraan (Boolean)
    * Metode Pembayaran (Radio: BNI, ShopeePay, Dana, BCA, SeaBank)
    * Upload Bukti Pembayaran (File: Image/PDF, max 2MB)

3.  **Step 3 (Kondisional - Jika Tidak Hadir)**
    * Alasan Tidak Hadir (Textarea)
    * Upload Bukti Perizinan (file pdf)

### 3.2 Responsive Design
* **Mobile-First Approach**: Karena pendaftaran kemungkinan besar diakses via WhatsApp (Mobile), UI harus optimal di layar kecil.
* **Components**: Menggunakan card-based layout agar tetap rapi di desktop maupun smartphone.

## 4. Database Schema (PostgreSQL)

| Table: `registrations` | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `full_name` | String | |
| `nim` | String | Unique Index |
| `class` | String | |
| `study_program` | String | |
| `whatsapp` | String | |
| `is_present` | Boolean | |
| `food_allergy` | String | Nullable |
| `illness_history` | String | Nullable |
| `has_vehicle` | Boolean | Nullable |
| `ready_to_drive` | Boolean | Nullable |
| `payment_method` | String | Nullable |
| `payment_proof_url`| String | URL ke Cloud Storage |
| `absence_reason` | Text | Nullable |
| `created_at` | Timestamp | |

## 5. System Workflow
1.  **User Input**: User mengisi data identitas.
2.  **Logic Switch**: Jika user memilih "Tidak Hadir", field pembayaran dan kendaraan di-hidden (atau di-skip).
3.  **File Upload**: Bukti pembayaran diunggah ke Storage (S3/Supabase Storage) dan sistem menyimpan URL-nya ke DB.
4.  **Confirmation**: Setelah submit, user mendapat notifikasi "Berhasil" (bisa diintegrasikan dengan redirect ke WhatsApp Admin/Panitia).

## 6. Security & Validation
* **Client-side Validation**: Memastikan NIM sesuai format dan file yang diunggah tidak terlalu besar.
* **Server-side Validation**: Mencegah duplikasi pendaftaran berdasarkan NIM.
* **CORS**: Membatasi akses API hanya dari domain website resmi.

7. Admin Features (Back-Office)
7.1 Dashboard Overview
Statistik Cepat: Menampilkan total pendaftar, jumlah yang hadir vs tidak hadir, dan total dana yang terkumpul berdasarkan bukti bayar yang masuk.

Real-time Notification: Notifikasi sederhana (bisa via integrasi bot Telegram/WhatsApp) setiap ada pendaftar baru yang submit.

7.2 Data Management
Tabel Pendaftar: Menampilkan semua kolom data (Nama, NIM, Kelas, dll) dengan fitur Search dan Filter (misal: filter berdasarkan status pembayaran atau prodi).

Verifikasi Pembayaran: Admin memiliki tombol untuk menandai apakah bukti transfer valid atau perlu dikonfirmasi ulang.

Detail View: Modal atau halaman khusus untuk melihat foto bukti pembayaran secara full-screen agar mudah dicek.

7.3 Export & Reporting
Export to Excel/CSV: Fitur wajib untuk rekap data akhir yang akan diserahkan ke bendahara atau ketua panitia.

Print Presence List: Format khusus yang siap cetak untuk absensi fisik di lokasi (H-Day).

8. Admin Security
Role-Based Access Control (RBAC): Pastikan halaman admin tidak bisa diakses publik.

Gunakan middleware untuk proteksi route /admin.

Login menggunakan akun fungsionaris yang sudah terdaftar.

Secure Storage: Link bukti pembayaran tidak boleh bisa ditebak (gunakan UUID atau private storage).
---