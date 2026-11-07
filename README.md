# Latihan CBT Pengawal Energi 2026, Verifikator Lapangan

Situs belajar statis untuk persiapan CBT Pengawal Energi (Kementerian ESDM, BPH Migas, PEM Akamigas), posisi Verifikator Lapangan. Ujian CBT: November 2026.

## Isi

- Materi per kisi-kisi resmi portal: Basic Science, Wawasan dan Pengetahuan Migas di Bidang Hilir, Tes Potensi Akademik
- Tautan bank soal eksternal dan referensi resmi per materi
- Modul komprehensif `materi-migas-hilir-lengkap.html` (19 bab, 17 referensi institusional, latihan hitung dan studi kasus; CSS terpisah `materi-migas-hilir.css`)
- Latihan CBT interaktif dari bank soal bawaan (`questions.js`, 1.088 soal: 155 dari paket belajar v1 sampai v5, 60 kolaborasi ChatGPT dan Gemini, 67 dari buku latihan TPA, 10 tambahan Wawasan Migas Hilir via GitHub, 50 dari Modul Latihan CBT PDF kiriman pemilik, 4 soal aljabar buku TPA yang dipulihkan dari fragmen, 15 soal paket v6 hasil riset Exa atas sumber resmi BPH Migas dan ESDM, 69 dari dokumen Kisi-Kisi Soal Tes CBT Pengawal Energi ESDM PDF kiriman pemilik 4 Nov 2026 setelah pemeriksaan mutu kunci, 235 dari dokumen kisi-kisi Prepkerja PDF kiriman pemilik 4 Nov 2026 (12 set soal terbaca bersih dari layout dua kolom; set spasial bergambar tidak diimpor), 40 soal hasil riset Exa atas sumber resmi, 14 soal bergambar, dan 245 soal dari dua referensi baru 6 Nov 2026 (paket simulasi kisi-kisi assessment dan paket latihan kedua; hanya soal baru setelah dedupe terhadap bank lama), dan 94 soal dari e-book latihan DOCX kiriman 6 Nov 2026 (kunci terverifikasi 100 persen terhadap tabel kunci di dokumennya; hanya soal baru setelah dedupe) dengan mode per materi, mode campuran, timer, tanda ragu, palet nomor, skor per materi, dan pembahasan
- Gambaran tahap setelah CBT: asesmen psikologi dan wawancara
- Peta sub-topik kisi-kisi dan rumus kunci dari Modul Bedah Kisi-Kisi (PDF kiriman pemilik): blok rumus fluida/termal/BBM di kartu Basic Science, peta sub-topik di ketiga kartu materi, fakta 25.014 peserta lolos administrasi

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
