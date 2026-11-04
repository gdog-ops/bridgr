/* Bridgr human-contact dialog and demonstration assistant (BR-005).
   Static, no network, no storage, no external services.
   TELEPHONE NUMBER: set once here. Every "Call an Underwriter" link becomes a working tel: link,
   and every [data-phone] / [data-phone-link] element on the site shows this same number. */
(function () {
  'use strict';
  var PHONE_DISPLAY = '0208 969 5833';   // approved Bridgr business number
  var PHONE_TEL = '+442089695833';
  var EMAIL = 'info@maplehillcapitalpartners.co.uk';
  var PLACEHOLDER = 'Telephone number not yet available';
  var telOn = !!(PHONE_DISPLAY && /^\+?[0-9]{10,13}$/.test(PHONE_TEL));
  var me = document.currentScript;
  var widgetOff = me && me.getAttribute('data-widget') === 'off';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- telephone component (one place to change) ---------- */
  function phoneNode() {
    if (telOn) { var a = el('a', 'bx-phone', PHONE_DISPLAY); a.href = 'tel:' + PHONE_TEL; return a; }
    return el('span', 'bx-phone', PLACEHOLDER);
  }
  function initPhone() {
    document.querySelectorAll('[data-phone]').forEach(function (n) { n.textContent = ''; n.appendChild(phoneNode()); });
    if (telOn) document.querySelectorAll('a[data-phone-link]').forEach(function (a) { a.href = 'tel:' + PHONE_TEL; a.textContent = PHONE_DISPLAY; });
    if (telOn) document.querySelectorAll('a[data-uw]').forEach(function (a) { a.href = 'tel:' + PHONE_TEL; });
  }

  /* ---------- dialog ---------- */
  var dlg, body;
  function ensureDialog() {
    if (dlg) return;
    dlg = el('dialog', 'bx-dialog'); dlg.setAttribute('aria-labelledby', 'bx-d-title');
    body = el('div', 'bx-d-in'); dlg.appendChild(body);
    dlg.addEventListener('close', reset);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
  }
  function reset() { if (body) body.textContent = ''; }
  function head(title) {
    var h = el('div', 'bx-d-head'), t = el('h2', 'bx-d-title', title); t.id = 'bx-d-title';
    var x = el('button', 'bx-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', function () { dlg.close(); });
    h.appendChild(t); h.appendChild(x); return h;
  }
  function demoBanner(text) { var d = el('div', 'bx-demo'); d.appendChild(el('strong', null, 'Demonstration')); d.appendChild(el('span', null, text)); return d; }

  function viewUnderwriter() {
    reset();
    body.appendChild(head('Call an Underwriter'));
    if (!telOn) body.appendChild(demoBanner('No telephone number is available yet. Nothing on this page connects you to anyone.'));
    body.appendChild(el('p', 'bx-d-text', 'Speak directly to a bridging finance specialist.'));
    body.appendChild(phoneNode());
    body.appendChild(el('p', 'bx-sub', 'We do not promise immediate availability or fixed response times.'));
    var row = el('div', 'bx-row');
    var cb = el('button', 'bx-btn sec', 'Request a callback'); cb.type = 'button'; cb.addEventListener('click', viewCallback);
    var mail = el('a', 'bx-btn sec', 'Email us'); mail.href = 'mailto:' + EMAIL;
    row.appendChild(cb); row.appendChild(mail); body.appendChild(row);
  }

  function field(id, label, input) {
    var f = el('div', 'bx-field'), l = el('label', null, label); l.htmlFor = id; input.id = id;
    f.appendChild(l); f.appendChild(input); var er = el('div', 'bx-err'); er.id = id + '-err'; er.setAttribute('role', 'alert'); f.appendChild(er);
    return f;
  }
  function viewCallback() {
    reset();
    body.appendChild(head('Request a callback'));
    body.appendChild(demoBanner('This form is a demonstration. Nothing is sent, stored or booked.'));
    var form = el('form'); form.noValidate = true;
    var name = el('input'); name.type = 'text'; name.autocomplete = 'name'; name.maxLength = 80;
    var tel = el('input'); tel.type = 'tel'; tel.autocomplete = 'tel'; tel.inputMode = 'tel'; tel.maxLength = 20; tel.placeholder = 'UK number';
    var when = el('select'); ['Morning', 'Afternoon', 'No preference'].forEach(function (o) { var op = el('option', null, o); op.value = o; when.appendChild(op); }); when.value = 'No preference';
    var msg = el('textarea'); msg.maxLength = 300;
    form.appendChild(field('bx-name', 'Name', name));
    form.appendChild(field('bx-tel', 'UK telephone number', tel));
    form.appendChild(field('bx-when', 'Preferred callback time', when));
    var mf = field('bx-msg', 'Message (optional)', msg); var cnt = el('div', 'bx-count', '0 / 300'); mf.insertBefore(cnt, mf.lastChild); form.appendChild(mf);
    form.appendChild(el('p', 'bx-sub', 'Please do not include financial or sensitive personal details.'));
    msg.addEventListener('input', function () { cnt.textContent = msg.value.length + ' / 300'; });
    var row = el('div', 'bx-row');
    var go = el('button', 'bx-btn', 'Send (demonstration)'); go.type = 'submit';
    var cancel = el('button', 'bx-btn sec', 'Cancel'); cancel.type = 'button'; cancel.addEventListener('click', function () { dlg.close(); });
    row.appendChild(go); row.appendChild(cancel); form.appendChild(row);
    var result = el('div'); result.setAttribute('role', 'status'); result.setAttribute('aria-live', 'polite'); form.appendChild(result);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      function err(i, m) { document.getElementById(i.id + '-err').textContent = m || ''; if (m && !bad) bad = i; }
      err(name, name.value.trim().length < 2 ? 'Please enter your name.' : '');
      var digits = tel.value.replace(/[\s()\-]/g, '');
      err(tel, /^(\+44|0044|0)\d{9,10}$/.test(digits) ? '' : 'Please enter a valid UK telephone number.');
      if (bad) { bad.focus(); result.textContent = ''; return; }
      result.textContent = ''; var r = el('div', 'bx-result'); r.appendChild(el('strong', null, 'Demonstration only. No callback request has been sent or booked.'));
      result.appendChild(r); go.disabled = true;
    });
    body.appendChild(form); name.focus();
  }

  function open(view) {
    ensureDialog();
    if (view === 'cb') viewCallback(); else viewUnderwriter();
    if (!dlg.open) dlg.showModal();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-uw],[data-callback]') : null;
    if (!t) return;
    if (t.hasAttribute('data-callback')) { e.preventDefault(); closePanel(); open('cb'); return; }
    if (telOn) return;            /* real number: let the tel: link dial */
    e.preventDefault(); closePanel(); open('uw');
  });

  /* ---------- Bridgr Assistant (predefined answers, no AI, no network) ---------- */
  var NEXT = 'A person on our team handles the judgement; this assistant only shares general information.';
  var KB = [
    { k: ['decision in principle', 'dip', 'approve', 'approval', 'approved', 'accepted', 'guarantee', 'offer', 'can i get', 'will i get', 'am i eligible', 'eligible', 'qualify'],
      a: 'I cannot assess eligibility or give any decision, and nothing on this site is an approval or a lender offer. Any decision is made by the lender after it has reviewed the case. An underwriter can talk through your situation.' },
    { k: ['rate', 'rates', 'fee', 'fees', 'cost', 'interest', 'ltv', 'how much', 'price', 'how fast', 'how long', 'how quickly', 'days', 'speed', 'turnaround'],
      a: 'I cannot give rates, fees, loan-to-value limits or timings. They depend on the lender, the property, the borrower and the case. The calculator gives indicative estimates only, and an underwriter can discuss your situation.' },
    { k: ['what is bridging', 'bridging finance', 'bridging loan', 'what is a bridge'],
      a: 'Bridging finance is short-term property finance, used to bridge the gap until a longer-term solution such as a sale or a refinance is in place. Terms, costs and eligibility depend on the lender and the case.' },
    { k: ['why', 'reasons', 'used for', 'uses', 'chain', 'equity', 'common'],
      a: 'Common reasons include buying before selling, breaking a property chain, buying at auction, funding refurbishment or conversion, and releasing equity. Whether it suits you depends on your circumstances and the exit.' },
    { k: ['purchase', 'buy', 'refinance', 'remortgage'],
      a: 'Bridging can be used to purchase a property or to refinance an existing loan while a longer-term arrangement is put in place. A lender will want to understand how the loan will be repaid.' },
    { k: ['auction'],
      a: 'Auction purchases normally have a short completion deadline set by the auction conditions (often 28 days), so it helps to talk to us early. Finance options can be explored in advance, but funding is not agreed until the relevant lender has made its decision.' },
    { k: ['refurb', 'refurbishment', 'development', 'conversion', 'build', 'works'],
      a: 'Refurbishment and development finance are for properties that need works. How it is structured depends on the project and the lender. Our team can explore options with you.' },
    { k: ['regulated', 'unregulated', 'live in', 'live there', 'residential', 'family', 'tenant'],
      a: 'Bridging can be regulated or unregulated depending on the circumstances, for example whether you or a family member lives, or will live, in the property. Our team assesses this on the full facts. The enquiry shows indicators only, not a decision.' },
    { k: ['exit', 'repay', 'repayment', 'pay back'],
      a: 'Lenders usually want a clear exit, meaning how the loan will be repaid, for example selling the property or refinancing onto longer-term lending. You choose your intended exit in the enquiry.' },
    { k: ['calculator', 'calculate', 'estimate'],
      a: 'The Bridgr calculator gives indicative estimates only. They are not a quote, an offer or a lender decision, and actual terms vary with the lender and the case.' },
    { k: ['enquiry', 'enquire', 'apply', 'application', 'start', 'steps'],
      a: 'The online enquiry has five short steps: finance requirements, about you, security properties, who lives there, and a review. It is a short initial enquiry, not a full lender application. At the moment it is a demonstration, so nothing is submitted.' },
    { k: ['after', 'next', 'then what', 'what happens'],
      a: 'In the live service, our team would review your enquiry and tell you what else is needed. At the moment the enquiry is a demonstration, so nothing is sent and nobody will contact you.' },
    { k: ['broker', 'brokers', 'introducer', 'solicitor'],
      a: 'Broker accounts and online case submission are planned and are not live yet. The brokers page explains the planned approach, and you can register interest there (demonstration only).' },
    { k: ['underwriter', 'speak to', 'speak', 'talk to', 'talk', 'call', 'phone', 'person', 'human', 'expert', 'specialist', 'contact'],
      a: 'You can speak to a real person. Use Call an Underwriter' + (telOn ? ' on ' + PHONE_DISPLAY : '') + ', or request a callback (demonstration only). We do not promise immediate availability or fixed response times.' }
  ];
  var FALLBACK = 'I do not have an answer to that. I only use predefined information from this website. You can start an enquiry, or speak to an underwriter who can help properly.';
  var SENSITIVE = /(\d[\s-]?){7,}|@|£\s?\d/;

  function answer(q) {
    q = q.toLowerCase();
    var best = null, bestN = 0;
    KB.forEach(function (it, idx) {
      var n = 0; it.k.forEach(function (w) { if (q.indexOf(w) !== -1) n += idx < 2 ? 3 : 1; });
      if (n > bestN) { best = it; bestN = n; }
    });
    return best ? best.a : FALLBACK;
  }

  var launch, panel, msgs, input, lastFocus;
  function addMsg(text, who) { var m = el('div', 'bx-m ' + who, text); msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m; }
  function chip(label, cls, fn, href) {
    var c = href ? el('a', 'bx-chip ' + cls, label) : el('button', 'bx-chip ' + cls, label);
    if (href) c.href = href; else { c.type = 'button'; c.addEventListener('click', fn); }
    return c;
  }
  function nextSteps(parent) {
    var row = el('div', 'bx-chips');
    row.appendChild(chip('Start your enquiry', 'go', null, 'apply.html'));
    var uw = chip('Call an Underwriter', 'go', null, telOn ? 'tel:' + PHONE_TEL : 'contact.html'); uw.setAttribute('data-uw', ''); row.appendChild(uw);
    var cb = chip('Request a callback', '', null, 'contact.html'); cb.setAttribute('data-callback', ''); row.appendChild(cb);
    parent.appendChild(row);
  }
  var TOPICS = [['What is bridging finance?', 'what is bridging finance'], ['Auction finance', 'auction'], ['Regulated or unregulated?', 'regulated unregulated'], ['Exit strategies', 'exit'], ['The calculator', 'calculator'], ['How the enquiry works', 'how does the enquiry work'], ['Broker enquiries', 'broker']];
  function ask(q, show) {
    if (SENSITIVE.test(q)) {
      nextSteps(addMsg('Please do not share personal or financial details here. This assistant is a demonstration and is not secure. An underwriter can take those details properly.', 'bot'));
    } else {
      if (show) addMsg(q, 'me');
      var m = addMsg(answer(q), 'bot'); nextSteps(m);
    }
  }
  function startChat() {
    msgs.textContent = '';
    var m = addMsg('Hello. I can share general information about bridging finance from this website. What would you like to know?', 'bot');
    var chips = el('div', 'bx-chips');
    TOPICS.forEach(function (tp) { chips.appendChild(chip(tp[0], '', function () { addMsg(tp[0], 'me'); nextSteps(addMsg(answer(tp[1]), 'bot')); })); });
    m.appendChild(chips); nextSteps(m);
  }
  function openPanel() { lastFocus = document.activeElement; panel.classList.add('open'); launch.style.display = 'none'; startChat(); input.focus(); }
  function closePanel() {
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open'); launch.style.display = ''; msgs.textContent = ''; input.value = ''; launch.focus();
  }
  function buildWidget() {
    launch = el('button', 'bx-launch', 'Bridgr Assistant'); launch.type = 'button'; launch.setAttribute('aria-haspopup', 'dialog'); launch.setAttribute('aria-label', 'Open Bridgr Assistant (demonstration)');
    launch.addEventListener('click', openPanel);
    panel = el('section', 'bx-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Bridgr Assistant (demonstration)');
    var h = el('div', 'bx-p-head'), l = el('div'); l.appendChild(el('span', 'bx-p-title', 'Bridgr Assistant')); l.appendChild(el('span', 'bx-p-badge', 'Demonstration'));
    var x = el('button', 'bx-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close assistant'); x.addEventListener('click', closePanel);
    h.appendChild(l); h.appendChild(x); panel.appendChild(h);
    panel.appendChild(el('div', 'bx-p-note', 'A demonstration using predefined website information. It is not a live AI service and not an underwriter, and it cannot give decisions, rates or advice.'));
    msgs = el('div', 'bx-msgs'); msgs.setAttribute('aria-live', 'polite'); panel.appendChild(msgs);
    var form = el('form', 'bx-form'); input = el('input'); input.type = 'text'; input.maxLength = 120; input.placeholder = 'Ask a general question'; input.setAttribute('aria-label', 'Your question');
    var send = el('button', 'bx-btn', 'Ask'); send.type = 'submit'; form.appendChild(input); form.appendChild(send);
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; ask(q, true); });
    panel.appendChild(form); panel.appendChild(el('div', 'bx-hint', 'Do not enter personal or financial details. Chat is cleared when you close this window.'));
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    document.body.appendChild(launch); document.body.appendChild(panel);
  }

  function init() { initPhone(); if (!widgetOff) buildWidget(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
