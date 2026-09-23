// ============================================================================
// KINGS LEAGUE IMEX - ADMIN VIEW (PANEL DEL ORGANIZADOR)
// ============================================================================

import { store } from "../state/store.js";
import { toast } from "../components/toast.js";
import { modal } from "../components/modal.js";

export function renderAdminView(container) {
  let activeTab = "results"; // 'results', 'teams-players', 'market-ctrl', 'finances', 'announcements', 'backup'

  function update() {
    let tabContentHtml = "";

    // -------------------------------------------------------------
    // PESTAÑA 1: REGISTRO DE RESULTADOS DE PARTIDOS
    // -------------------------------------------------------------
    if (activeTab === "results") {
      const scheduledMatches = store.matches.filter((m) => m.status === "scheduled");
      const finishedMatches = store.matches.filter((m) => m.status === "finished");

      tabContentHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem;">
          <!-- Formulario de Registro de Partido -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.75rem; clip-path: var(--clip-chamfer);">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--color-lime); margin-bottom: 0.5rem; text-transform: uppercase;">
              ⚽ ACTA DIGITAL DE PARTIDO
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              Al guardar, se actualizarán <strong>automáticamente</strong>: Clasificación, Puntos (3 o 1), Dinero (+50M o +10M), Goleadores y Estadísticas.
            </p>

            <div class="form-group">
              <label class="form-label">Seleccionar Partido Programado:</label>
              <select id="adminMatchSelect" class="form-select">
                ${scheduledMatches.map((m) => {
                  const h = store.getTeamById(m.homeTeamId);
                  const a = store.getTeamById(m.awayTeamId);
                  return `<option value="${m.id}">${m.title || `Jornada 0${m.matchday}`}: ${h?.name || 'Local'} vs ${a?.name || 'Visitante'}</option>`;
                }).join("")}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" id="lblHomeTeamScore">Goles Local:</label>
                <input type="number" id="inputHomeScore" class="form-control" min="0" value="3" />
              </div>
              <div class="form-group">
                <label class="form-label" id="lblAwayTeamScore">Goles Visitante:</label>
                <input type="number" id="inputAwayScore" class="form-control" min="0" value="1" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Goleadores (Seleccionar):</label>
              <div style="display: flex; gap: 0.5rem;">
                <select id="adminScorerSelect" class="form-select"></select>
                <button class="btn btn-sm btn-outline-lime" id="btnAddScorerToList" style="white-space: nowrap;">+ Añadir Gol</button>
              </div>
              <div id="adminScorersListChips" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem;"></div>
            </div>

            <div class="form-group">
              <label class="form-label">Jugador del Partido (MVP ⭐):</label>
              <select id="adminMvpSelect" class="form-select"></select>
            </div>

            <div class="form-group">
              <label class="form-label">Cartas Secretas Activadas:</label>
              <input type="text" id="inputCardsUsed" class="form-control" placeholder="Ej: Gol Doble (Los Cuervos) al min 22" />
            </div>

            <div class="form-group">
              <label class="form-label">Evento dinámico del partido:</label>
              <input type="text" id="inputDiceEvent" class="form-control" placeholder="Ej: Minuto 18 -> 2vs2 sin porteros" />
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones / Acta Arbitral:</label>
              <input type="text" id="inputMatchNotes" class="form-control" placeholder="Ej: Gran partido sin incidentes." />
            </div>

            <button class="btn btn-lime btn-lg" id="btnSaveMatchResult" style="width: 100%; margin-top: 0.75rem;">
              💾 Guardar Resultado Oficial
            </button>
          </div>

          <!-- Historial de Partidos ya Finalizados -->
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 1rem; text-transform: uppercase;">
              Partidos ya Finalizados (${finishedMatches.length})
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 520px; overflow-y: auto;">
              ${finishedMatches.map((m) => {
                const h = store.getTeamById(m.homeTeamId);
                const a = store.getTeamById(m.awayTeamId);
                return `
                  <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 0.7rem; color: var(--color-yellow); font-weight: 700;">JORNADA 0${m.matchday} &bull; ${m.date}</div>
                      <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">${h?.name} ${m.homeScore} - ${m.awayScore} ${a?.name}</div>
                    </div>
                    <span class="badge badge-lime">ACTA REGISTRADA</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // PESTAÑA 2: GESTIÓN DE EQUIPOS Y JUGADORES
    // -------------------------------------------------------------
    else if (activeTab === "teams-players") {
      tabContentHtml = `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <!-- Equipos -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff;">
                🛡️ CLUBES PARTICIPANTES (${store.teams.length})
              </h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
              ${store.teams.map((t) => `
                <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">${t.logoText}</span>
                    <div>
                      <div style="font-weight: 800; color: #fff;">${t.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${t.president} &bull; Gr. ${t.group} &bull; ${t.balance}M</div>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline btn-edit-team-modal" data-team-id="${t.id}">Editar</button>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Jugadores -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
              <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff;">
                👤 PLANTEL DE JUGADORES (${store.players.length})
              </h3>
              <button class="btn btn-sm btn-lime" id="btnCreateNewPlayerModal">+ Nuevo Jugador</button>
            </div>
            <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 0.5rem;">
              ${store.players.map((p) => {
                const tm = store.getTeamById(p.teamId);
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border-radius: 4px; border: 1px solid var(--border-subtle);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <span style="font-family: var(--font-display); font-size: 1.1rem; color: var(--text-muted); width: 20px;">#${p.number}</span>
                      <span class="player-pos-badge pos-${p.position.toLowerCase()}">${p.position}</span>
                      <div>
                        <span style="font-weight: 800; color: #fff;">${p.name}</span>
                        ${p.isInsignia ? `<span class="badge badge-gold" style="margin-left: 0.4rem;">⭐ INSIGNIA</span>` : ""}
                        <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 0.5rem;">${tm?.name}</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <span style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--color-lime);">${p.value}M</span>
                      <button class="btn btn-sm btn-outline btn-edit-player-modal" data-player-id="${p.id}">Editar</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // PESTAÑA 3: CONTROL DE MERCADO & CLAUSULAZOS
    // -------------------------------------------------------------
    else if (activeTab === "market-ctrl") {
      const isMOpen = store.isMarketOpenNow();
      const mode = store.market.mode || "auto";

      tabContentHtml = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.75rem; clip-path: var(--clip-chamfer);">
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">
              INTERRUPTOR MAESTRO DEL MERCADO
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              Por defecto el mercado solo abre los <strong>miércoles</strong> (se calcula con la fecha real). Al abrirse, todos los clubes recuperan su <strong>Clausulazo</strong>.
            </p>

            <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <span class="badge ${isMOpen ? 'badge-lime' : 'badge-red'}" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                ESTADO ACTUAL: ${isMOpen ? 'ABIERTO' : 'CERRADO'}
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Hoy es ${['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date().getDay()]}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Modo del mercado:</label>
              <select id="selectMarketMode" class="form-select">
                <option value="auto" ${mode === 'auto' ? 'selected' : ''}>Automático (solo miércoles)</option>
                <option value="open" ${mode === 'open' ? 'selected' : ''}>Forzar ABIERTO</option>
                <option value="closed" ${mode === 'closed' ? 'selected' : ''}>Forzar CERRADO</option>
              </select>
            </div>

            <button class="btn btn-outline-lime" id="btnSaveMarketMode" style="margin-top: 0.5rem;">
              Guardar Modo del Mercado
            </button>
          </div>

          <!-- Reset individual de Clausulazo -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">
              RESTABLECER CLAUSULAZO A UN EQUIPO
            </h4>
            <div style="display: flex; gap: 0.75rem;">
              <select id="selectResetClausulazoTeam" class="form-select">
                ${store.teams.map((t) => `<option value="${t.id}">${t.name} (Actualmente: ${t.clausulazoUsed ? 'Usado' : 'Disponible'})</option>`).join("")}
              </select>
              <button class="btn btn-yellow" id="btnResetTeamClausulazo" style="white-space: nowrap;">
                Habilitar Clausulazo
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // PESTAÑA 4: AJUSTES FINANCIEROS & SANCIONES
    // -------------------------------------------------------------
    else if (activeTab === "finances") {
      tabContentHtml = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 2rem; max-width: 720px; clip-path: var(--clip-chamfer);">
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--color-lime); margin-bottom: 0.5rem;">
            💳 AJUSTE FINANCIERO / SANCIONES ECONÓMICAS
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Modifica la cartera de un club para inyecciones de fondos extraordinarias o multas disciplinarias.
          </p>

          <div class="form-group">
            <label class="form-label">Seleccionar Club:</label>
            <select id="adminFinanceTeamSelect" class="form-select">
              ${store.teams.map((t) => `<option value="${t.id}">${t.logoText} ${t.name} (Saldo: ${t.balance}M)</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Movimiento:</label>
            <select id="adminFinanceTypeSelect" class="form-select">
              <option value="income">Abono / Ingreso Extraordinario (+)</option>
              <option value="expense">Sanción Económica / Descuento (-)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Importe (Millones):</label>
            <input type="number" id="adminFinanceAmount" class="form-control" min="1" value="25" />
          </div>

          <div class="form-group">
            <label class="form-label">Motivo Oficial:</label>
            <input type="text" id="adminFinanceConcept" class="form-control" placeholder="Ej: Sanción por retraso en el saque / Bono de patrocinador" />
          </div>

          <button class="btn btn-lime btn-lg" id="btnExecuteFinanceAdjustment" style="width: 100%; margin-top: 1rem;">
            Confirmar Movimiento Financiero
          </button>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // PESTAÑA 5: PUBLICAR ANUNCIOS
    // -------------------------------------------------------------
    else if (activeTab === "announcements") {
      tabContentHtml = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 2rem; max-width: 720px; clip-path: var(--clip-chamfer);">
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
            📢 PUBLICAR NUEVO COMUNICADO OFICIAL
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Este anuncio aparecerá en la portada, canal de noticias y notificaciones de todos los alumnos.
          </p>

          <div class="form-group">
            <label class="form-label">Título del Comunicado:</label>
            <input type="text" id="inputAnnTitle" class="form-control" placeholder="Ej: Modificación de horarios Jornada 03..." />
          </div>

          <div class="form-group">
            <label class="form-label">Categoría:</label>
            <select id="selectAnnCategory" class="form-select">
              <option value="MERCADO">MERCADO</option>
              <option value="HORARIOS">HORARIOS</option>
              <option value="SANCIONES">SANCIONES</option>
              <option value="RESULTADOS">RESULTADOS</option>
              <option value="IMPORTANTE">IMPORTANTE</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Contenido:</label>
            <textarea id="textareaAnnContent" class="form-textarea" placeholder="Escribe el texto íntegro del anuncio..."></textarea>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #fff; font-size: 0.85rem;">
              <input type="checkbox" id="checkAnnImportant" />
              <span>Marcar como Comunicado Urgente (Destacado en Rojo)</span>
            </label>
          </div>

          <button class="btn btn-lime btn-lg" id="btnPublishAnnouncement" style="width: 100%; margin-top: 1rem;">
            Publicar en la Plataforma
          </button>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // PESTAÑA 6: RESPALDO, JSON Y RESET
    // -------------------------------------------------------------
    else if (activeTab === "backup") {
      tabContentHtml = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">
          <!-- Reset to Demo -->
          <div style="background: rgba(255, 46, 77, 0.08); border: 1px solid var(--color-red); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--color-red); margin-bottom: 0.5rem;">
              🔄 RESTABLECER A DATOS DE DEMOSTRACIÓN
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Restaura la plataforma a su estado inicial: 8 equipos con 200M repartidos, 56 jugadores base, 4 partidos jugados de muestra y clasificaciones limpias.
            </p>
            <button class="btn btn-red" id="btnResetToDemoData">
              Restablecer Datos Demo Iniciales
            </button>
          </div>

          <!-- Export / Import JSON -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 1.5rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
              💾 RESPALDO EN ARCHIVO JSON
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              Exporta toda la base de datos de tu torneo o cárgala en otra computadora.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
              <button class="btn btn-outline-lime" id="btnExportJson">
                📥 Descargar Copia JSON
              </button>
            </div>

            <div class="form-group">
              <label class="form-label">O importar pegando contenido JSON:</label>
              <textarea id="textareaImportJson" class="form-textarea" placeholder="Pega aquí el JSON exportado previamente..."></textarea>
              <button class="btn btn-yellow" id="btnImportJson" style="align-self: flex-start; margin-top: 0.5rem;">
                Cargar Respaldo JSON
              </button>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="view-animate-fade">
        <div class="page-header">
          <div class="page-title-group">
            <span class="page-category-tag">MASTER ADMIN</span>
            <h1 class="page-title">👑 PANEL DEL ORGANIZADOR</h1>
            <p class="page-subtitle">Control absoluto de la competición: resultados, clubes, jugadores, economía y fechas.</p>
          </div>

          <!-- Pestañas del Organizador -->
          <div class="tab-nav" id="adminTabsNav">
            <button class="tab-btn ${activeTab === 'results' ? 'active' : ''}" data-tab="results">⚽ RESULTADOS</button>
            <button class="tab-btn ${activeTab === 'teams-players' ? 'active' : ''}" data-tab="teams-players">🛡️ EQUIPOS & JUGADORES</button>
            <button class="tab-btn ${activeTab === 'market-ctrl' ? 'active' : ''}" data-tab="market-ctrl">💰 MERCADO</button>
            <button class="tab-btn ${activeTab === 'finances' ? 'active' : ''}" data-tab="finances">💳 FINANZAS</button>
            <button class="tab-btn ${activeTab === 'announcements' ? 'active' : ''}" data-tab="announcements">📢 ANUNCIOS</button>
            <button class="tab-btn ${activeTab === 'backup' ? 'active' : ''}" data-tab="backup">💾 DATOS / RESET</button>
          </div>
        </div>

        <div id="adminTabContent">
          ${tabContentHtml}
        </div>
      </div>
    `;

    // Tab Listeners
    container.querySelectorAll("#adminTabsNav .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        update();
      });
    });

    // -------------------------------------------------------------
    // LISTENERS SEGÚN PESTAÑA ACTIVA
    // -------------------------------------------------------------
    if (activeTab === "results") {
      const matchSelect = container.querySelector("#adminMatchSelect");
      const scorerSelect = container.querySelector("#adminScorerSelect");
      const mvpSelect = container.querySelector("#adminMvpSelect");
      const scorersListContainer = container.querySelector("#adminScorersListChips");
      const selectedScorers = [];

      function populateMatchPlayers(matchId) {
        const m = store.matches.find((x) => x.id === matchId);
        if (!m) return;
        const hTeam = store.getTeamById(m.homeTeamId);
        const aTeam = store.getTeamById(m.awayTeamId);

        container.querySelector("#lblHomeTeamScore").innerText = `Goles ${hTeam?.name || 'Local'}:`;
        container.querySelector("#lblAwayTeamScore").innerText = `Goles ${aTeam?.name || 'Visitante'}:`;

        const homePlayers = store.getTeamPlayers(m.homeTeamId);
        const awayPlayers = store.getTeamPlayers(m.awayTeamId);
        const allMatchPlayers = [...homePlayers, ...awayPlayers];

        const optionsHtml = allMatchPlayers.map((p) => `
          <option value="${p.id}">${p.name} (#${p.number} - ${store.getTeamById(p.teamId)?.shortName})</option>
        `).join("");

        scorerSelect.innerHTML = optionsHtml;
        mvpSelect.innerHTML = optionsHtml;
      }

      if (matchSelect && matchSelect.value) {
        populateMatchPlayers(matchSelect.value);
        matchSelect.addEventListener("change", () => populateMatchPlayers(matchSelect.value));
      }

      container.querySelector("#btnAddScorerToList")?.addEventListener("click", () => {
        const pId = scorerSelect.value;
        const player = store.getPlayerById(pId);
        if (player) {
          selectedScorers.push({ playerId: player.id, teamId: player.teamId, minute: 10, type: "regular" });
          renderScorersChips();
        }
      });

      function renderScorersChips() {
        scorersListContainer.innerHTML = selectedScorers.map((s, idx) => {
          const p = store.getPlayerById(s.playerId);
          return `
            <span class="event-chip card-event" style="display: inline-flex; align-items: center; gap: 0.3rem;">
              ⚽ ${p?.name}
              <button style="background: none; border: none; color: var(--color-red); cursor: pointer; font-weight: 800;" data-chip-idx="${idx}">&times;</button>
            </span>
          `;
        }).join("");

        scorersListContainer.querySelectorAll("button").forEach((b) => {
          b.addEventListener("click", (e) => {
            const idx = Number(e.target.dataset.chipIdx);
            selectedScorers.splice(idx, 1);
            renderScorersChips();
          });
        });
      }

      container.querySelector("#btnSaveMatchResult")?.addEventListener("click", () => {
        const matchId = matchSelect.value;
        const homeScore = Number(container.querySelector("#inputHomeScore").value) || 0;
        const awayScore = Number(container.querySelector("#inputAwayScore").value) || 0;
        const mvpPlayerId = mvpSelect.value;
        const cardsUsedText = container.querySelector("#inputCardsUsed").value.trim();
        const diceEventText = container.querySelector("#inputDiceEvent").value.trim();
        const notes = container.querySelector("#inputMatchNotes").value.trim();

        const match = store.matches.find((m) => m.id === matchId);
        if (!match) return;

        store.recordMatchResult({
          id: matchId,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homeScore,
          awayScore,
          mvpPlayerId,
          matchday: match.matchday,
          cardsUsed: cardsUsedText ? [{ teamId: match.homeTeamId, cardName: cardsUsedText, result: "Aplicado" }] : [],
          diceEvent: diceEventText || match.diceEvent,
          scorers: selectedScorers,
          notes: notes || match.notes,
        });

        toast.show("Acta Registrada", "Marcador, puntos, premios (+50M/+10M) y goleadores actualizados con éxito.", "lime");
        update();
      });
    }

    else if (activeTab === "teams-players") {
      container.querySelectorAll(".btn-edit-player-modal").forEach((b) => {
        b.addEventListener("click", () => openEditPlayerModal(b.dataset.playerId));
      });

      container.querySelector("#btnCreateNewPlayerModal")?.addEventListener("click", () => {
        openEditPlayerModal(null);
      });

      container.querySelectorAll(".btn-edit-team-modal").forEach((b) => {
        b.addEventListener("click", () => openEditTeamModal(b.dataset.teamId));
      });
    }

    else if (activeTab === "market-ctrl") {
      container.querySelector("#btnSaveMarketMode")?.addEventListener("click", () => {
        const mode = container.querySelector("#selectMarketMode").value;
        store.setMarketStatus(mode);
        const label = mode === "auto" ? "Automático (solo miércoles)" : mode === "open" ? "Forzado ABIERTO" : "Forzado CERRADO";
        toast.show("Mercado", `Modo actualizado: ${label}`, store.isMarketOpenNow() ? "lime" : "red");
        update();
      });

      container.querySelector("#btnResetTeamClausulazo")?.addEventListener("click", () => {
        const teamId = container.querySelector("#selectResetClausulazoTeam").value;
        const team = store.getTeamById(teamId);
        if (team) {
          team.clausulazoUsed = false;
          store.saveState();
          toast.show("Clausulazo", `Clausulazo reactivado para ${team.name}`, "lime");
          update();
        }
      });
    }

    else if (activeTab === "finances") {
      container.querySelector("#btnExecuteFinanceAdjustment")?.addEventListener("click", () => {
        const tId = container.querySelector("#adminFinanceTeamSelect").value;
        const isInc = container.querySelector("#adminFinanceTypeSelect").value === "income";
        const amt = Number(container.querySelector("#adminFinanceAmount").value) || 0;
        const concept = container.querySelector("#adminFinanceConcept").value.trim();

        store.adjustTeamFinance(tId, amt, concept, isInc);
        toast.show("Finanzas", `Movimiento de ${isInc ? '+' : '-'}${amt}M registrado.`, "lime");
        update();
      });
    }

    else if (activeTab === "announcements") {
      container.querySelector("#btnPublishAnnouncement")?.addEventListener("click", () => {
        const title = container.querySelector("#inputAnnTitle").value.trim();
        const category = container.querySelector("#selectAnnCategory").value;
        const content = container.querySelector("#textareaAnnContent").value.trim();
        const important = container.querySelector("#checkAnnImportant").checked;

        if (!title || !content) {
          toast.show("Atención", "Título y contenido requeridos.", "yellow");
          return;
        }

        store.addAnnouncement({ title, category, content, important });
        toast.show("Publicado", "El comunicado se difundió en toda la plataforma.", "lime");
        update();
      });
    }

    else if (activeTab === "backup") {
      container.querySelector("#btnResetToDemoData")?.addEventListener("click", () => {
        if (confirm("¿Estás seguro de restablecer todos los datos a la demostración inicial?")) {
          store.resetToDefaults(true);
          toast.show("Reinicio Completo", "Base de datos restablecida a los valores demo.", "yellow");
          update();
        }
      });

      container.querySelector("#btnExportJson")?.addEventListener("click", () => {
        const dataStr = store.exportBackupJSON();
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kings-league-imex-backup-${new Date().toISOString().substring(0, 10)}.json`;
        a.click();
        toast.show("Respaldo", "Archivo JSON descargado.", "lime");
      });

      container.querySelector("#btnImportJson")?.addEventListener("click", () => {
        const jsonStr = container.querySelector("#textareaImportJson").value.trim();
        if (!jsonStr) {
          toast.show("Error", "Pega un JSON válido.", "red");
          return;
        }
        const ok = store.importBackupJSON(jsonStr);
        if (ok) {
          toast.show("Importación Exitosa", "Base de datos restaurada desde JSON.", "lime");
          update();
        } else {
          toast.show("Error", "El formato JSON no es válido.", "red");
        }
      });
    }
  }

  // Modales auxiliares de edición
  function openEditPlayerModal(playerId) {
    const player = playerId ? store.getPlayerById(playerId) : {
      id: "",
      name: "",
      number: 10,
      position: "DEL",
      value: 25,
      teamId: store.teams[0].id,
      isInsignia: false,
    };

    modal.open({
      title: playerId ? `EDITAR JUGADOR: ${player.name}` : "CREAR NUEVO JUGADOR",
      bodyHtml: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Nombre Completo:</label>
            <input type="text" id="editPName" class="form-control" value="${player.name}" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Dorsal (#):</label>
              <input type="number" id="editPNumber" class="form-control" value="${player.number}" />
            </div>
            <div class="form-group">
              <label class="form-label">Posición:</label>
              <select id="editPPosition" class="form-select">
                <option value="POR" ${player.position === 'POR' ? 'selected' : ''}>Portero (POR)</option>
                <option value="DEF" ${player.position === 'DEF' ? 'selected' : ''}>Defensa (DEF)</option>
                <option value="MED" ${player.position === 'MED' ? 'selected' : ''}>Medio (MED)</option>
                <option value="DEL" ${player.position === 'DEL' ? 'selected' : ''}>Delantero (DEL)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Cláusula Económica (M):</label>
              <input type="number" id="editPValue" class="form-control" value="${player.value}" />
            </div>
            <div class="form-group">
              <label class="form-label">Equipo Asignado:</label>
              <select id="editPTeam" class="form-select">
                ${store.teams.map((t) => `<option value="${t.id}" ${player.teamId === t.id ? 'selected' : ''}>${t.name}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; color: #fff; cursor: pointer;">
              <input type="checkbox" id="editPIsInsignia" ${player.isInsignia ? 'checked' : ''} />
              <span>⭐ Designar como JUGADOR INSIGNIA (Inmune a clausulazo)</span>
            </label>
          </div>
        </div>
      `,
      footerHtml: `
        ${playerId ? `<button class="btn btn-red btn-sm" id="btnDeletePlayer" style="margin-right: auto;">Eliminar</button>` : ""}
        <button class="btn btn-outline" onclick="document.getElementById('globalModalCloseBtn').click()">Cancelar</button>
        <button class="btn btn-lime" id="btnSavePlayerData">Guardar Jugador</button>
      `,
    });

    document.getElementById("btnSavePlayerData")?.addEventListener("click", () => {
      const name = document.getElementById("editPName").value.trim();
      const number = Number(document.getElementById("editPNumber").value);
      const position = document.getElementById("editPPosition").value;
      const value = Number(document.getElementById("editPValue").value);
      const teamId = document.getElementById("editPTeam").value;
      const isInsignia = document.getElementById("editPIsInsignia").checked;

      const savedPlayerId = store.updatePlayer({
        id: player.id,
        name,
        number,
        position,
        value,
        teamId,
        isInsignia,
      });

      if (isInsignia) {
        store.setInsigniaPlayer(teamId, savedPlayerId);
      }

      toast.show("Jugador", "Datos actualizados en plantilla", "lime");
      modal.close();
      update();
    });

    document.getElementById("btnDeletePlayer")?.addEventListener("click", () => {
      if (confirm(`¿Eliminar a ${player.name}?`)) {
        store.deletePlayer(player.id);
        toast.show("Eliminado", "Jugador eliminado", "yellow");
        modal.close();
        update();
      }
    });
  }

  function openEditTeamModal(teamId) {
    const team = store.getTeamById(teamId);
    if (!team) return;

    modal.open({
      title: `EDITAR CLUB: ${team.name}`,
      bodyHtml: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Nombre del Club:</label>
            <input type="text" id="editTName" class="form-control" value="${team.name}" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Presidente Alumno:</label>
              <input type="text" id="editTPres" class="form-control" value="${team.president}" />
            </div>
            <div class="form-group">
              <label class="form-label">Grupo:</label>
              <select id="editTGroup" class="form-select">
                <option value="A" ${team.group === 'A' ? 'selected' : ''}>Grupo A</option>
                <option value="B" ${team.group === 'B' ? 'selected' : ''}>Grupo B</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Emoji / Escudo Texto:</label>
              <input type="text" id="editTLogoText" class="form-control" value="${team.logoText}" />
            </div>
            <div class="form-group">
              <label class="form-label">Color Principal:</label>
              <input type="color" id="editTColor" class="form-control" value="${team.color}" style="height: 42px; padding: 0.2rem;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">URL del Escudo / Logo:</label>
              <input type="url" id="editTCrestUrl" class="form-control" value="${team.crestUrl || ''}" placeholder="https://.../escudo.png" />
            </div>
            <div class="form-group">
              <label class="form-label">Fondo del Escudo:</label>
              <input type="color" id="editTLogoBg" class="form-control" value="${team.logoBg && team.logoBg.includes('rgb') ? '#101828' : (team.color || '#1A1A1A')}" style="height: 42px; padding: 0.2rem;" />
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="document.getElementById('globalModalCloseBtn').click()">Cancelar</button>
        <button class="btn btn-lime" id="btnSaveTeamData">Guardar Cambios</button>
      `,
    });

    document.getElementById("btnSaveTeamData")?.addEventListener("click", () => {
      const name = document.getElementById("editTName").value.trim();
      const president = document.getElementById("editTPres").value.trim();
      const group = document.getElementById("editTGroup").value;
      const logoText = document.getElementById("editTLogoText").value.trim();
      const color = document.getElementById("editTColor").value;
      const crestUrl = document.getElementById("editTCrestUrl").value.trim();
      const logoBg = document.getElementById("editTLogoBg").value;

      store.updateTeam({
        id: team.id,
        name,
        president,
        group,
        logoText,
        color,
        crestUrl,
        logoBg: `linear-gradient(135deg, ${logoBg}, #111111)`,
      });

      toast.show("Club", "Datos del club guardados", "lime");
      modal.close();
      update();
    });
  }

  update();
}
