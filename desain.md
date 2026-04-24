
---

# 🎲 Design System: UKM PCC Sertijab 2026 
> **Theme:** Board Game Edition  
> **Vibe:** Flat, Tactile, and Bold.

---

## 🎨 Color Palette (The "Autumn Spice" Vibe)
Kombinasi warna ini ngasih kesan *warm*, eksklusif, dan *fun*. Mirip kartu-kartu *board game* premium atau papan permainan kayu yang dipoles modern.

| Color | Hex Code | Role | Persona |
| :--- | :--- | :--- | :--- |
| **Electric Orange** | `#FF6500` | **Primary** | Warna utama untuk Call-to-Action (CTA) & highlight. |
| **Soft Tangerine** | `#FE7A36` | **Secondary** | Untuk hover states atau elemen pendukung. |
| **Burnt Orange** | `#D65F02` | **Accent** | Memberikan kedalaman pada gradasi atau border. |
| **Rustic Brown** | `#993D00` | **Surface** | Cocok untuk card backgrounds atau section headers. |
| **Deep Cocoa** | `#602600` | **Overlay** | Untuk elemen yang butuh kontras tinggi. |
| **Dark Espresso** | `#331400` | **Background** | Warna dasar biar teks putih/orange makin "pop up". |

---

## 🖋️ Typography (The "Visual Hierarchy" Rule)
Kita mainin *mixing* antara font yang *playful* dan *clean* biar tetap enak dibaca tapi nggak ngebosenin.

### 1. **Bobby Jones** (Display Font)
* **Usage:** Main Headlines, Section Titles (H1, H2).
* **Vibe:** *Retro, organic, and loud.* Font ini yang bakal nge-carry identitas "Board Game"-nya. Kasih sedikit `text-shadow` biar makin mantap.

### 2. **Josefin Sans Bold** (Sub-Headline)
* **Usage:** Buttons, Navigation, Card Titles.
* **Vibe:** *Elegant yet strong.* Pas banget buat narik perhatian tanpa harus "teriak" kayak Bobby Jones.

### 3. **Poppins** (Body Text)
* **Usage:** Paragraphs, Form Labels, Input Text.
* **Vibe:** *Clean & Modern.* Standard emas buat UI/UX biar mata user nggak capek pas ngisi form.

---

## ✨ Visual Style & Finishing Touch
Sesuai *notes* di referensi: **"Style-nya flat, ada noise + texture."**

* **Flat UI 2.0**: Hindari gradasi warna yang terlalu halus (smooth). Gunakan blok warna yang solid dan *sharp edges* atau *rounded corners* yang konsisten (misal `rounded-2xl`).
* **Grainy Texture (The "Noise")**: Ini kuncinya! Tambahkan *overlay noise* tipis di atas background. 
    > **Pro Tip for Dev:** Kamu bisa pakai CSS filter `url(#noiseFilter)` atau pakai gambar PNG transparan yang isinya *noise* kecil-kecil biar websitenya nggak kelihatan "polos" banget kayak template standar.
* **Tactile Elements**: Kasih efek *shadow* yang tajam (bukan soft blur) buat tombol, biar kayak kepingan koin atau bidak catur yang bisa ditekan. Contoh: `box-shadow: 4px 4px 0px #331400;`.

---

## 🚀 Gen-Z Checklist
- [x] **No Boring Whites**: Pakai `#331400` sebagai pengganti hitam/putih biar lebih *premium*.
- [x] **High Contrast**: Perpaduan Oranye dan Cokelat Gelap itu *underrated* tapi *deadly combo*.
- [x] **Micro-interactions**: Pas hover tombol, kasih efek sedikit "tertekan" kebawah. *Satisfying* banget!

---

