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
  var MODE_LABEL = { 'fokus-distribusi': 'Fokus Distribusi JBT dan JBKP', 'simulasi-teknis': 'Simulasi Ujian Teknis', 'simulasi-tpa': 'Simulasi Ujian TPA' };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function $(id) { return document.getElementById(id); }
  function mathText(element, content) {
    if (window.PEMath) window.PEMath.setText(element, content);
    else element.textContent = content;
  }

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
    var target = new Date('2026-11-09T09:45:00+07:00').getTime();
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
        img: q.img || '',
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
    sim = null; simChainResult = null; stopSimTimer(); resetQuizChrome();
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
    mathText($('quizQ'), item.q);
    var fig = $('quizFig');
    if (fig) {
      if (item.img) { $('quizImg').src = item.img; fig.hidden = false; }
      else { fig.hidden = true; $('quizImg').removeAttribute('src'); }
    }
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
      var optText = document.createElement('span');
      optText.className = 'opt-text';
      mathText(optText, opt);
      btn.appendChild(optText);
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
      mathText(rq, (i + 1) + '. [' + item.cat + '] ' + item.q);
      div.appendChild(rq);
      if (item.img) {
        var rf = document.createElement('figure');
        rf.className = 'quiz-figure';
        var ph = document.createElement('div');
        ph.className = 'ph';
        var ri = document.createElement('img');
        ri.src = item.img;
        ri.alt = 'Gambar pendukung soal';
        ri.loading = 'lazy';
        ph.appendChild(ri);
        rf.appendChild(ph);
        div.appendChild(rf);
      }
      var yours = document.createElement('p');
      var ya = quiz.answers[i];
      mathText(yours, 'Jawabanmu: ' + (ya === null ? 'tidak dijawab' : 'ABCDE'[ya] + '. ' + item.options[ya]));
      yours.className = ya === item.answer ? 'ans-ok' : 'ans-bad';
      div.appendChild(yours);
      var key = document.createElement('p');
      mathText(key, 'Kunci: ' + 'ABCDE'[item.answer] + '. ' + item.options[item.answer]);
      key.className = 'ans-ok';
      div.appendChild(key);
      if (item.explain) {
        var ex = document.createElement('p');
        ex.className = 'review-explain';
        mathText(ex, 'Pembahasan: ' + item.explain);
        div.appendChild(ex);
      }
      list.appendChild(div);
    });
  }


  /* ---------- Mode simulasi ujian asli: satu arah, timer per soal, auto-skip ---------- */
  var sim = null;
  var simTimerId = null;
  var simChainResult = null;

  function stopSimTimer() { if (simTimerId) { clearInterval(simTimerId); simTimerId = null; } }

  function resetQuizChrome() {
    var pal = $('quizPalette'); if (pal) { pal.hidden = false; pal.style.display = ''; }
    $('btnPrev').hidden = false; $('btnPrev').style.display = '';
    $('btnFlag').hidden = false; $('btnFlag').style.display = '';
    $('btnNext').textContent = 'Berikutnya';
    $('btnSubmit').textContent = 'Kumpulkan';
    var nx = $('btnSimNext'); if (nx) { nx.hidden = true; nx.style.display = 'none'; }
  }

  function startSim(kind, chained) {
    if (typeof QUESTIONS === 'undefined' || !Array.isArray(QUESTIONS) || QUESTIONS.length === 0) {
      window.alert('Bank soal utama gagal dimuat, jadi simulasi tidak dimulai. Muat ulang halaman ini (Ctrl+Shift+R) lalu coba lagi.');
      return;
    }
    var b = bank();
    var pool = kind === 'teknis'
      ? shuffle(b.filter(function (q) { return q.cat === 'Wawasan Migas Hilir' || q.cat === 'Basic Science'; })).slice(0, 90)
      : shuffle(b.filter(function (q) { return q.cat === 'TPA'; })).slice(0, 60);
    var items = pool.map(function (q) {
      var order = shuffle(q.options.map(function (_, i) { return i; }));
      return {
        q: q.q, img: q.img || '', cat: q.cat, explain: q.explain || '', src: q.src || '',
        options: order.map(function (i) { return q.options[i]; }),
        answer: order.indexOf(q.answer)
      };
    });
    stopTimer(); stopSimTimer();
    var perQ = kind === 'teknis' ? 40 : 30;
    var totalSec = kind === 'teknis' ? 3600 : 1800;
    var now = Date.now();
    sim = {
      kind: kind, items: items,
      answers: items.map(function () { return null; }),
      idx: 0, perQ: perQ,
      qEnd: now + perQ * 1000, end: now + totalSec * 1000,
      chained: !!chained, confirmEnd: false, locked: false
    };
    quiz = {
      mode: kind === 'teknis' ? 'simulasi-teknis' : 'simulasi-tpa',
      items: items, answers: sim.answers,
      flags: items.map(function () { return false; }),
      idx: 0, secondsLeft: null, confirmSubmit: false
    };
    $('quizSetup').hidden = true;
    $('quizResult').hidden = true;
    $('quizRun').hidden = false;
    $('quizWarn').hidden = true;
    $('quizPalette').hidden = true; $('quizPalette').style.display = 'none';
    $('btnPrev').hidden = true; $('btnPrev').style.display = 'none';
    $('btnFlag').hidden = true; $('btnFlag').style.display = 'none';
    $('btnNext').textContent = 'Lewati soal';
    $('btnSubmit').textContent = 'Akhiri paket';
    var nx = $('btnSimNext'); if (nx) { nx.hidden = true; nx.style.display = 'none'; }
    simTimerId = setInterval(simTick, 250);
    renderSimTimer();
    renderSimQuestion();
    $('quizRun').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSimTimer() {
    var el = $('quizTimer');
    if (!sim) return;
    var now = Date.now();
    var qLeft = Math.max(0, Math.ceil((sim.qEnd - now) / 1000));
    var totalLeft = Math.max(0, Math.ceil((sim.end - now) / 1000));
    el.textContent = 'Sisa paket: ' + fmtTime(totalLeft) + ' · Soal ini: ' + qLeft + ' detik';
    el.classList.toggle('timer-low', qLeft <= 10);
  }

  function renderSimQuestion() {
    var item = sim.items[sim.idx];
    var total = sim.items.length;
    $('quizProgress').textContent = (sim.kind === 'teknis' ? 'Ujian Teknis' : 'Ujian TPA') + ' · Soal ' + (sim.idx + 1) + ' dari ' + total;
    $('progressFill').style.width = ((sim.idx + 1) / total * 100) + '%';
    $('quizCat').textContent = item.cat;
    mathText($('quizQ'), item.q);
    var fig = $('quizFig');
    if (fig) {
      if (item.img) { $('quizImg').src = item.img; fig.hidden = false; }
      else { fig.hidden = true; $('quizImg').removeAttribute('src'); }
    }
    var box = $('quizOpts');
    box.innerHTML = '';
    item.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      var letter = document.createElement('span');
      letter.className = 'opt-letter';
      letter.textContent = 'ABCDE'[i] + '.';
      btn.appendChild(letter);
      var optText = document.createElement('span');
      optText.className = 'opt-text';
      mathText(optText, opt);
      btn.appendChild(optText);
      btn.addEventListener('click', function () {
        if (!sim || sim.locked) return;
        sim.locked = true;
        sim.answers[sim.idx] = i;
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        setTimeout(function () { simAdvance(); }, 350);
      });
      box.appendChild(btn);
    });
  }

  function simAdvance() {
    if (!sim) return;
    sim.locked = false;
    sim.confirmEnd = false;
    $('quizWarn').hidden = true;
    sim.idx += 1;
    if (sim.idx >= sim.items.length) { finishSim(); return; }
    sim.qEnd = Date.now() + sim.perQ * 1000;
    renderSimTimer();
    renderSimQuestion();
  }

  function simTick() {
    if (!sim) { stopSimTimer(); return; }
    var now = Date.now();
    if (now >= sim.end) { finishSim(); return; }
    if (now >= sim.qEnd) { simAdvance(); return; }
    renderSimTimer();
  }

  function finishSim() {
    if (!sim) return;
    var kind = sim.kind;
    var chained = sim.chained;
    var items = sim.items, answers = sim.answers;
    stopSimTimer();
    var correct = 0;
    items.forEach(function (item, i) { if (answers[i] === item.answer) correct += 1; });
    var pct = items.length ? Math.round(correct / items.length * 100) : 0;
    if (kind === 'teknis') simChainResult = { benar: correct, total: items.length, pct: pct };
    sim = null;
    finishQuiz();
    var bd = $('resultBreakdown');
    if (kind === 'teknis' && chained) {
      var p = document.createElement('p');
      p.textContent = 'Paket Ujian Teknis selesai. Pada hari ujian, jeda menuju Ujian TPA hanya 5 menit (pukul 10.45 ke 10.50 WIB). Klik tombol Lanjut ke Ujian TPA untuk menyelesaikan simulasi penuh.';
      bd.appendChild(p);
      var nx = $('btnSimNext'); if (nx) { nx.hidden = false; nx.style.display = ''; }
    } else if (kind === 'tpa' && simChainResult) {
      var p2 = document.createElement('p');
      p2.textContent = 'Simulasi penuh selesai. Ujian Teknis: ' + simChainResult.benar + ' dari ' + simChainResult.total + ' benar (' + simChainResult.pct + ' persen). Ujian TPA: ' + correct + ' dari ' + items.length + ' benar (' + pct + ' persen).';
      bd.appendChild(p2);
      simChainResult = null;
    }
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
  $('btnNext').addEventListener('click', function () { if (sim) { simAdvance(); return; } if (quiz && quiz.idx < quiz.items.length - 1) { quiz.idx += 1; renderQuestion(); } });
  $('btnFlag').addEventListener('click', function () {
    if (!quiz) return;
    quiz.flags[quiz.idx] = !quiz.flags[quiz.idx];
    renderQuestion();
  });
  $('btnSubmit').addEventListener('click', function () {
    if (sim) {
      if (!sim.confirmEnd) {
        sim.confirmEnd = true;
        var w = $('quizWarn');
        w.hidden = false;
        w.textContent = 'Akhiri paket simulasi sekarang? Soal yang belum terlewati akan tercatat kosong. Klik Akhiri paket sekali lagi untuk selesai.';
        return;
      }
      finishSim();
      return;
    }
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
    sim = null; simChainResult = null; stopSimTimer(); resetQuizChrome();
    $('quizResult').hidden = true;
    $('quizSetup').hidden = false;
    $('quizSetup').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var bT = $('btnSimTeknis'); if (bT) bT.addEventListener('click', function () { startSim('teknis', false); });
  var bP = $('btnSimTPA'); if (bP) bP.addEventListener('click', function () { startSim('tpa', false); });
  var bF = $('btnSimFull'); if (bF) bF.addEventListener('click', function () { startSim('teknis', true); });
  var bN = $('btnSimNext'); if (bN) bN.addEventListener('click', function () { startSim('tpa', true); });
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
