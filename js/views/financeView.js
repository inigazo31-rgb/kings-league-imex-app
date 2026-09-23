// ============================================================================
// KINGS LEAGUE IMEX - FINANCE VIEW (SISTEMA ECONÓMICO & TESORERÍAS)
// ============================================================================

import { store } from "../state/store.js";

export function renderFinanceView(container) {
  const teams = store.teams;
  const finances = store.finances;

  const totalLeagueCash = teams.reduce((acc, t) => acc + t.balance, 0);
  const totalSquadValue = teams.reduce((acc, t) => acc + t.squadValue, 0);

  const teamCardsHtml = teams.map((t) => {
    const teamFin = finances.filter((f) => f.teamId === t.id);
    const totalIncomes = teamFin.filter((f) => f.type === "income").reduce((acc, f) => acc + f.amount, 0);
    const totalExpenses = teamFin.filter((f) => f.type === "expense").reduce((acc, f) => acc + f.amount, 0);

    return `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem; clip-path: var(--clip-chamfer); display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.8rem; width: 42px; height: 42px; background: ${t.logoBg || '#1A1A1A'}; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
              ${t.logoText || '⚽'}
            </span>
            <div>
              <h4 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: #fff;">${t.name}</h4>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Pres: ${t.president}</span>
            </div>
          </div>
          <span class="badge ${t.clausulazoUsed ? 'badge-red' : 'badge-lime'}">
            ${t.clausulazoUsed ? 'CLAUSULAZO USADO' : 'CLAUSULAZO ACTIVO'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: rgba(0,0,0,0.35); padding: 0.85rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">SALDO EN CARTERA</div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--color-lime); font-weight: 900;">${t.balance}M</div>
          </div>
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">VALOR PLANTILLA</div>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--color-yellow); font-weight: 900;">${t.squadValue}M</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 0.4rem 0.6rem; background: var(--bg-tertiary); border-radius: var(--radius-xs);">
          <span style="color: var(--color-lime);">Ingresos Acum.: <strong>+${totalIncomes}M</strong></span>
          <span style="color: var(--color-red);">Gastos Acum.: <strong>-${totalExpenses}M</strong></span>
        </div>
      </div>
    `;
  }).join("");

  const transactionsRowsHtml = finances.map((f) => {
    const team = store.getTeamById(f.teamId);
    const isIncome = f.type === "income";

    return `
      <tr class="standings-row">
        <td style="font-size: 0.75rem; color: var(--text-muted);">${f.date}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #fff;">
            <span>${team?.logoText || '⚽'}</span>
            <span>${team?.name || 'Club'}</span>
          </div>
        </td>
        <td style="color: var(--text-secondary);">${f.concept}</td>
        <td>
          <span class="badge ${isIncome ? 'badge-lime' : 'badge-red'}">
            ${isIncome ? 'INGRESO' : 'GASTO'}
          </span>
        </td>
        <td style="text-align: right; font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: ${isIncome ? 'var(--color-lime)' : 'var(--color-red)'};">
          ${isIncome ? '+' : '-'}${f.amount}M
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="view-animate-fade">
      <div class="page-header">
        <div class="page-title-group">
          <span class="page-category-tag">ECONOMÍA DEPORTIVA</span>
          <h1 class="page-title">💳 FINANZAS & TESORERÍAS KINGS LEAGUE</h1>
          <p class="page-subtitle">Presupuestos de 200M por club, premios por victoria (+50M) y balance de mercado.</p>
        </div>
      </div>

      <!-- Resumen Global de la Liga -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-badge);">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">LIQUIDEZ TOTAL EN CIRCULACIÓN</div>
          <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--color-lime);">${totalLeagueCash}M</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Suma de carteras de los 8 presidentes</div>
        </div>

        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-badge);">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">VALORACIÓN GLOBAL DE PLANTILLAS</div>
          <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--color-yellow);">${totalSquadValue}M</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">56 futbolistas valorados en el draft</div>
        </div>

        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.25rem; clip-path: var(--clip-badge);">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">REGLAS DE PREMIACIÓN</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-top: 0.25rem;">
            Victoria: <strong style="color: var(--color-lime);">+50M</strong> &bull; Empate: <strong style="color: var(--color-yellow);">+10M</strong>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">Acreditado de inmediato en cada acta</div>
        </div>
      </div>

      <!-- Grid de Equipos -->
      <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; color: #fff;">
        Estado Financiero por Club
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
        ${teamCardsHtml}
      </div>

      <!-- Libro Mayor de Transacciones -->
      <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; color: #fff;">
        Historial Oficial de Movimientos (${finances.length})
      </h3>
      <div class="standings-table-container">
        <table class="standings-table">
          <thead>
            <tr>
              <th>FECHA</th>
              <th>CLUB</th>
              <th>CONCEPTO</th>
              <th>TIPO</th>
              <th style="text-align: right;">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
