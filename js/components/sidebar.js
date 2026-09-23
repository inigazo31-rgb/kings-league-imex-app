// ============================================================================
// KINGS LEAGUE IMEX - SIDEBAR COMPONENT
// ============================================================================

import { store } from "../state/store.js";

export function renderSidebar(container, activeRoute = "home") {
  const user = store.currentUser;
  const league = store.league;
  const isMarketOpen = store.isMarketOpenNow();

  // Enlaces principales
  const navItems = [
    { id: "home", label: "Inicio", icon: "⌂", route: "#home" },
    { id: "matches", label: "Partidos", icon: "⚽", route: "#matches" },
    { id: "standings", label: "Clasificación", icon: "🏆", route: "#standings" },
    { id: "teams", label: "Equipos", icon: "🛡️", route: "#teams" },
    { id: "players", label: "Jugadores", icon: "👤", route: "#players" },
    { id: "scorers", label: "Goleadores", icon: "⚡", route: "#scorers" },
    { 
      id: "market", 
      label: "Mercado", 
      icon: "💰", 
      route: "#market",
      badge: isMarketOpen ? "ABIERTO" : "CERRADO",
      badgeClass: isMarketOpen ? "nav-badge-lime" : "nav-badge-red"
    },
    { id: "finance", label: "Finanzas", icon: "💳", route: "#finance" },
    { id: "bracket", label: "Fase Final", icon: "⚔️", route: "#bracket" },
    { id: "auction", label: "Draft en vivo", icon: "🎯", route: "#auction" },
    { id: "rules", label: "Reglamento", icon: "📖", route: "#rules" },
    { id: "announcements", label: "Anuncios", icon: "📢", route: "#announcements" },
  ];

  let roleItemsHtml = "";
  if (user.role === "PRESIDENT") {
    roleItemsHtml = `
      <div class="nav-section-title">PRESIDENCIA</div>
      <a href="#my-team" class="nav-item nav-my-team ${activeRoute === 'my-team' ? 'active' : ''}">
        <span class="nav-icon">🎮</span>
        <span>MI EQUIPO</span>
        <span class="nav-badge nav-badge-lime">MANAGER</span>
      </a>
    `;
  } else if (user.role === "PLAYER") {
    roleItemsHtml = `
      <div class="nav-section-title">JUGADOR</div>
      <a href="#my-profile" class="nav-item ${activeRoute === 'my-profile' ? 'active' : ''}">
        <span class="nav-icon">⭐</span>
        <span>MI PERFIL</span>
      </a>
    `;
  }

  // Admin section
  let adminSectionHtml = "";
  if (user.role === "ADMIN") {
    adminSectionHtml = `
      <div class="nav-section-title">CONTROL CENTRAL</div>
      <a href="#admin" class="nav-item nav-admin ${activeRoute === 'admin' ? 'active' : ''}">
        <span class="nav-icon">👑</span>
        <span>ORGANIZADOR</span>
        <span class="nav-badge nav-badge-yellow">MASTER</span>
      </a>
    `;
  }

  const generationLogoHtml = league.generationLogo
    ? `<img src="${league.generationLogo}" alt="Logo Generación" class="sidebar-logo-img" />`
    : `<div class="gen-logo-fallback" style="width: 44px; height: 44px; font-size: 1.2rem;">26</div>`;

  container.innerHTML = `
    <div class="sidebar-header">
      <a href="#home" class="sidebar-brand-link">
        ${generationLogoHtml}
        <div class="sidebar-brand-text">
          <span class="sidebar-brand-title">${league.name}</span>
          <span class="sidebar-brand-subtitle">${league.season}</span>
        </div>
      </a>
    </div>

    <nav class="sidebar-nav">
      ${roleItemsHtml}
      ${adminSectionHtml}

      <div class="nav-section-title">COMPETICIÓN</div>
      ${navItems.map((item) => `
        <a href="${item.route}" class="nav-item ${activeRoute === item.id ? 'active' : ''}" data-nav-id="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge ${item.badgeClass}">${item.badge}</span>` : ""}
        </a>
      `).join("")}
    </nav>

    <div class="sidebar-footer">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">ESTADO DE RED</span>
        <span style="font-size: 0.7rem; color: var(--color-lime); font-weight: 800; display: flex; align-items: center; gap: 0.3rem;">
          <span style="width: 6px; height: 6px; background: var(--color-lime); border-radius: 50%;"></span>
          EN LÍNEA (STORAGE)
        </span>
      </div>
    </div>
  `;

  // Cerrar sidebar en mobile al hacer click en enlace
  container.querySelectorAll(".nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      container.classList.remove("mobile-open");
    });
  });
}
