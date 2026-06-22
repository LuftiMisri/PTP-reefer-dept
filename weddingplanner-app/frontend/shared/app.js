function formatRM(amount) {
  return 'RM' + Math.round(Number(amount || 0)).toLocaleString('en-MY', { maximumFractionDigits: 0 });
}

function setLoading(elementId, isLoading) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.toggle('hidden', !isLoading);
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = '/auth/';
    return null;
  }

  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    throw new Error((data && data.error) || 'Request failed.');
  }
  return data;
}

function initMusicToggle(buttonId, audioId) {
  const button = document.getElementById(buttonId);
  const audio = document.getElementById(audioId);
  if (!button || !audio) return;

  const TIME_KEY = 'wedplan-music-time';
  const STATE_KEY = 'wedplan-music';

  audio.loop = true;
  audio.volume = 0.4;

  function setIcon(playing) {
    button.textContent = playing ? '🔊' : '🔇';
    button.title = playing ? 'Pause background music' : 'Play background music';
  }

  function resumeFromSavedPosition() {
    const savedTime = parseFloat(localStorage.getItem(TIME_KEY));
    if (!isNaN(savedTime) && savedTime > 0) {
      audio.currentTime = savedTime;
    }
  }

  if (audio.readyState >= 1) {
    resumeFromSavedPosition();
  } else {
    audio.addEventListener('loadedmetadata', resumeFromSavedPosition, { once: true });
  }

  const wasPlaying = localStorage.getItem(STATE_KEY) === 'on';
  if (wasPlaying) {
    audio.play().then(() => setIcon(true)).catch(() => setIcon(false));
  } else {
    setIcon(false);
  }

  audio.addEventListener('error', () => {
    button.disabled = true;
    button.title = 'Add bergema-selamanya.mp3 to frontend/shared/audio/ to enable music';
    button.classList.add('opacity-40', 'cursor-not-allowed');
  });

  // Persist playback position periodically and right before navigating away,
  // so the next page can resume instead of restarting from 0:00.
  audio.addEventListener('timeupdate', () => {
    localStorage.setItem(TIME_KEY, audio.currentTime);
  });
  window.addEventListener('pagehide', () => {
    localStorage.setItem(TIME_KEY, audio.currentTime);
  });

  button.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setIcon(true);
        localStorage.setItem(STATE_KEY, 'on');
      } catch (e) {
        setIcon(false);
      }
    } else {
      audio.pause();
      setIcon(false);
      localStorage.setItem(STATE_KEY, 'off');
      localStorage.setItem(TIME_KEY, audio.currentTime);
    }
  });
}
