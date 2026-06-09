(() => {
  const shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const overlay = shell.querySelector("[data-play-overlay]");
  const button = shell.querySelector("[data-play-button]");
  const status = shell.querySelector("[data-player-status]");
  const stream = shell.getAttribute("data-stream");
  let ready = false;
  let instance = null;

  const setStatus = (text) => {
    if (status) {
      status.textContent = text;
    }
  };

  const attach = () => {
    if (!video || !stream || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(stream);
      instance.attachMedia(video);
      instance.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          setStatus("播放暂时不可用");
        }
      });
      return;
    }

    video.src = stream;
  };

  const start = () => {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      video.play().catch(() => {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
        setStatus("点击开始播放");
      });
    }
  };

  if (button) {
    button.addEventListener("click", start);
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("play", () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setStatus("");
    });
    video.addEventListener("pause", () => {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  window.addEventListener("beforeunload", () => {
    if (instance) {
      instance.destroy();
    }
  });
})();
