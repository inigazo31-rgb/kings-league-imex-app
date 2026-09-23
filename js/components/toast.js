// ============================================================================
// KINGS LEAGUE IMEX - TOAST NOTIFICATION COMPONENT
// ============================================================================

export class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let el = document.getElementById("globalToastContainer");
    if (!el) {
      el = document.createElement("div");
      el.id = "globalToastContainer";
      el.className = "toast-container";
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(title, message, type = "lime", duration = 4000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "⚡";
    if (type === "red") icon = "🚨";
    if (type === "yellow") icon = "👑";
    if (type === "cyan") icon = "💎";

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

export const toast = new ToastManager();
