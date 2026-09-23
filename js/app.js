// ============================================================================
// KINGS LEAGUE IMEX - MAIN APPLICATION ENTRY POINT (APP.JS)
// ============================================================================

import { store } from "./state/store.js";
import { renderHeader, openRoleSwitcherModal } from "./components/header.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderBottomNav } from "./components/bottomNav.js";
import { toast } from "./components/toast.js";

// Vistas
import { renderHomeView } from "./views/homeView.js";
import { renderMatchesView } from "./views/matchesView.js";
import { renderStandingsView } from "./views/standingsView.js";
import { renderTeamsView } from "./views/teamsView.js";
import { renderPlayersView } from "./views/playersView.js";
import { renderScorersView } from "./views/scorersView.js";
import { renderMarketView } from "./views/marketView.js";
import { renderFinanceView } from "./views/financeView.js";
import { renderRulesView } from "./views/rulesView.js";
import { renderAnnouncementsView } from "./views/announcementsView.js";
import { renderBracketView } from "./views/bracketView.js";
import { renderAuctionView } from "./views/auctionView.js";
import { renderPresidentView } from "./views/presidentView.js";
import { renderPlayerProfileView } from "./views/playerProfileView.js";
import { renderAdminView } from "./views/adminView.js";

class App {
  constructor() {
    this.currentRoute = "home";
    this.headerContainer = null;
    this.sidebarContainer = null;
    this.bottomNavContainer = null;
    this.viewContainer = null;
  }

  init() {
    this.headerContainer = document.getElementById("appHeader");
    this.sidebarContainer = document.getElementById("appSidebar");
    this.bottomNavContainer = document.getElementById("appBottomNav");
    this.viewContainer = document.getElementById("appViewContainer");

    // Sincronización reactiva del Store
    store.subscribe(() => {
      this.renderNavigations();
      this.renderCurrentView();
    });

    // Enrutador Hash
    window.addEventListener("hashchange", () => this.handleRouting());
    window.addEventListener("storage", (event) => {
      if (event.key === "KINGS_LEAGUE_IMEX_STATE_V1") store.refreshSharedState();
    });

    // Inicializar navegación inicial
    this.handleRouting();

    // Notificación de bienvenida al cargar
    setTimeout(() => {
      toast.show(
        "KINGS LEAGUE IMEX",
        `Bienvenido a la plataforma oficial. Modo activo: ${store.currentUser.role}`,
        "lime"
      );
    }, 600);
  }

  handleRouting() {
    const rawHash = window.location.hash.replace("#", "") || "home";
    const route = rawHash.split("/")[0] || "home";

    // Validaciones de acceso por Rol
    if (route === "my-team" && store.currentUser.role !== "PRESIDENT") {
      toast.show("Acceso Restringido", "Debes acceder como Presidente para ver Mi Equipo.", "yellow");
      openRoleSwitcherModal();
      window.location.hash = "#home";
      return;
    }

    if (route === "admin" && store.currentUser.role !== "ADMIN") {
      toast.show("Acceso Restringido", "Solo el Organizador / Admin puede entrar a este panel.", "red");
      openRoleSwitcherModal();
      window.location.hash = "#home";
      return;
    }

    if (route === "my-profile" && store.currentUser.role !== "PLAYER") {
      toast.show("Acceso Restringido", "Selecciona el rol de Jugador para ver Mi Perfil.", "cyan");
      openRoleSwitcherModal();
      window.location.hash = "#home";
      return;
    }

    this.currentRoute = route;
    this.renderNavigations();
    this.renderCurrentView();

    // Scroll al tope de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderNavigations() {
    if (this.headerContainer) renderHeader(this.headerContainer);
    if (this.sidebarContainer) renderSidebar(this.sidebarContainer, this.currentRoute);
    if (this.bottomNavContainer) renderBottomNav(this.bottomNavContainer, this.currentRoute);
  }

  renderCurrentView() {
    if (!this.viewContainer) return;

    switch (this.currentRoute) {
      case "home":
        renderHomeView(this.viewContainer);
        break;
      case "matches":
        renderMatchesView(this.viewContainer);
        break;
      case "standings":
        renderStandingsView(this.viewContainer);
        break;
      case "teams":
        renderTeamsView(this.viewContainer);
        break;
      case "players":
        renderPlayersView(this.viewContainer);
        break;
      case "scorers":
        renderScorersView(this.viewContainer);
        break;
      case "market":
        renderMarketView(this.viewContainer);
        break;
      case "finance":
        renderFinanceView(this.viewContainer);
        break;
      case "rules":
        renderRulesView(this.viewContainer);
        break;
      case "announcements":
        renderAnnouncementsView(this.viewContainer);
        break;
      case "bracket":
        renderBracketView(this.viewContainer);
        break;
      case "auction":
        renderAuctionView(this.viewContainer);
        break;
      case "my-team":
        renderPresidentView(this.viewContainer);
        break;
      case "my-profile":
        renderPlayerProfileView(this.viewContainer);
        break;
      case "admin":
        renderAdminView(this.viewContainer);
        break;
      default:
        renderHomeView(this.viewContainer);
        break;
    }
  }
}

// Arrancar aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
