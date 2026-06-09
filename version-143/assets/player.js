(function () {
  function mount(frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    if (!video) return;
    var stream = video.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function prepare() {
      if (ready || !stream) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      frame.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) play();
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });

    prepare();
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), mount);
  });
})();
