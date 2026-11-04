/* Notasi matematika untuk seluruh materi, soal, opsi, dan pembahasan.
   Menggunakan KaTeX jika tersedia; jika CDN tidak tersedia, teks asli tetap terbaca. */
(function () {
  'use strict';

  function texNumbers(text) {
    return text.replace(/(\d),(\d)/g, '$1{,}$2');
  }

  function toTex(raw) {
    var t = raw.replace(/\u00a0/g, ' ').trim();
    // Pangkat, indeks, dan satuan diproses sebelum operator aritmetika.
    t = t.replace(/([A-Za-zρπΔβ]|\d+)([²³])/g, function (_, base, power) {
      return base + '^{' + (power === '²' ? '2' : '3') + '}';
    });
    t = t.replace(/(kg)\s*\/\s*m\^\{3\}/gi, '\\mathrm{kg}/\\mathrm{m}^{3}');
    t = t.replace(/\bm\^\{3\}/g, '\\mathrm{m}^{3}').replace(/\bm\^\{2\}/g, '\\mathrm{m}^{2}');
    t = t.replace(/\bL\s*\/\s*menit\b/gi, '\\mathrm{L}/\\mathrm{menit}');
    t = t.replace(/\bL\s*\/\s*detik\b/gi, '\\mathrm{L}/\\mathrm{detik}');
    t = t.replace(/(^|[^\\{])\bkg\b/g, '$1\\mathrm{kg}').replace(/\bkPa\b/g, '\\mathrm{kPa}');
     t = t.replace(/\bliter\b/gi, '\\mathrm{liter}').replace(/\bbar\b/gi, '\\mathrm{bar}');
    t = t.replace(/\bkm\s*\/\s*jam\b/g, '\\mathrm{km/jam}');
    t = t.replace(/\bm\s*\/\s*s\b/g, '\\mathrm{m/s}');
    t = t.replace(/\bkWh\b/g, '\\mathrm{kWh}').replace(/\bkW\b/g, '\\mathrm{kW}');
    t = t.replace(/(^|[^\\{])\bL\b/g, '$1\\mathrm{L}');
    t = t.replace(/°C/g, '{}^{\\circ}\\mathrm{C}').replace(/°F/g, '{}^{\\circ}\\mathrm{F}');
    t = t.replace(/°API/g, '{}^{\\circ}\\mathrm{API}');
    t = t.replace(/½/g, '\\tfrac{1}{2}');
    t = t.replace(/π/g, '\\pi ').replace(/ρ/g, '\\rho ').replace(/Δ/g, '\\Delta ').replace(/β/g, '\\beta ');
    t = t.replace(/([0-9]+(?:[.,][0-9]+)*)\s*\/\s*([0-9]+(?:[.,][0-9]+)*)(?!\w)/g, '\\frac{$1}{$2}');
    t = t.replace(/\b([QVPIρmFAt])\s*\/\s*([A-Za-z])\b/g, '\\frac{$1}{$2}');
    t = t.replace(/×/g, '\\times ').replace(/÷/g, '\\div ').replace(/·/g, '\\cdot ');
    t = t.replace(/[−–]/g, '-').replace(/≈/g, '\\approx ').replace(/→/g, '\\rightarrow ');
    t = t.replace(/%/g, '\\%');
    return texNumbers(t);
  }

  var specials = [
    [/1\s*m³\s*=\s*1\.000\s*liter/gi, '1\\,\\mathrm{m}^{3}=1.000\\,\\mathrm{liter}'],
    [/\b\d+(?:[.,]\d+)?\s*bar\s*=\s*\d+(?:[.,]\d+)?\s*kPa\b/gi, function (v) { return toTex(v); }],
    [/\bSG\s*=\s*141,5\s*\/\s*\(°API\s*\+\s*131,5\)/g, '\\mathrm{SG}=\\dfrac{141{,}5}{{}^{\\circ}\\mathrm{API}+131{,}5}'],
    [/°API\s*=\s*\(?141,5\s*\/\s*SG\)?\s*−\s*131,5/g, '{}^{\\circ}\\mathrm{API}=\\dfrac{141{,}5}{\\mathrm{SG}}-131{,}5'],
    [/\bA1v1\s*=\s*A2v2/g, 'A_1v_1=A_2v_2'],
    [/\bI\s*=\s*V\s*\/\s*R/g, 'I=\\dfrac{V}{R}'],
    [/\bQ\s*=\s*A1v1\s*=\s*A2v2/g, 'Q=A_1v_1=A_2v_2'],
    [/\b(?:CnH2n\\+2|CnH2n\+2)\b/g, '\\mathrm{C}_n\\mathrm{H}_{2n+2}'],
    [/Volume balok\s*=\s*p\s*×\s*l\s*×\s*t/gi, 'V_{\\mathrm{balok}}=p\\times l\\times t'],
    [/Volume tabung\s*=\s*πr²h/gi, 'V_{\\mathrm{tabung}}=\\pi r^{2}h'],
    [/\bQ\s*=\s*V\s*\/\s*t\b/g, 'Q=\\dfrac{V}{t}'],
    [/ρ\s*=\s*m\s*\/\s*V\b/g, '\\rho=\\dfrac{m}{V}'],
    [/\bP\s*=\s*F\s*\/\s*A\b/g, 'P=\\dfrac{F}{A}'],
    [/\bV\s*=\s*IR\b/g, 'V=IR'],
    [/\bP\s*=\s*VI\b/g, 'P=VI'],
    [/\|hasil ukur\s*−\s*acuan\|\s*\/\s*acuan\s*×\s*100%/gi, '\\dfrac{|\\text{hasil ukur}-\\text{acuan}|}{\\text{acuan}}\\times100\\%'],
    [/\|ukur\s*−\s*acuan\|\s*\/\s*acuan\s*×\s*100%/gi, '\\dfrac{|\\text{ukur}-\\text{acuan}|}{\\text{acuan}}\\times100\\%'],
    [/stok akhir teoritis\s*=\s*stok awal\s*\+\s*penerimaan\s*−\s*penyaluran(?:\s*±\s*penyesuaian yang terdokumentasi)?/gi,
      '\\text{Stok akhir teoritis}=\\text{stok awal}+\\text{penerimaan}-\\text{penyaluran}'],
    [/selisih stok\s*=\s*stok akhir terukur\s*−\s*stok akhir teoritis/gi,
      '\\text{Selisih stok}=\\text{stok akhir terukur}-\\text{stok akhir teoritis}'],
    [/selisih\s*=\s*stok akhir terukur\s*−\s*stok akhir teoritis/gi,
      '\\text{Selisih}=\\text{stok akhir terukur}-\\text{stok akhir teoritis}'],
    [/Q\s*=\s*volume\s*\/\s*waktu/gi, 'Q=\\dfrac{\\text{volume}}{\\text{waktu}}'],
    [/ρ\s*=\s*massa\s*\/\s*volume/gi, '\\rho=\\dfrac{\\text{massa}}{\\text{volume}}'],
    [/deviasi\s*\(%\)\s*=\s*\|ukur\s*−\s*acuan\|\s*\/\s*acuan\s*×\s*100%/gi,
      '\\text{Deviasi }(\\%)=\\dfrac{|\\text{ukur}-\\text{acuan}|}{\\text{acuan}}\\times100\\%'],
    [/\bP2\s*=\s*P1\s*\+\s*½ρ\(v1²\s*−\s*v2²\)/g,
      'P_2=P_1+\\frac{1}{2}\\rho(v_1^2-v_2^2)'],
    [/\bP\s*=\s*ρgh/g, 'P=\\rho gh'],
    [/\bΔV\s*=\s*V0\s*[·×]\s*β\s*[·×]\s*ΔT/g, '\\Delta V=V_0\\beta\\Delta T'],
    [/\b(?:CH4|CO2|H2O|O2|C\d+H\d+)\b/g, function (s) {
      return '\\mathrm{' + s.replace(/(\d+)/g, '}_{' + '$1' + '}\\mathrm{') + '}';
    }]
  ];

  var expression = /(?:\(?[−-]?\d[\d.,]*\)?|[A-Za-zρπΔβ][A-Za-z0-9ρπΔβ²³]*)(?:\s*(?:[=+−×÷·\/])\s*(?:\(?[−-]?\d[\d.,]*\)?|[A-Za-zρπΔβ][A-Za-z0-9ρπΔβ²³]*)){1,10}(?:\s*(?:L|liter|%|m³|kg\/m³|kPa|bar))?/g;
  var units = /(?:[−-]?\d[\d.,]*\s*)(?:kg\/m³|m³|m²|L\/menit|L\/detik|m\/s²|m\/s|km\/jam|°API|°C|°F|kPa|bar|kg|liter|kWh|kW|L|V|A|%)(?![A-Za-z0-9])|(?:kg\/m³|m³|m²|L\/menit|L\/detik|m\/s²|m\/s|km\/jam|°API|°C|°F)(?![A-Za-z0-9])/g;

  function candidates(text) {
    var out = [];
    function collect(re, makeTex, priority) {
      re.lastIndex = 0;
      var match;
      while ((match = re.exec(text)) !== null) {
        var value = match[0];
        if (!value.trim()) { re.lastIndex++; continue; }
        var tex = typeof makeTex === 'function' ? makeTex(value) : makeTex;
        if (tex) out.push({ from: match.index, to: match.index + value.length, tex: tex, priority: priority });
      }
    }
    specials.forEach(function (s) { collect(s[0], s[1], 3); });
    collect(expression, function (s) {
      // Hindari mengubah nomor undang-undang, tanggal, dan istilah JBT/JBKP.
      if (!/[=+−×÷·]/.test(s) && !/^\d[\d.,]*\s*\/\s*\d/.test(s)) return null;
      return toTex(s);
    }, 2);
    collect(units, function (s) { return toTex(s); }, 1);
    out.sort(function (a, b) { return a.from - b.from || b.priority - a.priority || b.to - a.to; });
    var used = [], last = 0;
    out.forEach(function (c) {
      if (c.from < last) return;
      used.push(c);
      last = c.to;
    });
    return used;
  }

  function createMath(tex, visible) {
    var span = document.createElement('span');
    span.className = 'math-rendered';
    span.setAttribute('aria-label', visible);
    span.setAttribute('role', 'math');
    if (window.katex && typeof window.katex.render === 'function') {
      try {
        window.katex.render(tex, span, { throwOnError: true, strict: 'ignore', output: 'htmlAndMathml' });
        return span;
      } catch (e) { /* pertahankan teks asli bila sintaks rumus tidak dikenali */ }
    }
    span.textContent = visible;
    return span;
  }

  function replaceNode(node) {
    var text = node.nodeValue;
    if (!text || !/[=×÷ρπΔβ²³°\/−+]/.test(text)) return;
    var hits = candidates(text);
    if (!hits.length) return;
    var frag = document.createDocumentFragment();
    var pos = 0;
    hits.forEach(function (m) {
      if (m.from > pos) frag.appendChild(document.createTextNode(text.slice(pos, m.from)));
      frag.appendChild(createMath(m.tex, text.slice(m.from, m.to)));
      pos = m.to;
    });
    if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  }

  function enhance(root) {
    if (!root) return;
    if (root.matches && root.matches('.math-tex')) {
      var tex = root.getAttribute('data-tex');
      if (tex && !root.classList.contains('math-done')) {
        var replacement = createMath(tex, root.textContent);
        root.replaceWith(replacement);
      }
      return;
    }
    var explicit = root.querySelectorAll ? root.querySelectorAll('.math-tex[data-tex]') : [];
    Array.prototype.forEach.call(explicit, function (el) {
      el.replaceWith(createMath(el.getAttribute('data-tex'), el.textContent));
    });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var parent = n.parentElement;
        if (!parent || parent.closest('a,script,style,noscript,textarea,pre,code,svg,math,.math-rendered,[data-math-ignore]')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(replaceNode);
  }

  function setText(el, text) {
    el.textContent = text == null ? '' : String(text);
    enhance(el);
  }

  window.PEMath = { enhance: enhance, setText: setText };
  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('.materi-block, .chapter, .detail-table, .formula'), enhance);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
