// ─── CONFIGURAÇÃO DE TURNOS ───────────────────────────────────────────────
const USERS = {
  lucas:   { id: 11736555, name: "Lucas" },
  gabriel: { id: 13003284, name: "Gabriel Ferreira" },
  leonard: { id: 13496772, name: "Leonardo Santos" },
  jamaira: { id: 14163776, name: "Jamaira Hermesmeyer" },
  ana:     { id: 13003304, name: "Ana Silva" },
  davi:    { id: 14820999, name: "Davi Mendonça" },
};

// ─── OVERRIDE TEMPORÁRIO ──────────────────────────────────────────────────
// Remover quando voltar ao sistema normal de turnos
const OVERRIDE_USER = { id: 14847779, name: "Resorts Admin" };

const TURNOS = {
  madrugada: {
    starts: 7, ends: 8,
    rr_key: "rr_madrugada",
    pool: () => [USERS.jamaira, USERS.davi, USERS.ana],
  },
  manha: {
    starts: 8, ends: 15,
    rr_key: "rr_manha",
    pool: (isWeekend) => isWeekend ? [USERS.gabriel] : [USERS.lucas, USERS.gabriel],
  },
  tarde: {
    starts: 15, ends: 18,
    rr_key: "rr_tarde",
    pool: (isWeekend) => isWeekend ? [USERS.gabriel, USERS.leonard] : [USERS.lucas, USERS.gabriel, USERS.leonard],
  },
  noite: {
    starts: 18, ends: 23,
    rr_key: "rr_noite",
    pool: () => [USERS.gabriel, USERS.leonard],
  },
  noturno: {
    starts: 23, ends: 8,
    rr_key: "rr_noturno",
    pool: (isWeekend) => isWeekend
      ? [USERS.jamaira, USERS.davi, USERS.ana, USERS.gabriel]
      : [USERS.jamaira, USERS.davi, USERS.ana, USERS.gabriel, USERS.lucas],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────
function getTurnoAtual(hour) {
  if (hour >= 7  && hour < 8)  return TURNOS.madrugada;
  if (hour >= 8  && hour < 15) return TURNOS.manha;
  if (hour >= 15 && hour < 18) return TURNOS.tarde;
  if (hour >= 18 && hour < 23) return TURNOS.noite;
  return TURNOS.noturno;
}

function getCompleteTill() {
  return Math.floor(Date.now() / 1000) + (4 * 60 * 60);
}

// ─── LÓGICA PRINCIPAL ─────────────────────────────────────────────────────
const now = new Date();
const brasiliaOffset = -3 * 60;
const utcMinutes = now.getTime() / 60000 + now.getTimezoneOffset();
const brasiliaTime = new Date((utcMinutes + brasiliaOffset) * 60000);

const hour = brasiliaTime.getHours();
const isWeekend = brasiliaTime.getDay() === 0 || brasiliaTime.getDay() === 6;

const turno = getTurnoAtual(hour);
const pool = turno.pool(isWeekend);

const rrData = JSON.parse($input.first().json?.rr_cache_data || '{}');
let currentIdx = rrData?.[turno.rr_key] ?? 0;
const responsavelReal = pool[currentIdx % pool.length];
const nextIdx = (currentIdx + 1) % pool.length;

// OVERRIDE ATIVO: ignora responsavelReal, força Resorts Admin
// Para reverter: trocar `OVERRIDE_USER` por `responsavelReal` nas duas linhas abaixo
const responsavel = OVERRIDE_USER;
const completeTill = getCompleteTill();

return [{
  json: {
    responsavel_id: responsavel.id,
    responsavel_name: responsavel.name,
    turno_key: turno.rr_key,
    next_idx: nextIdx,
    complete_till: completeTill,
    turno_debug: {
      hour,
      isWeekend,
      turno: turno.rr_key,
      pool: pool.map(u => u.name),
      idx_usado: currentIdx % pool.length,
      override_ativo: true,
      responsavel_real: responsavelReal.name, // quem seria sem o override
    },
    task_payload: [
      {
        task_type_id: 1,
        text: "ACOMPANHAR CLIENTE - JUL.IA DESATIVADA",
        complete_till: completeTill,
        entity_id: parseInt($('Find New Lead Status').first().json.lead_id),
        entity_type: "leads",
        responsible_user_id: responsavel.id
      }
    ]
  }
}];