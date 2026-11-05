/* Bridgr calculator (BR-008): one calculation, two presentations (full page, homepage hero).
   Illustrative estimate only. Not a lender offer, quote or Decision in Principle.
   No storage, cookies, analytics or network requests. Values travel to apply.html as URL
   parameters (?amount=...&term=...), which is visible to the customer and kept in no store. */
(function () {
  'use strict';

  var DEFAULTS = { loan: 2000000, prop: 2800000, term: 12, rate: 0.85, arr: 2, exit: 0, val: 1500, legal: 2500, mode: 'rolled' };
  var LIM = { loanMin: 10000, loanMax: 100000000, propMax: 500000000, termMin: 1, termMax: 36 };
  var uid = 0;

  function gbp(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }

  /* The calculation. Same formulas and assumptions as the original calculator. */
  function compute(i) {
    var rate = i.rate / 100, arrPct = i.arr / 100, exitPct = i.exit / 100;
    var totalInterest = i.mode === 'monthly' ? i.loan * rate * i.term : i.loan * (Math.pow(1 + rate, i.term) - 1);
    var arrFee = i.loan * arrPct, exitFee = i.loan * exitPct, other = i.val + i.legal;
    var totalCost = totalInterest + arrFee + exitFee + other;
    return {
      ltv: i.prop > 0 ? (i.loan / i.prop * 100) : 0,
      totalInterest: totalInterest, arrFee: arrFee, exitFee: exitFee, other: other,
      totalCost: totalCost, totalRepay: i.loan + totalCost,
      monthly: i.loan * rate, ear: (Math.pow(1 + rate, 12) - 1) * 100
    };
  }

  /* ---------- editable pounds field: formats as you type, caret stays beside the same digit ---------- */
  function digitsOf(s) { return String(s).replace(/[^0-9]/g, ''); }
  function moneyValue(input) { var d = digitsOf(input.value); return d ? parseInt(d, 10) : 0; }
  function formatMoneyInput(input) {
    var before = digitsOf(input.value.slice(0, input.selectionStart == null ? input.value.length : input.selectionStart)).length;
    var d = digitsOf(input.value).replace(/^0+/, '').slice(0, 10);
    input.value = d ? Number(d).toLocaleString('en-GB') : '';
    var pos = 0, seen = 0;
    while (pos < input.value.length && seen < before) { if (/[0-9]/.test(input.value.charAt(pos))) seen++; pos++; }
    try { input.setSelectionRange(pos, pos); } catch (e) { /* not focusable yet */ }
  }

  /* ---------- URL parameters (validated; ignored if not sensible) ---------- */
  function paramInt(name) {
    var m = new RegExp('[?&]' + name + '=(\\d{1,10})(?:&|$)').exec(location.search);
    return m ? parseInt(m[1], 10) : null;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- markup ---------- */
  function moneyField(id, label, value, hint, big) {
    return '<div class="cx-field' + (big ? ' cx-big' : '') + '">' +
      '<label class="cx-label" for="' + id + '">' + label + '</label>' +
      '<div class="cx-money"><span class="cx-pound" aria-hidden="true">£</span>' +
      '<input type="text" id="' + id + '" inputmode="numeric" autocomplete="off" value="' + esc(value) + '" aria-describedby="' + id + '-msg"></div>' +
      '<div class="cx-msg" id="' + id + '-msg" role="status">' + hint + '</div></div>';
  }
  function termField(uidp) {
    var n = 'cx-term-' + uidp;
    return '<fieldset class="cx-field cx-termset"><legend class="cx-label">Loan term</legend>' +
      '<div class="cx-seg" role="radiogroup">' +
      '<label><input type="radio" name="' + n + '" value="6"><span>6 months</span></label>' +
      '<label><input type="radio" name="' + n + '" value="12"><span>12 months</span></label>' +
      '<label><input type="radio" name="' + n + '" value="custom"><span>Custom</span></label></div>' +
      '<div class="cx-custom" hidden><label class="cx-label" for="' + n + '-m">Number of months</label>' +
      '<input type="text" class="cx-num" id="' + n + '-m" inputmode="numeric" autocomplete="off" maxlength="2" aria-describedby="' + n + '-msg"></div>' +
      '<div class="cx-msg" id="' + n + '-msg" role="status"></div></fieldset>';
  }
  function slider(key, label, min, max, step, unit) {
    return '<div class="cx-field cx-slide"><div class="cx-label"><label for="cx-' + key + '">' + label + '</label><output data-val="' + key + '"></output></div>' +
      '<input type="range" id="cx-' + key + '" min="' + min + '" max="' + max + '" step="' + step + '">' +
      '<div class="cx-scale"><span>' + unit[0] + '</span><span>' + unit[1] + '</span></div></div>';
  }
  var DISCLAIMER = 'Illustrative estimate only, based on the figures and assumptions shown. It is not a lender offer, quote or Decision in Principle. Actual terms depend on the lender and the case.';

  function html(variant, p) {
    var full = variant === 'full';
    var h = '<div class="cx cx-' + variant + '">';
    h += '<div class="cx-col cx-in">';
    h += '<section class="cx-card"><h2 class="cx-h"><span class="cx-n">1</span>Your figures</h2>';
    h += moneyField('cx-loan', 'Loan amount', p.loanText, 'Type an exact amount, for example 150,000.', true);
    h += moneyField('cx-prop', 'Property value', p.propText, 'Your own estimate of the security value.', false);
    h += termField(p.uid) + '</section>';
    if (full) {
      h += '<section class="cx-card"><h2 class="cx-h"><span class="cx-n">2</span>Assumptions you can change</h2>' +
        '<p class="cx-sub">These are illustrative assumptions, not lender rates or fees. Change them to see how the estimate moves.</p>' +
        slider('rate', 'Monthly interest rate', 0.5, 2, 0.01, ['0.50%', '2.00%']) +
        '<div class="cx-field"><div class="cx-label">Interest structure</div><div class="cx-seg cx-seg3" id="cx-mode" role="radiogroup" aria-label="Interest structure">' +
        '<label><input type="radio" name="cx-mode-' + p.uid + '" value="monthly"><span>Monthly</span></label>' +
        '<label><input type="radio" name="cx-mode-' + p.uid + '" value="rolled"><span>Rolled up</span></label>' +
        '<label><input type="radio" name="cx-mode-' + p.uid + '" value="retained"><span>Retained</span></label></div>' +
        '<div class="cx-msg" id="cx-mode-note"></div></div>' +
        '<div class="cx-pair">' + slider('arr', 'Arrangement fee', 0, 3, 0.25, ['0%', '3%']) + slider('exit', 'Exit fee', 0, 2, 0.25, ['0%', '2%']) + '</div>' +
        '<div class="cx-pair">' + slider('val', 'Valuation fee', 500, 5000, 250, ['£500', '£5,000']) + slider('legal', 'Legal fees', 500, 8000, 250, ['£500', '£8,000']) + '</div>' +
        '</section>';
    }
    h += '</div><div class="cx-col cx-out"><section class="cx-card cx-est" aria-live="polite">';
    h += '<h2 class="cx-h"><span class="cx-n">' + (full ? '3' : '2') + '</span>Illustrative estimate</h2>';
    h += '<div class="cx-badge">Illustrative · not an offer, quote or DIP</div>';
    h += '<div class="cx-total-l">Total estimated cost</div><div class="cx-total" data-out="total"></div><div class="cx-total-s">Interest plus fees, on the figures above</div>';
    if (full) {
      h += '<div class="cx-ltv"><div class="cx-row"><span>Loan to value (LTV)</span><b data-out="ltv"></b></div><div class="cx-track"><div class="cx-fill" data-out="ltvfill"></div></div><div class="cx-note" data-out="ltvnote"></div></div>';
      h += '<div class="cx-bars">' +
        '<div class="cx-bar"><div class="cx-row"><span>Total interest</span><b data-out="interest"></b></div><div class="cx-track"><div class="cx-fill" data-out="b-interest"></div></div></div>' +
        '<div class="cx-bar"><div class="cx-row"><span>Arrangement fee</span><b data-out="arr"></b></div><div class="cx-track"><div class="cx-fill gold" data-out="b-arr"></div></div></div>' +
        '<div class="cx-bar"><div class="cx-row"><span>Exit fee</span><b data-out="exit"></b></div><div class="cx-track"><div class="cx-fill gold" data-out="b-exit"></div></div></div>' +
        '<div class="cx-bar"><div class="cx-row"><span>Valuation + legal</span><b data-out="other"></b></div><div class="cx-track"><div class="cx-fill dim" data-out="b-other"></div></div></div></div>';
      h += '<div class="cx-cards"><div><span>Gross loan</span><b data-out="gross"></b></div><div><span>Total repayable</span><b class="teal" data-out="repay"></b></div>' +
        '<div><span>Monthly interest</span><b class="gold" data-out="monthly"></b></div><div><span>Effective annual rate</span><b data-out="ear"></b></div></div>';
    } else {
      h += '<div class="cx-cards"><div><span>Total repayable</span><b class="teal" data-out="repay"></b></div><div><span>LTV</span><b data-out="ltv"></b></div></div>';
      h += '<p class="cx-assume">Assumes 0.85% per month, rolled-up interest, a 2% arrangement fee, £1,500 valuation and £2,500 legal fees. <a class="cx-adjust" href="calculator.html">Change these in the full calculator</a>.</p>';
    }
    h += '<a class="cx-cta" href="apply.html" data-cta>Start your enquiry</a>';
    h += '<p class="cx-fine">' + DISCLAIMER + '</p>';
    h += '</section></div></div>';
    return h;
  }

  /* ---------- behaviour ---------- */
  function mount(root, variant) {
    var id = ++uid, full = variant === 'full';
    var loan0 = paramInt('amount'), val0 = paramInt('value'), term0 = paramInt('term');
    if (loan0 == null || loan0 < LIM.loanMin || loan0 > LIM.loanMax) loan0 = DEFAULTS.loan;
    if (val0 == null || val0 < 1 || val0 > LIM.propMax) val0 = DEFAULTS.prop;
    if (term0 == null || term0 < LIM.termMin || term0 > LIM.termMax) term0 = DEFAULTS.term;
    root.innerHTML = html(variant, { uid: id, loanText: loan0.toLocaleString('en-GB'), propText: val0.toLocaleString('en-GB') });
    var q = function (s) { return root.querySelector(s); };
    var loanEl = q('#cx-loan'), propEl = q('#cx-prop');
    var radios = root.querySelectorAll('input[name="cx-term-' + id + '"]'), custom = q('.cx-custom'), months = q('.cx-num');
    var termMsg = q('#cx-term-' + id + '-msg');
    var state = { mode: DEFAULTS.mode };
    var out = function (k, v) { var e = q('[data-out="' + k + '"]'); if (e) e.textContent = v; };
    var bar = function (k, pct) { var e = q('[data-out="' + k + '"]'); if (e) e.style.width = pct + '%'; };

    function setTermUI(t) {
      var kind = (t === 6 || t === 12) ? String(t) : 'custom';
      radios.forEach(function (r) { r.checked = r.value === kind; });
      custom.hidden = kind !== 'custom';
      if (kind === 'custom') months.value = String(t);
    }
    function termValue() {
      var sel = root.querySelector('input[name="cx-term-' + id + '"]:checked');
      if (!sel) return 0;
      if (sel.value !== 'custom') return parseInt(sel.value, 10);
      var d = digitsOf(months.value); return d ? parseInt(d, 10) : 0;
    }
    function msg(el, text, bad) { el.textContent = text; el.classList.toggle('bad', !!bad); }
    function fieldBad(input, bad) { input.setAttribute('aria-invalid', bad ? 'true' : 'false'); input.closest('.cx-field').classList.toggle('invalid', !!bad); }

    function inputs() {
      var g = function (k, d) { var e = q('#cx-' + k); return e ? parseFloat(e.value) : d; };
      return { loan: moneyValue(loanEl), prop: moneyValue(propEl), term: termValue(), rate: g('rate', DEFAULTS.rate), arr: g('arr', DEFAULTS.arr), exit: g('exit', DEFAULTS.exit), val: g('val', DEFAULTS.val), legal: g('legal', DEFAULTS.legal), mode: state.mode };
    }

    function update() {
      var i = inputs(), ok = true;
      var loanBad = i.loan < LIM.loanMin || i.loan > LIM.loanMax;
      fieldBad(loanEl, loanBad); msg(q('#cx-loan-msg'), loanBad ? 'Enter a loan amount between ' + gbp(LIM.loanMin) + ' and ' + gbp(LIM.loanMax) + '.' : 'Type an exact amount, for example 150,000.', loanBad);
      var propBad = i.prop < 1;
      fieldBad(propEl, propBad); msg(q('#cx-prop-msg'), propBad ? 'Enter the property value to see the loan to value.' : 'Your own estimate of the security value.', propBad);
      var termBad = i.term < LIM.termMin || i.term > LIM.termMax;
      msg(termMsg, termBad ? 'Enter a whole number of months from ' + LIM.termMin + ' to ' + LIM.termMax + '.' : '', termBad);
      months.setAttribute('aria-invalid', termBad && !custom.hidden ? 'true' : 'false');
      if (loanBad || termBad) ok = false;

      if (full) {
        [['rate', function (v) { return v.toFixed(2) + '% / month'; }], ['arr', function (v) { return v.toFixed(2) + '%'; }], ['exit', function (v) { return v.toFixed(2) + '%'; }], ['val', gbp], ['legal', gbp]].forEach(function (p) {
          var e = q('output[data-val="' + p[0] + '"]'); if (e) e.textContent = p[1](parseFloat(q('#cx-' + p[0]).value));
        });
        q('#cx-mode-note').textContent = { monthly: 'You pay interest each month during the term.', rolled: 'Interest is added to the loan and repaid on exit.', retained: 'Interest is deducted from the loan upfront. In this estimate it is calculated in the same way as rolled-up interest.' }[state.mode];
      }

      var cta = q('[data-cta]'), adj = q('.cx-adjust');
      if (!ok) {
        ['total', 'interest', 'arr', 'exit', 'other', 'gross', 'repay', 'monthly', 'ear', 'ltv'].forEach(function (k) { out(k, '—'); });
        ['ltvfill', 'b-interest', 'b-arr', 'b-exit', 'b-other'].forEach(function (k) { bar(k, 0); });
        out('ltvnote', '');
        if (cta) cta.setAttribute('href', 'apply.html');
        if (adj) adj.setAttribute('href', 'calculator.html');
        root.classList.add('cx-invalid'); return;
      }
      root.classList.remove('cx-invalid');
      var r = compute(i);
      out('total', gbp(r.totalCost)); out('interest', gbp(r.totalInterest)); out('arr', gbp(r.arrFee)); out('exit', gbp(r.exitFee)); out('other', gbp(r.other));
      out('gross', gbp(i.loan)); out('repay', gbp(r.totalRepay)); out('monthly', gbp(r.monthly)); out('ear', r.ear.toFixed(1) + '%');
      out('ltv', i.prop > 0 ? r.ltv.toFixed(1) + '%' : '—');
      if (full) {
        bar('ltvfill', Math.min(r.ltv, 100));
        out('ltvnote', i.prop < 1 ? '' : (r.ltv > 100 ? 'The loan is more than the property value you entered.' : 'Loan divided by property value, using your own figures. Maximum LTV depends on the lender, the asset and the borrower.'));
        var safe = function (n) { return r.totalCost > 0 ? Math.min(100, Math.max(0, n / r.totalCost * 100)) : 0; };
        bar('b-interest', safe(r.totalInterest)); bar('b-arr', safe(r.arrFee)); bar('b-exit', safe(r.exitFee)); bar('b-other', safe(r.other));
      }
      if (cta) cta.setAttribute('href', 'apply.html?amount=' + i.loan + '&term=' + i.term);
      if (adj) adj.setAttribute('href', 'calculator.html?amount=' + i.loan + '&value=' + i.prop + '&term=' + i.term);
    }

    [loanEl, propEl].forEach(function (el) {
      el.addEventListener('input', function () { formatMoneyInput(el); update(); });
      el.addEventListener('blur', function () { var n = moneyValue(el); el.value = n ? n.toLocaleString('en-GB') : ''; update(); });
    });
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        custom.hidden = r.value !== 'custom';
        if (r.value === 'custom') { if (!months.value) months.value = '18'; months.focus(); }
        update();
      });
    });
    months.addEventListener('input', function () { months.value = digitsOf(months.value).slice(0, 2); update(); });
    if (full) {
      var set = function (k, v) { var e = q('#cx-' + k); e.value = v; e.addEventListener('input', update); };
      set('rate', DEFAULTS.rate); set('arr', DEFAULTS.arr); set('exit', DEFAULTS.exit); set('val', DEFAULTS.val); set('legal', DEFAULTS.legal);
      root.querySelectorAll('input[name="cx-mode-' + id + '"]').forEach(function (r) {
        r.checked = r.value === state.mode;
        r.addEventListener('change', function () { state.mode = r.value; update(); });
      });
    }
    setTermUI(term0);
    update();
    if (variant === 'compact' && 'IntersectionObserver' in window) {
      var small = window.matchMedia('(max-width:768px)');
      new IntersectionObserver(function (es) {
        document.documentElement.classList.toggle('bx-calc-visible', es[0].isIntersecting && small.matches);
      }, { threshold: 0 }).observe(root);
    }
    return { compute: compute, update: update };
  }

  window.BridgrCalc = { mount: mount, compute: compute, gbp: gbp, DEFAULTS: DEFAULTS, LIMITS: LIM };

  function auto() { document.querySelectorAll('[data-bridgr-calc]').forEach(function (r) { mount(r, r.getAttribute('data-bridgr-calc')); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
