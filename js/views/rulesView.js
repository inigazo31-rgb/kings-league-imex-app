// ============================================================================
// KINGS LEAGUE IMEX - RULES VIEW (CARTAS, DADOS & REGLAMENTO)
// ============================================================================

import { store } from "../state/store.js";

export function renderRulesView(container) {
  let activeTab = "cards"; // 'cards', 'dice', 'rulebook'

  function update() {
    const cards = store.rulesCards;
    const diceRules = store.diceRules;

    let tabContent = "";

    if (activeTab === "cards") {
      tabContent = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          ${cards.map((c) => `
            <div class="kings-card" style="border-top: 4px solid ${c.badgeColor};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span class="kings-card-icon">${c.icon}</span>
                <span class="badge" style="background: rgba(255,255,255,0.08); color: ${c.badgeColor}; border: 1px solid ${c.badgeColor};">
                  ${c.rarity.toUpperCase()}
                </span>
              </div>
              <h3 class="kings-card-name">${c.name}</h3>
              <div class="kings-card-timing">⏱️ ${c.timing}</div>
              <p class="kings-card-desc">${c.description}</p>
              <div class="kings-card-meta">
                <span style="color: var(--text-muted); font-weight: 700;">DURACIÓN:</span>
                <span style="color: var(--color-lime); font-weight: 800;">${c.duration}</span>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } else if (activeTab === "dice") {
      tabContent = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          ${diceRules.map((d) => `
            <div class="kings-card" style="border-top: 4px solid var(--color-cyan);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="font-size: 3rem; color: var(--color-cyan); line-height: 1;">${d.symbol}</span>
                <span class="badge badge-cyan">${d.intensity}</span>
              </div>
              <h3 class="kings-card-name">${d.roll}</h3>
              <div class="kings-card-timing">🎲 ${d.timeframe}</div>
              <p class="kings-card-desc">${d.description}</p>
              <div class="kings-card-meta">
                <span style="color: var(--text-muted); font-weight: 700;">FORMATO:</span>
                <span style="color: var(--color-cyan); font-weight: 800;">Fútbol 7 Dinámico</span>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } else if (activeTab === "rulebook") {
      tabContent = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem; max-width: 900px;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--color-yellow); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
              1. FORMATO Y TERRENO DE JUEGO
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              KINGS LEAGUE IMEX es una liga de fútbol 7 disputada en las canchas escolares según el calendario oficial. Cada partido consta de 2 tiempos de 20 minutos con 3 minutos de descanso. El saque inicial se realiza estilo waterpolo: los dos equipos corren desde sus porterías hacia el balón situado en el centro.
            </p>
          </div>

          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--color-lime); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
              2. SISTEMA ECONÓMICO Y DRAFT (200 MILLONES)
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Cada presidente arranca con una cartera de 200 Millones que debe distribuir entre los 7 futbolistas de su plantilla. Las victorias otorgan +50M, los empates +10M y las derrotas +0M. Este dinero se acumula para la ventana semanal de fichajes.
            </p>
          </div>

          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--color-red); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
              3. CLAUSULAZOS Y JUGADORES INSIGNIA ⭐
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Cada equipo tiene derecho a 1 solo clausulazo por mercado semanal. El club abona íntegro el valor de cláusula del jugador objetivo y el traspaso es automático e incondicional. Los <strong>Jugadores Insignia ⭐</strong> están 100% blindados y no pueden recibir clausulazo ni ser transferidos mientras su equipo siga vivo en el torneo.
            </p>
          </div>

          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: #38BDF8; font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
              4. DADOS DINÁMICOS (MINUTO 18)
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              En el minuto 18 del primer tiempo se detiene el juego y el árbitro o comité lanza el dado oficial. Según la cara resultante (1vs1, 2vs2, 3vs3 o 4vs4), los equipos ajustan su alineación durante 2 minutos hasta el silbatazo de entretiempo.
            </p>
          </div>

          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); color: var(--color-gold); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
              5. SUBASTA FINAL DE PLAYOFFS
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Al concluir las semifinales, los equipos eliminados ponen a disposición a sus mejores figuras (incluyendo insignias ya desprotegidos). Los dos clubes clasificados a la Gran Final compiten en una subasta en vivo para fichar a sus refuerzos de oro antes de disputar el título.
            </p>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">DINÁMICAS & BASES DE COMPETICIÓN</span>
            <h1 class="page-title">📖 REGLAMENTO, CARTAS & DADOS</h1>
            <p class="page-subtitle">Todo lo que hace única a la KINGS LEAGUE IMEX: cartas secretas, dados dinámicos y reglas de torneo.</p>
          </div>

          <div class="tab-nav" id="rulesTabNav">
            <button class="tab-btn ${activeTab === 'cards' ? 'active' : ''}" data-tab="cards">🃏 CARTAS SECRETAS</button>
            <button class="tab-btn ${activeTab === 'dice' ? 'active' : ''}" data-tab="dice">🎲 DADOS DINÁMICOS</button>
            <button class="tab-btn ${activeTab === 'rulebook' ? 'active' : ''}" data-tab="rulebook">📜 REGLAMENTO OFICIAL</button>
          </div>
        </div>

        <div id="rulesTabContentContainer">
          ${tabContent}
        </div>
      </div>
    `;

    container.querySelectorAll("#rulesTabNav .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        update();
      });
    });
  }

  update();
}
