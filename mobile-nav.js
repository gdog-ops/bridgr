/* Bridgr mobile navigation (BR-008): accessible hamburger menu for the top nav. */
(function () {
  var nav = document.querySelector('body > nav, nav');
  if (!nav || document.querySelector('.m-bar')) return;
  var LINKS = [['Home','index.html'],['Calculator','calculator.html'],['Residential bridging','residential-bridging.html'],['Commercial bridging','commercial-bridging.html'],['Development finance','development-finance.html'],['Auction finance','auction-finance.html'],['Refurbishment loans','refurbishment-loans.html'],['Mezzanine finance','mezzanine-finance.html'],['Brokers','brokers.html'],['Contact','contact.html']];
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'bmn-btn'; btn.id = 'bmn-btn';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'bmn-menu'); btn.setAttribute('aria-label', 'Open menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  var menu = document.createElement('div');
  menu.id = 'bmn-menu'; menu.className = 'bmn-menu'; menu.hidden = true;
  var cur = (location.pathname.split('/').pop() || 'index.html');
  var h = '<ul>';
  LINKS.forEach(function (l) { h += '<li><a href="' + l[1] + '"' + (l[1] === cur ? ' aria-current="page"' : '') + '>' + l[0] + '</a></li>'; });
  h += '</ul><a class="bmn-primary" href="apply.html">Start your enquiry</a><a class="bmn-call" href="tel:+442089695833" data-phone-link data-uw>Call an Underwriter</a>';
  menu.innerHTML = h;
  nav.appendChild(btn); document.body.appendChild(menu);
  function set(open) {
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open; document.documentElement.classList.toggle('bmn-open', open);
  }
  btn.addEventListener('click', function () { set(menu.hidden); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false); });
  window.addEventListener('resize', function () { if (innerWidth > 900 && !menu.hidden) set(false); });
})();
