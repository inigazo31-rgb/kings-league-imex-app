// ============================================================================
// KINGS LEAGUE IMEX - MODAL COMPONENT
// ============================================================================

export class Modal {
  constructor() {
    this.overlay = null;
    this.previousFocus = null;
    this.init();
  }

  init() {
    let el = document.getElementById("globalModalOverlay");
    if (!el) {
      el = document.createElement("div");
      el.id = "globalModalOverlay";
      el.className = "modal-overlay";
      el.innerHTML = `
        <div class="modal-box" id="globalModalBox" role="dialog" aria-modal="true" aria-labelledby="globalModalTitle" tabindex="-1">
          <div class="modal-header">
            <h3 class="modal-title" id="globalModalTitle">Modal</h3>
            <button class="modal-close-btn" id="globalModalCloseBtn" aria-label="Cerrar">&times;</button>
          </div>
          <div class="modal-body" id="globalModalBody"></div>
          <div class="modal-footer" id="globalModalFooter"></div>
        </div>
      `;
      document.body.appendChild(el);
    }
    this.overlay = el;

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    const closeBtn = document.getElementById("globalModalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  open({ title, bodyHtml, footerHtml = "", size = "normal", onClose = null }) {
    this.previousFocus = document.activeElement;
    const titleEl = document.getElementById("globalModalTitle");
    const bodyEl = document.getElementById("globalModalBody");
    const footerEl = document.getElementById("globalModalFooter");
    const boxEl = document.getElementById("globalModalBox");

    this.onCloseCallback = onClose;

    if (titleEl) titleEl.innerHTML = title;
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    if (footerEl) {
      footerEl.innerHTML = footerHtml;
      footerEl.style.display = footerHtml ? "flex" : "none";
    }

    if (boxEl) {
      if (size === "large") {
        boxEl.classList.add("modal-box-lg");
      } else {
        boxEl.classList.remove("modal-box-lg");
      }
      boxEl.focus();
    }

    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.remove("active");
      document.body.style.overflow = "";
      if (typeof this.onCloseCallback === "function") {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
      if (this.previousFocus && typeof this.previousFocus.focus === "function") {
        this.previousFocus.focus();
      }
    }
  }

  isOpen() {
    return this.overlay && this.overlay.classList.contains("active");
  }
}

export const modal = new Modal();
