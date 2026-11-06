/* Penghitung kunjungan (Abacus, layanan penghitung publik).
   Satu hitungan per sesi browser: kunjungan pertama dalam sesi memakai /hit/,
   muat ulang dalam sesi yang sama memakai /get/ agar angka tidak menggembung.
   Label ditulis utuh dari sini (satu sumber) dan elemen disembunyikan diam-diam
   bila layanan tidak terjangkau, supaya footer tidak pernah menampilkan angka kosong. */
(function () {
  'use strict';
  var NS = 'pengawal-energi-cbt';
  var KEY = 'kunjungan';
  var FLAG = 'pe_counted';

  function render(value) {
    var line = document.getElementById('visitorLine');
    var slot = document.getElementById('visitorCount');
    if (!line || !slot || typeof value !== 'number') return;
    slot.textContent = value.toLocaleString('id-ID') + ' kunjungan';
    line.hidden = false;
  }

  function load() {
    var counted = false;
    try { counted = !!sessionStorage.getItem(FLAG); } catch (e) { counted = false; }
    var url = 'https://abacus.jasoncameron.dev/' + (counted ? 'get' : 'hit') + '/' + NS + '/' + KEY;
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!counted) {
          try { sessionStorage.setItem(FLAG, '1'); } catch (e) { /* sesi tidak tersimpan, abaikan */ }
        }
        render(d && d.value);
      })
      .catch(function () { /* layanan turun: elemen tetap tersembunyi */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
