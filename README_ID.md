# 📱 Aplikasi Chat Real-time dengan Firebase

## 📖 Deskripsi Proyek
Ini adalah aplikasi chatting real-time berbasis web yang dibuat menggunakan **React.js** dan **Firebase**. Aplikasi ini memungkinkan pengguna untuk mengirim dan menerima pesan, melihat status online, serta memperbarui profil secara langsung.

## 👨‍💻 Anggota Kelompok (5 Orang)
- 👤 Anggota 1 – Pengembangan Frontend & Integrasi Firebase
- 👤 Anggota 2 – UI/UX dan Tampilan Responsif
- 👤 Anggota 3 – Otentikasi dan Aturan Firebase
- 👤 Anggota 4 – Status Online/Offline Pengguna
- 👤 Anggota 5 – Dokumentasi & Pengujian

## 🛠️ Teknologi yang Digunakan
- **React.js** – Untuk antarmuka pengguna
- **Firebase** – Otentikasi & Realtime Database
- **Tailwind CSS** – Untuk styling yang cepat dan responsif
- **React Router** – Navigasi halaman

## 📁 Struktur Folder
```
src/
├── components/
│   └── VideoCall.jsx
├── pages/
│   ├── home.jsx
│   ├── login.jsx
│   ├── register.jsx
│   └── chat.jsx
├── firebase.js
└── App.jsx
```

## 🔑 Fitur Utama
- Autentikasi Login dan Register
- Update profil (nama dan foto)
- Chatting real-time dengan pengguna lain
- Menampilkan status online dan terakhir dilihat
- Auto-scroll dan urutan chat berdasarkan pesan terakhir
- Tampilan yang mobile-friendly

## ▶️ Cara Menjalankan Proyek
1. Clone repositori:
```bash
git clone https://github.com/your-repo/chat-app.git
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` dan isi dengan konfigurasi Firebase Anda:
```env
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_DATABASE_URL=your_db_url
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDER_ID=your_msg_id
VITE_APP_ID=your_app_id
```

4. Jalankan aplikasi:
```bash
npm run dev
```

## 🔐 Aturan Firebase Realtime Database (Contoh)
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## ⚠️ Catatan Tambahan
- Pastikan Firebase dikonfigurasi dengan benar agar aplikasi berjalan optimal.
- Gunakan dua akun berbeda untuk mengetes fitur chat antar pengguna.