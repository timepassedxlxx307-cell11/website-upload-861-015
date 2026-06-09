(function () {
  var video = document.querySelector('[data-video-player]');
  var overlay = document.querySelector('[data-play-overlay]');
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (!video || prepared || typeof playerSource === 'undefined') {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playerSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(playerSource);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playerSource;
    }
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video) {
      video.controls = true;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!prepared) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
