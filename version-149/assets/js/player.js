(function () {
  function select(selector) {
    return document.querySelector(selector);
  }

  function init(stream) {
    var video = select("[data-player]");
    var button = select("[data-play]");
    var shell = select("[data-player-shell]");
    var hls = null;
    var prepared = false;

    if (!video || !button || !stream) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function start() {
      prepare();
      video.controls = true;
      button.classList.add("is-hidden");

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    if (shell) {
      shell.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.FilmPlayer = {
    init: init
  };
})();
