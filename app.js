// Estudio Faro — reveals al scroll (progresivos, con fallback sin-JS y reduced-motion)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // contenido ya visible por CSS
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  var els = document.querySelectorAll('.reveal, .stagger');
  els.forEach(function (el) { io.observe(el); });
  // Safety: si no hubo scroll (o entorno sin viewport), revela todo igual — nunca queda en blanco.
  window.addEventListener('load', function () {
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 2000);
  });
})();

// Nav: sombra al hacer scroll + menú móvil
(function () {
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 10); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
  var btn = document.querySelector('.menu-btn'), links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }
})();
