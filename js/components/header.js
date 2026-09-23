// ============================================================================
// KINGS LEAGUE IMEX - HEADER COMPONENT
// ============================================================================

import { store } from "../state/store.js";
import { modal } from "./modal.js";
import { toast } from "./toast.js";

const closeNotificationDropdown = (event) => {
  const dropdowns = document.querySelectorAll(".notif-dropdown.show");
  dropdowns.forEach((dropdown) => {
    const button = document.querySelector("#btnNotifBell");
    if (!dropdown.contains(event.target) && event.target !== button) {
      dropdown.classList.remove("show");
    }
  });
};

if (!document.body.dataset.notif_global_listener_bound) {
  document.addEventListener("click", closeNotificationDropdown);
  document.body.dataset.notif_global_listener_bound = "true";
}

export function renderHeader(container) {
  const user = store.currentUser;
  const league = store.league;
  const unreadNotifs = store.notifications.filter((n) => !n.read).length;

  const generationLogoHtml = league.generationLogo
    ? `<img src="${league.generationLogo}" alt="Logo Generación" class="gen-logo-preview" id="genLogoPreviewImg" />`
    : `<div class="gen-logo-fallback" id="genLogoFallbackBadge">26</div>`;

  let roleClass = "";
  let roleIcon = "👤";
  if (user.role === "ADMIN") {
    roleClass = "role-admin";
    roleIcon = "👑";
  } else if (user.role === "PRESIDENT") {
    roleClass = "role-president";
    roleIcon = "🛡️";
  } else if (user.role === "PLAYER") {
    roleClass = "role-player";
    roleIcon = "⭐";
  }

  container.innerHTML = `
    <div class="header-left">
      <button class="mobile-menu-btn" id="btnMobileMenuToggle" aria-label="Abrir Menú">
        ☰
      </button>

      <!-- Componente Prominente: GENERATION LOGO -->
      <div class="generation-logo-slot" id="generationLogoSlot" title="Personalizar Logo de la Generación">
        ${generationLogoHtml}
        <div class="gen-logo-text">
          <span class="gen-logo-label">GENERACIÓN</span>
          <span class="gen-logo-sub">IMEX 2026</span>
        </div>
      </div>

      <div class="header-brand-mobile">
        KINGS LEAGUE IMEX
      </div>
    </div>

    <div class="header-right">
      <div class="season-badge">
        <span class="dot"></span>
        <span>${league.season}</span>
      </div>

      <!-- Selector de Rol -->
      <button class="role-badge-btn ${roleClass}" id="btnOpenRoleSwitcher" title="Cambiar Rol de Usuario">
        <span>${roleIcon}</span>
        <span>${user.role}</span>
        <span style="font-size: 0.65rem; opacity: 0.7;">▼</span>
      </button>

      <!-- Centro de Notificaciones -->
      <div class="notif-wrapper">
        <button class="notif-btn" id="btnNotifBell" title="Notificaciones">
          🔔
          ${unreadNotifs > 0 ? `<span class="notif-counter">${unreadNotifs}</span>` : ""}
        </button>

        <div class="notif-dropdown" id="notifDropdown">
          <div class="notif-header">
            <h4>NOTIFICACIONES (${store.notifications.length})</h4>
            <button class="notif-clear-btn" id="btnMarkAllNotifsRead">Marcar Leídas</button>
          </div>
          <div class="notif-list" id="notifListContainer">
            ${
              store.notifications.length === 0
                ? `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">Sin notificaciones</div>`
                : store.notifications.map((n) => `
                  <div class="notif-item ${!n.read ? 'unread' : ''}">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-msg">${n.message}</div>
                    <div class="notif-time">${n.time}</div>
                  </div>
                `).join("")
            }
          </div>
        </div>
      </div>

      <!-- User Avatar / Pill -->
      <div class="user-avatar-pill" id="userPillBtn">
        <div class="user-avatar-img">${user.avatar || '👤'}</div>
        <div class="user-avatar-meta">
          <span class="user-avatar-name">${user.name.split(' ')[0]}</span>
          <span class="user-avatar-role">${user.role}</span>
        </div>
      </div>
    </div>
  `;

  // --- LISTENERS ---
  const mobileMenuBtn = container.querySelector("#btnMobileMenuToggle");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      const sidebar = document.querySelector(".app-sidebar");
      if (sidebar) sidebar.classList.toggle("mobile-open");
    });
  }

  // Notificaciones dropdown toggle
  const notifBtn = container.querySelector("#btnNotifBell");
  const notifDropdown = container.querySelector("#notifDropdown");
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("show");
    });

  }

  const markAllReadBtn = container.querySelector("#btnMarkAllNotifsRead");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", () => {
      store.markAllNotificationsRead();
      toast.show("Notificaciones", "Todas las alertas marcadas como leídas", "lime");
      renderHeader(container);
    });
  }

  // Configurar Generation Logo
  const genLogoSlot = container.querySelector("#generationLogoSlot");
  if (genLogoSlot) {
    genLogoSlot.addEventListener("click", () => openGenerationLogoModal());
  }

  // Selector de Rol
  const roleBtn = container.querySelector("#btnOpenRoleSwitcher");
  const userPill = container.querySelector("#userPillBtn");
  if (roleBtn) roleBtn.addEventListener("click", () => openRoleSwitcherModal());
  if (userPill) userPill.addEventListener("click", () => openRoleSwitcherModal());
}

// Modal de Carga de Logo de Generación
export function openGenerationLogoModal() {
  if (store.currentUser.role !== "ADMIN") {
    toast.show("Acceso restringido", "Solo el organizador puede cambiar el logo.", "yellow");
    return;
  }
  const currentLogo = store.league.generationLogo || "";
  modal.open({
    title: "GENERATION LOGO - IDENTIDAD IMEX",
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="color: var(--text-secondary); font-size: 0.85rem;">
          Personaliza el escudo oficial de la generación. Este logo aparecerá en el encabezado, portada, dashboard del torneo y pantallas de acceso.
        </p>
        
        <div style="display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: var(--bg-tertiary); border: 1px dashed var(--border-medium); border-radius: var(--radius-sm); text-align: center;">
          <div id="modalLogoPreviewBox" style="width: 90px; height: 90px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #000; border: 1px solid var(--border-medium); overflow: hidden;">
            ${currentLogo ? `<img src="${currentLogo}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span style="font-family: var(--font-display); font-size: 2rem; color: var(--color-yellow);">26</span>`}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Opción 1: Subir Archivo de Imagen</label>
          <input type="file" id="inputGenLogoFile" accept="image/*" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Opción 2: URL Directa de Imagen</label>
          <input type="url" id="inputGenLogoUrl" class="form-control" placeholder="https://ejemplo.com/logo-generacion.png" value="${currentLogo}" />
        </div>
      </div>
    `,
    footerHtml: `
      <button class="btn btn-outline" id="btnRemoveLogo">Restablecer Badge 2026</button>
      <button class="btn btn-lime" id="btnSaveLogo">Guardar Logo</button>
    `,
  });

  const fileInput = document.getElementById("inputGenLogoFile");
  const urlInput = document.getElementById("inputGenLogoUrl");
  const previewBox = document.getElementById("modalLogoPreviewBox");
  let selectedBase64 = currentLogo;

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          selectedBase64 = re.target.result;
          previewBox.innerHTML = `<img src="${selectedBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const saveBtn = document.getElementById("btnSaveLogo");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const finalUrl = urlInput.value.trim() || selectedBase64;
      store.setGenerationLogo(finalUrl);
      toast.show("Identidad Actualizada", "El logo de la generación se guardó correctamente.", "lime");
      modal.close();
      const headerEl = document.querySelector(".app-header");
      if (headerEl) renderHeader(headerEl);
    });
  }

  const removeBtn = document.getElementById("btnRemoveLogo");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      store.setGenerationLogo(null);
      toast.show("Identidad", "Logo restablecido al badge predeterminado.", "yellow");
      modal.close();
      const headerEl = document.querySelector(".app-header");
      if (headerEl) renderHeader(headerEl);
    });
  }
}

// Modal de Cambio Rápido de Rol
export function openRoleSwitcherModal() {
  const currentRole = store.currentUser.role;
  const currentTeamId = store.currentUser.teamId;

  const teamsOptions = store.teams.map((t) => `
    <option value="${t.id}" ${currentTeamId === t.id ? 'selected' : ''}>
      ${t.logoText} ${t.name} (Pres: ${t.president})
    </option>
  `).join("");

  const playersOptions = store.players.slice(0, 16).map((p) => `
    <option value="${p.id}" ${store.currentUser.playerId === p.id ? 'selected' : ''}>
      ${p.isInsignia ? '⭐' : '⚽'} ${p.name} (#${p.number} - ${store.getTeamById(p.teamId)?.shortName || 'LIB'})
    </option>
  `).join("");

  const adminLoginFields = `
    <div class="form-group" style="margin-top: 1rem;">
      <label class="form-label">Usuario administrador</label>
      <input id="inputAdminUsername" class="form-control" type="text" placeholder="organizador" />
    </div>
    <div class="form-group">
      <label class="form-label">Contraseña</label>
      <input id="inputAdminPassword" class="form-control" type="password" placeholder="••••••••" />
    </div>
  `;

  const presidentLoginFields = `
    <div class="form-group" style="margin-top: 1rem;">
      <label class="form-label">Usuario presidente</label>
      <input id="inputPresiUsername" class="form-control" type="text" placeholder="cuervos_presi" />
    </div>
    <div class="form-group">
      <label class="form-label">Contraseña</label>
      <input id="inputPresiPassword" class="form-control" type="password" placeholder="••••••••" />
    </div>
  `;

  modal.open({
    title: "CONTROL DE ACCESO & SELECCIÓN DE ROL",
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="color: var(--text-secondary); font-size: 0.85rem;">
          Prueba de inmediato la plataforma desde cualquiera de las cuatro perspectivas de la competición:
        </p>

        <!-- Presets de 1-click -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <button class="btn btn-outline ${currentRole === 'GUEST' ? 'btn-outline-lime' : ''}" id="switchRoleGuest" style="padding: 1rem; text-align: left; justify-content: flex-start;">
            <span style="font-size: 1.5rem;">👤</span>
            <div>
              <div style="font-size: 0.9rem; font-weight: 800;">VISITANTE</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: none;">Consulta pública general</div>
            </div>
          </button>

          <button class="btn btn-outline ${currentRole === 'ADMIN' ? 'btn-yellow' : ''}" id="switchRoleAdmin" style="padding: 1rem; text-align: left; justify-content: flex-start;">
            <span style="font-size: 1.5rem;">👑</span>
            <div>
              <div style="font-size: 0.9rem; font-weight: 800;">ORGANIZADOR</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: none;">Control total / Master Admin</div>
            </div>
          </button>
        </div>

        <div class="form-group" style="margin-top: 0.5rem;">
          <label class="form-label">Acceder como Presidente de Club:</label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <select id="selectPresiTeam" class="form-select" style="min-width: 190px; flex: 1;">
              ${teamsOptions}
            </select>
          </div>
          ${presidentLoginFields}
          <button class="btn btn-lime" id="btnConfirmPresiRole" style="width: 100%; margin-top: 0.25rem;">
            Entrar como Presidente
          </button>
        </div>

        <div class="form-group">
          <label class="form-label">Acceder como Jugador:</label>
          <div style="display: flex; gap: 0.5rem;">
            <select id="selectPlayerUser" class="form-select">
              ${playersOptions}
            </select>
            <button class="btn btn-outline-lime" id="btnConfirmPlayerRole" style="white-space: nowrap;">
              Entrar
            </button>
          </div>
        </div>

        ${adminLoginFields}
      </div>
    `,
    footerHtml: `
      <button class="btn btn-outline" onclick="document.getElementById('globalModalCloseBtn').click()">Cerrar</button>
    `,
  });

  document.getElementById("switchRoleGuest")?.addEventListener("click", () => {
    store.switchRole("GUEST");
    toast.show("Sesión", "Has iniciado como Visitante", "lime");
    modal.close();
    window.location.hash = "#home";
  });

  document.getElementById("switchRoleAdmin")?.addEventListener("click", async () => {
    const username = document.getElementById("inputAdminUsername")?.value || "";
    const password = document.getElementById("inputAdminPassword")?.value || "";
    const user = await store.authenticateUser({ username, password, role: "ADMIN" });

    if (!user) {
      toast.show("Acceso denegado", "Usuario y contraseña de Organizador incorrectos.", "red");
      return;
    }

    try {
      store.switchRole("ADMIN", null, user);
    } catch (error) {
      toast.show("Acceso denegado", error.message, "red");
      return;
    }
    toast.show("Sesión Master", "Has iniciado como Organizador de la Liga", "yellow");
    modal.close();
    window.location.hash = "#admin";
  });

  document.getElementById("btnConfirmPresiRole")?.addEventListener("click", async () => {
    const teamId = document.getElementById("selectPresiTeam").value;
    const username = document.getElementById("inputPresiUsername")?.value || "";
    const password = document.getElementById("inputPresiPassword")?.value || "";
    const user = await store.authenticateUser({ username, password, role: "PRESIDENT", teamId });

    if (!user) {
      toast.show("Acceso denegado", "Credenciales de presidente incorrectas.", "red");
      return;
    }

    try {
      store.switchRole("PRESIDENT", teamId, user);
    } catch (error) {
      toast.show("Acceso denegado", error.message, "red");
      return;
    }
    toast.show("Sesión Presidente", `Has iniciado como Presidente del club`, "lime");
    modal.close();
    window.location.hash = "#my-team";
  });

  document.getElementById("btnConfirmPlayerRole")?.addEventListener("click", () => {
    const playerId = document.getElementById("selectPlayerUser").value;
    store.switchRole("PLAYER", playerId);
    toast.show("Sesión Jugador", "Has iniciado con tu perfil de jugador", "cyan");
    modal.close();
    window.location.hash = "#my-profile";
  });
}
