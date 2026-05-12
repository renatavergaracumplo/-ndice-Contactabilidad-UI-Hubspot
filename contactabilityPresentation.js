/**
 * Nivel de datos según love_score en [0, 1].
 *
 * Tramos:
 * - [0.0, 0.2]   Datos Nulos
 * - (0.2, 0.4]   Datos Insuficientes
 * - (0.4, 0.6]   Datos Parciales
 * - (0.6, 0.8)   Datos Completos
 * - [0.8, 1.0]   Datos Óptimos
 *
 * Score inválido → mismo tramo y mensaje que Datos Nulos.
 *
 * Escala (borde izquierdo, barra, punto del tag): #FF3333, #FF9900, #F5D547, #7ED321, #00A48D.
 * El fondo del tag en UI usa este `accentColor` al 15 % de opacidad (ver ContactabilityCardView).
 */

const TIER_NULOS = {
  tier: "nulos",
  label: "Datos Nulos",
  message: "Sin datos de contacto en HubSpot. Se recomienda usar la extracción de datos.",
  accentColor: "#FF3333",
};

const TIER_INSUFICIENTES = {
  tier: "insuficientes",
  label: "Datos Insuficientes",
  message: "Faltan datos críticos para contactar. Intenta completar la ficha antes de avanzar.",
  accentColor: "#FF9900",
};

const TIER_PARCIALES = {
  tier: "parciales",
  label: "Datos Parciales",
  message: "Existen algunos datos, pero la información es limitada para una gestión segura.",
  accentColor: "#F5D547",
};

const TIER_COMPLETOS = {
  tier: "completos",
  label: "Datos Completos",
  message: "La ficha cuenta con los canales principales registrados para el equipo comercial.",
  accentColor: "#7ED321",
};

const TIER_OPTIMOS = {
  tier: "optimos",
  label: "Datos Óptimos",
  message: "Perfil muy completo en datos de contacto disponibles para el equipo comercial.",
  accentColor: "#00A48D",
};

/**
 * @returns {{
 *   tier: string,
 *   label: string,
 *   message: string,
 *   accentColor: string,
 * }}
 */
export function resolveDataFillPresentation(score) {
  const s =
    typeof score === "number" && Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : NaN;

  if (!Number.isFinite(s)) {
    return { ...TIER_NULOS };
  }
  if (s <= 0.2) {
    return { ...TIER_NULOS };
  }
  if (s <= 0.4) {
    return { ...TIER_INSUFICIENTES };
  }
  if (s <= 0.6) {
    return { ...TIER_PARCIALES };
  }
  if (s < 0.8) {
    return { ...TIER_COMPLETOS };
  }
  return { ...TIER_OPTIMOS };
}

export function normalizeSegmentBadge(raw) {
  const s = raw == null ? "" : String(raw).trim().toLowerCase();
  if (s.includes("fug")) {
    return { label: "Fugado", variant: "danger" };
  }
  if (s.includes("activ") || (s.includes("cliente") && !s.includes("prospect"))) {
    return { label: "Cliente", variant: "success" };
  }
  return { label: "Prospecto", variant: "info" };
}

export function parseLoveScoreNumber(raw) {
  if (typeof raw === "number" && !Number.isNaN(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}
