# Latihan CBT Pengawal Energi 2026, Verifikator Lapangan

Situs belajar statis untuk persiapan CBT Pengawal Energi (Kementerian ESDM, BPH Migas, PEM Akamigas), posisi Verifikator Lapangan. Ujian CBT: Senin, 9 November 2026.

## Isi

- Materi per kisi-kisi resmi portal: Basic Science, Wawasan dan Pengetahuan Migas di Bidang Hilir, Tes Potensi Akademik
- Tautan bank soal eksternal dan referensi resmi per materi
- Latihan CBT interaktif dari bank soal bawaan (`questions.js`, 155 soal dari paket belajar v1 sampai v5) dengan mode per materi, mode campuran, timer, tanda ragu, palet nomor, skor per materi, dan pembahasan
- Halaman kolaborasi AI: prompt siap salin untuk ChatGPT dan Gemini, plus impor soal berformat JSON ke bank soal browser (tersimpan di localStorage)
- Gambaran tahap setelah CBT: asesmen psikologi dan wawancara

## Keputusan desain

- Warna navy kobalt: identitas dokumen resmi migas, dipakai sebagai warna struktur.
- Aksen amber: warna keselamatan di area SPBU, dipakai hemat untuk penanda fokus.
- Latar kertas pucat: halaman dibaca lama seperti dokumen belajar.
- Judul serif Georgia: nuansa berita acara, alat kerja verifikator.
- Isi sans sistem: terbaca cepat di HP tanpa font dari luar.
- Tanpa skrip sebaris: semua JavaScript di berkas eksternal (`app.js`, `questions.js`) agar aman terhadap Content Security Policy.

## Menjalankan lokal

Buka `index.html` lewat server statis apa pun, contoh: `python3 -m http.server` di folder ini.

## Format impor soal

```json
[{"q":"teks soal","options":["A","B","C","D"],"answer":0,"cat":"TPA","explain":"penjelasan"}]
```

`answer` adalah indeks opsi benar mulai dari 0. `cat` salah satu dari: `Wawasan Migas Hilir`, `Basic Science`, `TPA`.

Catatan: situs ini alat belajar pribadi, bukan situs resmi Kementerian ESDM, BPH Migas, atau PEM Akamigas. Soal bawaan adalah soal latihan buatan, bukan soal ujian asli.
