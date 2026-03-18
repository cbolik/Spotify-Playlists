(function () {
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+
  var isMac = /Macintosh/.test(ua) && !isIOS;

  var SUPPORTED = ['playlist', 'track', 'album', 'artist', 'show', 'episode'];

  function deriveHttpsUrl(uri) {
    var parts = uri.split(':');
    if (parts.length !== 3) return null;
    if (SUPPORTED.indexOf(parts[1]) === -1) return null;
    return 'https://open.spotify.com/' + parts[1] + '/' + parts[2];
  }

  var links = document.querySelectorAll('a[href^="spotify:"]');

  if (!isMac) {
    // iOS/iPadOS and all other non-Mac platforms: rewrite hrefs to https universal links
    links.forEach(function (a) {
      var url = deriveHttpsUrl(a.getAttribute('href'));
      if (url) a.setAttribute('href', url);
    });
  } else {
    // macOS: intercept clicks, try spotify: URI with blur/timer fallback to https
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var uri = a.getAttribute('href');
        var url = deriveHttpsUrl(uri);
        if (!url) return; // malformed/unsupported — let browser handle normally
        e.preventDefault();
        var timer = setTimeout(function () { window.location.href = url; }, 800);
        window.addEventListener('blur', function () { clearTimeout(timer); }, { once: true });
        window.location.href = uri;
      });
    });
  }

  // --- Carousel navigation ---
  var carousel = document.querySelector('.carousel');
  var pages = document.querySelectorAll('.page');
  var dotsContainer = document.querySelector('.dots');
  var arrowLeft = document.querySelector('.arrow-left');
  var arrowRight = document.querySelector('.arrow-right');

  if (carousel && pages.length > 1 && dotsContainer) {
    // Generate dots
    pages.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
      dot.addEventListener('click', function () {
        carousel.scrollTo({ left: i * carousel.offsetWidth, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('.dot');

    // Update active dot on scroll
    function updateDots() {
      var index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    carousel.addEventListener('scroll', updateDots);

    // Arrow navigation
    if (arrowLeft) {
      arrowLeft.addEventListener('click', function () {
        carousel.scrollBy({ left: -carousel.offsetWidth, behavior: 'smooth' });
      });
    }
    if (arrowRight) {
      arrowRight.addEventListener('click', function () {
        carousel.scrollBy({ left: carousel.offsetWidth, behavior: 'smooth' });
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        carousel.scrollBy({ left: -carousel.offsetWidth, behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        carousel.scrollBy({ left: carousel.offsetWidth, behavior: 'smooth' });
      }
    });
  }
})();
