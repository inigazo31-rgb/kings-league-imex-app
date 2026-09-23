// ============================================================================
// KINGS LEAGUE IMEX - PLAYER PROFILE VIEW ("MI PERFIL")
// ============================================================================

import { store } from "../state/store.js";

export function renderPlayerProfileView(container) {
  const user = store.currentUser;
  const playerId = user.playerId || store.players[0]?.id;
  const player = store.getPlayerById(playerId);

  if (!player) {
    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">PERFIL NO DISPONIBLE</span>
            <h1 class="page-title">⚠️ PERFIL DE JUGADOR</h1>
            <p class="page-subtitle">No se encontró al jugador asociado a este perfil.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const team = store.getTeamById(player.teamId);

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">ESPACIO DEL JUGADOR</span>
          <h1 class="page-title">⭐ MI PERFIL DE FUTBOLISTA</h1>
          <p class="page-subtitle">Estadísticas personales, valor de cláusula y estado en la competición escolar.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; max-width: 960px; margin: 0 auto;">
        <!-- Tarjeta Gigante de Colección -->
        <div class="player-card ${player.isInsignia ? 'is-insignia' : ''}" style="padding: 2rem;">
          <div class="player-card-header" style="margin-bottom: 1.5rem;">
            <span class="player-pos-badge pos-${player.position.toLowerCase()}" style="font-size: 0.9rem; padding: 0.35rem 0.85rem;">${player.position}</span>
            ${
              player.isInsignia
                ? `<span class="player-insignia-badge" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">⭐ JUGADOR INSIGNIA</span>`
                : `<span class="badge badge-lime" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">TRANSFERIBLE</span>`
            }
          </div>

          <div class="player-visual" style="height: 180px; margin-bottom: 1.5rem;">
            <span class="player-big-number" style="font-size: 9rem;">${player.number}</span>
            <div class="player-avatar-circle" style="width: 120px; height: 120px; font-size: 3.5rem;">
              ${player.isInsignia ? '👑' : '⚽'}
            </div>
          </div>

          <div class="player-info" style="text-align: center; margin-bottom: 1.5rem;">
            <div class="player-team-pill" style="justify-content: center; font-size: 0.9rem;">
              <span>${team?.logoText || '⚽'}</span>
              <span>${team?.name || 'Agente Libre'}</span>
            </div>
            <div class="player-name" style="font-size: 1.6rem; white-space: normal;">${player.name}</div>
          </div>

          <div class="player-value-strip" style="padding: 0.85rem 1.25rem;">
            <span class="player-value-label" style="font-size: 0.8rem;">Cláusula de Mercado:</span>
            <span class="player-value-amount" style="font-size: 1.8rem;">${player.value}M</span>
          </div>
        </div>

        <!-- Estadísticas y Trayectoria -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.5rem; clip-path: var(--clip-chamfer);">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem; text-transform: uppercase;">
              Rendimiento en Temporada 2026
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--color-lime); font-weight: 900; line-height: 1;">${player.goals}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-top: 0.35rem;">Goles Marcados</div>
              </div>

              <div style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 2.5rem; color: #fff; font-weight: 900; line-height: 1;">${player.assists || 0}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-top: 0.35rem;">Asistencias</div>
              </div>

              <div style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--color-yellow); font-weight: 900; line-height: 1;">${player.matchesPlayed || 1}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-top: 0.35rem;">Partidos Jugados</div>
              </div>

              <div style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: var(--radius-xs); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 2.2rem; color: #fff; font-weight: 900; line-height: 1;">
                  ${player.yellowCards}🟨 ${player.redCards}🟥
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-top: 0.35rem;">Amonestaciones</div>
              </div>
            </div>
          </div>

          <!-- Estado de Blindaje -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 0.65rem; text-transform: uppercase;">
              Estado Contractual
            </h4>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              ${
                player.isInsignia
                  ? `⭐ Eres el <strong>Jugador Insignia</strong> de ${team?.name}. Tu contrato está blindado ante cualquier clausulazo o intento de compra rival. Solo podrás ser transferido en la subasta final si tu club resulta eliminado.`
                  : `⚡ Tu ficha está catalogada como <strong>Transferible</strong>. Los clubes rivales pueden enviar propuestas de compra o ejecutar un clausulazo pagando tu cláusula de rescisión (${player.value}M).`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
