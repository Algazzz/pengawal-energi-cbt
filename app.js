(function () {
  'use strict';

  var HISTORY_KEY = 'pe_quiz_history';

  function bank() {
    var base = (typeof QUESTIONS !== 'undefined' && Array.isArray(QUESTIONS)) ? QUESTIONS : [];
    var extra = (typeof EXTRA_QUESTIONS !== 'undefined' && Array.isArray(EXTRA_QUESTIONS)) ? EXTRA_QUESTIONS : [];
    return base.concat(extra);
  }

  var FOKUS_RE = /JBT|JBKP|Solar|Pertalite|Biosolar|penyalur|SPBU|Surkom|XStar|uji petik|material balance|kuota/i;
  function isFokus(q) {
    return q.cat === 'Wawasan Migas Hilir' && FOKUS_RE.test(q.q + ' ' + (q.explain || ''));
  }
  var MODE_LABEL = { 'fokus-distribusi': 'Fokus Distribusi JBT dan JBKP' };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function $(id) { return document.getElementById(id); }

  /* ---------- Header counts ---------- */
  function refreshCounts() {
    var b = bank();
    var total = $('countTotal'); if (total) total.textContent = String(b.length);
    var info = $('bankInfo'); if (info) info.textContent = b.length + ' soal';
    var fk = $('fokusCount'); if (fk) fk.textContent = b.filter(isFokus).length + ' soal';
    var nodes = document.querySelectorAll('[data-count-cat]');
    nodes.forEach(function (el) {
      var cat = el.getAttribute('data-count-cat');
      var n = b.filter(function (q) { return q.cat === cat; }).length;
      el.textContent = n + ' soal latihan';
    });
  }

  /* ---------- Countdown ---------- */
  function tickCountdown() {
    var el = $('countdown'); if (!el) return;
    var target = new Date('2026-11-09T07:00:00+07:00').getTime();
    var diff = target - Date.now();
    if (diff <= 0) { el.textContent = 'hari ujian tiba'; return; }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    el.textContent = days + ' hari ' + hours + ' jam lagi';
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('menuBtn'), mainNav = $('mainNav');
  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mainNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Quiz state ---------- */
  var quiz = null;
  var timerId = null;

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startQuiz(mode, jumlah, useTimer) {
    if (typeof QUESTIONS === 'undefined' || !Array.isArray(QUESTIONS) || QUESTIONS.length === 0) {
      window.alert('Bank soal utama gagal dimuat, jadi latihan tidak dimulai agar jumlah soal tidak menyusut. Muat ulang halaman ini (Ctrl+Shift+R) lalu coba lagi.');
      return;
    }
    var b = bank();
    var pool = mode === 'campuran' ? b.slice() : mode === 'fokus-distribusi' ? b.filter(isFokus) : b.filter(function (q) { return q.cat === mode; });
    pool = shuffle(pool);
    if (jumlah !== 'semua') pool = pool.slice(0, parseInt(jumlah, 10));
    pool = pool.map(function (q) {
      var order = shuffle(q.options.map(function (_, i) { return i; }));
      return {
        q: q.q,
        cat: q.cat,
        explain: q.explain || '',
        src: q.src || '',
        options: order.map(function (i) { return q.options[i]; }),
        answer: order.indexOf(q.answer)
      };
    });
    quiz = {
      mode: mode,
      items: pool,
      answers: pool.map(function () { return null; }),
      flags: pool.map(function () { return false; }),
      idx: 0,
      secondsLeft: useTimer ? pool.length * 60 : null,
      confirmSubmit: false
    };
    $('quizSetup').hidden = true;
    $('quizResult').hidden = true;
    $('quizRun').hidden = false;
    $('quizWarn').hidden = true;
    stopTimer();
    if (useTimer) {
      timerId = setInterval(function () {
        quiz.secondsLeft -= 1;
        renderTimer();
        if (quiz.secondsLeft <= 0) { stopTimer(); finishQuiz(); }
      }, 1000);
    }
    renderTimer();
    renderQuestion();
    $('quizRun').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderTimer() {
    var el = $('quizTimer');
    if (!quiz || quiz.secondsLeft === null) { el.textContent = 'Tanpa timer'; el.classList.remove('timer-low'); return; }
    el.textContent = 'Sisa waktu: ' + fmtTime(Math.max(0, quiz.secondsLeft));
    el.classList.toggle('timer-low', quiz.secondsLeft <= 60);
  }

  function renderQuestion() {
    var item = quiz.items[quiz.idx];
    var total = quiz.items.length;
    $('quizProgress').textContent = 'Soal ' + (quiz.idx + 1) + ' dari ' + total;
    $('progressFill').style.width = ((quiz.idx + 1) / total * 100) + '%';
    $('quizCat').textContent = item.cat;
    $('quizQ').textContent = item.q;
    var box = $('quizOpts');
    box.innerHTML = '';
    item.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt-btn' + (quiz.answers[quiz.idx] === i ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', quiz.answers[quiz.idx] === i ? 'true' : 'false');
      var letter = document.createElement('span');
      letter.className = 'opt-letter';
      letter.textContent = 'ABCDE'[i] + '.';
      btn.appendChild(letter);
      btn.appendChild(document.createTextNode(opt));
      btn.addEventListener('click', function () {
        quiz.answers[quiz.idx] = i;
        quiz.confirmSubmit = false;
        $('quizWarn').hidden = true;
        renderQuestion();
      });
      box.appendChild(btn);
    });
    $('btnPrev').disabled = quiz.idx === 0;
    $('btnNext').disabled = quiz.idx === total - 1;
    var flagBtn = $('btnFlag');
    flagBtn.setAttribute('aria-pressed', quiz.flags[quiz.idx] ? 'true' : 'false');
    flagBtn.textContent = quiz.flags[quiz.idx] ? 'Tanda ragu aktif' : 'Tandai ragu-ragu';
    renderPalette();
  }

  function renderPalette() {
    var pal = $('quizPalette');
    pal.innerHTML = '';
    quiz.items.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pal-btn' +
        (quiz.answers[i] !== null ? ' answered' : '') +
        (quiz.flags[i] ? ' flagged' : '') +
        (i === quiz.idx ? ' current' : '');
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', 'Ke soal nomor ' + (i + 1));
      b.addEventListener('click', function () { quiz.idx = i; renderQuestion(); });
      pal.appendChild(b);
    });
  }

  function finishQuiz() {
    stopTimer();
    var correct = 0;
    var perCat = {};
    quiz.items.forEach(function (item, i) {
      if (!perCat[item.cat]) perCat[item.cat] = { benar: 0, total: 0 };
      perCat[item.cat].total += 1;
      if (quiz.answers[i] === item.answer) { correct += 1; perCat[item.cat].benar += 1; }
    });
    var total = quiz.items.length;
    var pct = total ? Math.round(correct / total * 100) : 0;
    $('resultScore').textContent = correct + ' dari ' + total + ' benar (' + pct + ' persen)';
    var bd = $('resultBreakdown');
    bd.innerHTML = '';
    var table = document.createElement('table');
    table.className = 'breakdown-table';
    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Materi</th><th>Benar</th><th>Total</th></tr>';
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    Object.keys(perCat).forEach(function (cat) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td'); td1.textContent = cat;
      var td2 = document.createElement('td'); td2.textContent = String(perCat[cat].benar);
      var td3 = document.createElement('td'); td3.textContent = String(perCat[cat].total);
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    bd.appendChild(table);
    var weak = Object.keys(perCat).filter(function (c) { return perCat[c].benar / perCat[c].total < 0.7; });
    if (weak.length) {
      var p = document.createElement('p');
      p.textContent = 'Materi yang perlu diulang dulu: ' + weak.join(', ') + '. Buka lagi ringkasannya di bagian Materi, lalu ulangi mode per materi.';
      bd.appendChild(p);
    }
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
      var h = hist[quiz.mode] || { best: 0, attempts: 0 };
      h.attempts += 1;
      h.best = Math.max(h.best, pct);
      h.last = pct;
      hist[quiz.mode] = h;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (e) { /* penyimpanan tidak tersedia */ }
    buildReview();
    $('quizRun').hidden = true;
    $('quizResult').hidden = false;
    $('reviewList').hidden = true;
    $('btnReviewToggle').setAttribute('aria-expanded', 'false');
    $('quizResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildReview() {
    var list = $('reviewList');
    list.innerHTML = '';
    quiz.items.forEach(function (item, i) {
      var div = document.createElement('div');
      div.className = 'review-item';
      var rq = document.createElement('p');
      rq.className = 'rq';
      rq.textContent = (i + 1) + '. [' + item.cat + '] ' + item.q;
      div.appendChild(rq);
      var yours = document.createElement('p');
      var ya = quiz.answers[i];
      yours.textContent = 'Jawabanmu: ' + (ya === null ? 'tidak dijawab' : 'ABCDE'[ya] + '. ' + item.options[ya]);
      yours.className = ya === item.answer ? 'ans-ok' : 'ans-bad';
      div.appendChild(yours);
      var key = document.createElement('p');
      key.textContent = 'Kunci: ' + 'ABCDE'[item.answer] + '. ' + item.options[item.answer];
      key.className = 'ans-ok';
      div.appendChild(key);
      if (item.explain) {
        var ex = document.createElement('p');
        ex.className = 'review-explain';
        ex.textContent = 'Pembahasan: ' + item.explain;
        div.appendChild(ex);
      }
      list.appendChild(div);
    });
  }

  /* ---------- Quiz wiring ---------- */
  var setupForm = $('setupForm');
  if (setupForm) {
    setupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var mode = setupForm.querySelector('input[name="mode"]:checked').value;
      var jumlah = setupForm.querySelector('input[name="jumlah"]:checked').value;
      startQuiz(mode, jumlah, $('useTimer').checked);
    });
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
      var parts = [];
      Object.keys(hist).forEach(function (m) {
        parts.push((MODE_LABEL[m] || m) + ': skor terbaik ' + hist[m].best + ' persen dari ' + hist[m].attempts + ' kali latihan');
      });
      if (parts.length) {
        var note = $('historyNote');
        note.hidden = false;
        note.textContent = 'Riwayat di perangkat ini. ' + parts.join('. ') + '.';
      }
    } catch (e) { /* abaikan */ }
  }
  $('btnPrev').addEventListener('click', function () { if (quiz && quiz.idx > 0) { quiz.idx -= 1; renderQuestion(); } });
  $('btnNext').addEventListener('click', function () { if (quiz && quiz.idx < quiz.items.length - 1) { quiz.idx += 1; renderQuestion(); } });
  $('btnFlag').addEventListener('click', function () {
    if (!quiz) return;
    quiz.flags[quiz.idx] = !quiz.flags[quiz.idx];
    renderQuestion();
  });
  $('btnSubmit').addEventListener('click', function () {
    if (!quiz) return;
    var unanswered = quiz.answers.filter(function (a) { return a === null; }).length;
    if (unanswered > 0 && !quiz.confirmSubmit) {
      quiz.confirmSubmit = true;
      var warn = $('quizWarn');
      warn.hidden = false;
      warn.textContent = 'Masih ada ' + unanswered + ' soal belum dijawab. Klik Kumpulkan sekali lagi bila tetap ingin mengakhiri latihan.';
      return;
    }
    finishQuiz();
  });
  $('btnRetry').addEventListener('click', function () {
    $('quizResult').hidden = true;
    $('quizSetup').hidden = false;
    $('quizSetup').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('btnReviewToggle').addEventListener('click', function () {
    var list = $('reviewList');
    var show = list.hidden;
    list.hidden = !show;
    this.setAttribute('aria-expanded', show ? 'true' : 'false');
    this.textContent = show ? 'Sembunyikan pembahasan' : 'Lihat pembahasan';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  refreshCounts();
  tickCountdown();
  setInterval(tickCountdown, 3600000);
})();
