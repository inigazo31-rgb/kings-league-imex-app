// ============================================================================
// KINGS LEAGUE IMEX - TOURNAMENT BRACKET VIEW (FASE FINAL)
// ============================================================================

import { store } from "../state/store.js";

export function renderBracketView(container) {
  const standingsA = store.getStandings("A");
  const standingsB = store.getStandings("B");

  const semi1 = store.matches.find((m) => m.id === "match-semi-1");
  const semi2 = store.matches.find((m) => m.id === "match-semi-2");
  const grandFinal = store.matches.find((m) => m.id === "match-final");

  const team1A = standingsA[0]?.team;
  const team2A = standingsA[1]?.team;
  const team1B = standingsB[0]?.team;
  const team2B = standingsB[1]?.team;

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">PLAYOFFS & CAMINO A LA GLORIA</span>
          <h1 class="page-title">⚔️ CUADRO DE COMPETICIÓN (BRACKET)</h1>
          <p class="page-subtitle">Estructura del torneo escolar: Fase de Grupos &rarr; Semifinales Cruzadas &rarr; Gran Final.</p>
        </div>
      </div>

      <div class="bracket-wrapper">
        <!-- 1. FASE DE GRUPOS -->
        <div class="bracket-stage-title">
          <span>🛡️</span>
          <span>PASO 1: FASE DE GRUPOS (CLASIFICAN LOS 2 MEJORES DE CADA GRUPO)</span>
        </div>

        <div class="groups-bracket-grid">
          <!-- Grupo A -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-chamfer);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); color: var(--color-yellow); font-size: 1rem; font-weight: 800;">GRUPO A</h4>
              <span class="badge badge-lime">2 A SEMIS</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${standingsA.map((st, i) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: ${i < 2 ? 'rgba(0, 255, 102, 0.06)' : 'var(--bg-tertiary)'}; border-left: 3px solid ${i < 2 ? 'var(--color-lime)' : 'var(--border-subtle)'}; border-radius: 4px;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-weight: 800; color: ${i < 2 ? 'var(--color-lime)' : 'var(--text-muted)'}; width: 18px;">#${st.pos}</span>
                    <span style="font-weight: 700; color: #fff;">${st.name}</span>
                  </div>
                  <span style="font-family: var(--font-display); font-size: 1.2rem; color: #fff; font-weight: 800;">${st.pts} PTS</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Grupo B -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-chamfer);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
              <h4 style="font-family: var(--font-heading); color: #38BDF8; font-size: 1rem; font-weight: 800;">GRUPO B</h4>
              <span class="badge badge-lime">2 A SEMIS</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${standingsB.map((st, i) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: ${i < 2 ? 'rgba(0, 255, 102, 0.06)' : 'var(--bg-tertiary)'}; border-left: 3px solid ${i < 2 ? 'var(--color-lime)' : 'var(--border-subtle)'}; border-radius: 4px;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-weight: 800; color: ${i < 2 ? 'var(--color-lime)' : 'var(--text-muted)'}; width: 18px;">#${st.pos}</span>
                    <span style="font-weight: 700; color: #fff;">${st.name}</span>
                  </div>
                  <span style="font-family: var(--font-display); font-size: 1.2rem; color: #fff; font-weight: 800;">${st.pts} PTS</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- 2. SEMIFINALES CRUZADAS -->
        <div class="bracket-stage-title">
          <span>🔥</span>
          <span>PASO 2: SEMIFINALES CRUZADAS (A PARTIDO ÚNICO)</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
          <!-- Semifinal 1 -->
          <div class="bracket-match-node">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem; font-size: 0.72rem; color: var(--color-yellow); font-weight: 800;">
              <span>SEMIFINAL 1</span>
              <span>📅 ${semi1?.date || '01-OCT'} &bull; ⏰ ${semi1?.time || '10:30'}</span>
            </div>
            <div class="bracket-team-row">
              <span style="font-weight: 800; color: #fff;">${team1A?.name || '1° Grupo A (Los Cuervos)'}</span>
              <span class="badge badge-metallic">1° GRUPO A</span>
            </div>
            <div style="text-align: center; font-family: var(--font-display); font-size: 1.1rem; color: var(--color-lime); padding: 0.2rem 0;">VS</div>
            <div class="bracket-team-row">
              <span style="font-weight: 800; color: #fff;">${team2B?.name || '2° Grupo B (Halcones)'}</span>
              <span class="badge badge-metallic">2° GRUPO B</span>
            </div>
          </div>

          <!-- Semifinal 2 -->
          <div class="bracket-match-node">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem; font-size: 0.72rem; color: var(--color-yellow); font-weight: 800;">
              <span>SEMIFINAL 2</span>
              <span>📅 ${semi2?.date || '01-OCT'} &bull; ⏰ ${semi2?.time || '11:15'}</span>
            </div>
            <div class="bracket-team-row">
              <span style="font-weight: 800; color: #fff;">${team1B?.name || '1° Grupo B (Galácticos)'}</span>
              <span class="badge badge-metallic">1° GRUPO B</span>
            </div>
            <div style="text-align: center; font-family: var(--font-display); font-size: 1.1rem; color: var(--color-lime); padding: 0.2rem 0;">VS</div>
            <div class="bracket-team-row">
              <span style="font-weight: 800; color: #fff;">${team2A?.name || '2° Grupo A (Rayo Imperial)'}</span>
              <span class="badge badge-metallic">2° GRUPO A</span>
            </div>
          </div>
        </div>

        <!-- 3. GRAN FINAL & CAMPEÓN -->
        <div class="bracket-stage-title">
          <span>👑</span>
          <span>PASO 3: GRAN FINAL & SUBASTA DE REFUERZOS</span>
        </div>

        <div style="max-width: 600px; margin: 0 auto; width: 100%;">
          <div style="background: linear-gradient(160deg, #1F190B 0%, #110E05 100%); border: 2px solid #FFD700; border-radius: var(--radius-sm); padding: 2rem; text-align: center; clip-path: var(--clip-chamfer); box-shadow: 0 0 35px rgba(255, 215, 0, 0.25);">
            <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: #FFD700; letter-spacing: 2px;">
              GRAN FINAL KINGS LEAGUE IMEX
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
              Estadio IMEX &bull; Cancha Principal &bull; 📅 08 de Octubre &bull; Con Previa de Subasta
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: var(--radius-xs); border: 1px solid rgba(255,215,0,0.3);">
                <div style="font-size: 0.7rem; color: var(--color-yellow); font-weight: 800;">FINALISTA 1</div>
                <div style="font-weight: 800; color: #fff; font-size: 1.1rem; margin-top: 0.25rem;">Ganador Semifinal 1</div>
              </div>

              <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--color-lime);">VS</div>

              <div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: var(--radius-xs); border: 1px solid rgba(255,215,0,0.3);">
                <div style="font-size: 0.7rem; color: var(--color-yellow); font-weight: 800;">FINALISTA 2</div>
                <div style="font-weight: 800; color: #fff; font-size: 1.1rem; margin-top: 0.25rem;">Ganador Semifinal 2</div>
              </div>
            </div>

            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; background: rgba(255, 215, 0, 0.15); border: 1px solid #FFD700; border-radius: 999px;">
              <span>🏆</span>
              <span style="font-size: 0.8rem; font-weight: 800; color: #FFD700; letter-spacing: 1px;">PREMIO: COPA IMEX 2026 + ANILLO DE CAMPEÓN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
