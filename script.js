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
})();
