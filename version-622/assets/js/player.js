(function () {
  function setup(shell) {
    var video = shell.querySelector('video[data-url]');
    var button = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-player-status]');
    var loaded = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function load() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      var url = video.getAttribute('data-url');
      setStatus('线路载入中');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放线路暂时不可用');
          }
        });
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.catch(function () {
          setStatus('请再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus('');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    video.addEventListener('loadedmetadata', function () {
      setStatus('');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video-shell]').forEach(setup);
  });
})();
