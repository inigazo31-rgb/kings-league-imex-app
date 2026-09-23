// ============================================================================
// KINGS LEAGUE IMEX - BOTTOM NAVIGATION COMPONENT (MOBILE)
// ============================================================================

import { store } from "../state/store.js";

export function renderBottomNav(container, activeRoute = "home") {
  const user = store.currentUser;

  let mySpaceRoute = "#standings";
  let mySpaceLabel = "Tabla";
  let mySpaceIcon = "🏆";

  if (user.role === "PRESIDENT") {
    mySpaceRoute = "#my-team";
    mySpaceLabel = "Mi Club";
    mySpaceIcon = "🎮";
  } else if (user.role === "PLAYER") {
    mySpaceRoute = "#my-profile";
    mySpaceLabel = "Mi Perfil";
    mySpaceIcon = "⭐";
  } else if (user.role === "ADMIN") {
    mySpaceRoute = "#admin";
    mySpaceLabel = "Admin";
    mySpaceIcon = "👑";
  }

  container.innerHTML = `
    <a href="#home" class="mob-nav-item ${activeRoute === 'home' ? 'active' : ''}">
      <span class="mob-nav-icon">⌂</span>
      <span>Inicio</span>
    </a>
    <a href="#matches" class="mob-nav-item ${activeRoute === 'matches' ? 'active' : ''}">
      <span class="mob-nav-icon">⚽</span>
      <span>Partidos</span>
    </a>
    <a href="${mySpaceRoute}" class="mob-nav-item ${activeRoute === mySpaceRoute.replace('#', '') ? 'active' : ''}">
      <span class="mob-nav-icon">${mySpaceIcon}</span>
      <span>${mySpaceLabel}</span>
    </a>
    <a href="#market" class="mob-nav-item ${activeRoute === 'market' ? 'active' : ''}">
      <span class="mob-nav-icon">💰</span>
      <span>Mercado</span>
    </a>
    <a href="#standings" class="mob-nav-item ${activeRoute === 'standings' ? 'active' : ''}">
      <span class="mob-nav-icon">🏆</span>
      <span>Tabla</span>
    </a>
  `;
}
