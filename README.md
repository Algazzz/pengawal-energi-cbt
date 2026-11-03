# Latihan CBT Pengawal Energi 2026, Verifikator Lapangan

Situs belajar statis untuk persiapan CBT Pengawal Energi (Kementerian ESDM, BPH Migas, PEM Akamigas), posisi Verifikator Lapangan. Ujian CBT: Senin, 9 November 2026.

## Isi

- Materi per kisi-kisi resmi portal: Basic Science, Wawasan dan Pengetahuan Migas di Bidang Hilir, Tes Potensi Akademik
- Tautan bank soal eksternal dan referensi resmi per materi
- Modul komprehensif `materi-migas-hilir-lengkap.html` (19 bab, 17 referensi institusional, latihan hitung dan studi kasus; CSS terpisah `materi-migas-hilir.css`)
- Latihan CBT interaktif dari bank soal bawaan (`questions.js`, 360 soal: 155 dari paket belajar v1 sampai v5, 60 kolaborasi ChatGPT dan Gemini, 66 dari buku latihan TPA, 10 tambahan Wawasan Migas Hilir via GitHub, 50 dari Modul Latihan CBT PDF kiriman pemilik, 4 soal aljabar buku TPA yang dipulihkan dari fragmen, 15 soal paket v6 hasil riset Exa atas sumber resmi BPH Migas dan ESDM) dengan mode per materi, mode campuran, timer, tanda ragu, palet nomor, skor per materi, dan pembahasan
- Gambaran tahap setelah CBT: asesmen psikologi dan wawancara

- Modul tambahan `modul-verifikator.html` untuk studi kasus lapangan, XStar, uji petik, dan material balance

## Keputusan desain

- Warna navy kobalt: identitas dokumen resmi migas, dipakai sebagai warna struktur.
- Aksen amber: warna keselamatan di area SPBU, dipakai hemat untuk penanda fokus.
- Latar kertas pucat: halaman dibaca lama seperti dokumen belajar.
- Judul serif Georgia: nuansa berita acara, alat kerja verifikator.
- Isi sans sistem: terbaca cepat di HP tanpa font dari luar.
- Tanpa skrip sebaris: semua JavaScript di berkas eksternal (`app.js`, `questions.js`) agar aman terhadap Content Security Policy.

## Menjalankan lokal

Buka `index.html` lewat server statis apa pun, contoh: `python3 -m http.server` di folder ini.

Catatan: situs ini alat belajar pribadi, bukan situs resmi Kementerian ESDM, BPH Migas, atau PEM Akamigas. Soal bawaan adalah soal latihan buatan, bukan soal ujian asli.
