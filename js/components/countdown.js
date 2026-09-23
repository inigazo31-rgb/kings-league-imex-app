// ============================================================================
// KINGS LEAGUE IMEX - LIVE COUNTDOWN TIMER HELPER
// ============================================================================

export function startLiveCountdown(targetDateStr, containerEl, onFinish = null) {
  if (!containerEl) return null;

  function update() {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      containerEl.innerHTML = `
        <div class="countdown-digits" style="color: var(--color-lime); font-size: 1.2rem;">
          ¡EN JUEGO / ABIERTO!
        </div>
      `;
      if (typeof onFinish === "function") onFinish();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, "0");

    let daysHtml = "";
    if (days > 0) {
      daysHtml = `
        <div class="countdown-box">
          <span class="countdown-digits">${pad(days)}</span>
          <span class="countdown-label">DÍAS</span>
        </div>
        <span class="countdown-sep">:</span>
      `;
    }

    containerEl.innerHTML = `
      <div class="countdown-container">
        ${daysHtml}
        <div class="countdown-box">
          <span class="countdown-digits">${pad(hours)}</span>
          <span class="countdown-label">HORAS</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-box">
          <span class="countdown-digits">${pad(minutes)}</span>
          <span class="countdown-label">MIN</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-box">
          <span class="countdown-digits">${pad(seconds)}</span>
          <span class="countdown-label">SEG</span>
        </div>
      </div>
    `;
  }

  update();
  const intervalId = setInterval(update, 1000);
  return intervalId;
}
