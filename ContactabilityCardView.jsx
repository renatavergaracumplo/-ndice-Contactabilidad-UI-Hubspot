import React, { useState, useEffect, useCallback } from "react";
import { Flex, Box, Text, Button, Icon, LoadingSpinner, Alert } from "@hubspot/ui-extensions";

import { buildLoveFetchUrl, normalizeLovePayload } from "./contactabilityApi";
import { resolveDataFillPresentation, parseLoveScoreNumber } from "./contactabilityPresentation";

const DESCRIPTION =
  "Este indicador examina la presencia de datos de contacto registrados.";

/** Tokens Figma */
const C_BG = "#FFFFFF";
const C_MASTER_BORDER = "#DFE3EB";
const C_TITLE = "#2D3E50";
const C_SLATE = "#506E91";
const C_BTN_BG = "#EAF0F6";
const C_BTN_BORDER = "#CBD6E2";

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) {
    return `rgba(80, 110, 145, ${alpha})`;
  }
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function TitleRow() {
  return (
    <Flex direction="row" align="start" justify="start" style={{ width: "100%" }}>
      <Text
        format={{ fontWeight: "bold", fontSize: "extra-large" }}
        style={{ color: C_TITLE, display: "block", width: "100%" }}
      >
        Índice de contactabilidad
      </Text>
    </Flex>
  );
}

function DescriptionBlock() {
  return (
    <Box style={{ width: "100%" }}>
      <Text
        format={{ fontSize: "small" }}
        style={{ color: C_SLATE, display: "block", width: "100%" }}
      >
        {DESCRIPTION}
      </Text>
    </Box>
  );
}

function SyncRow({ syncTimeLabel, onRefresh, refreshDisabled }) {
  return (
    <Flex
      direction="column"
      align="start"
      justify="start"
      gap="flush"
      style={{ width: "100%", paddingTop: 10 }}
    >
      <Flex direction="row" align="center" justify="start" gap="sm" style={{ width: "100%" }}>
        <Text format={{ fontSize: "extra-small" }} style={{ color: C_SLATE }}>
          Sincronizado: {syncTimeLabel}
        </Text>
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            if (!refreshDisabled) {
              onRefresh();
            }
          }}
        >
          <Icon name="refresh" />
        </Button>
      </Flex>
    </Flex>
  );
}

/** Figma: fondo #EAF0F6, borde #CBD6E2, texto #506E91; variant secondary + estilos para no competir con el estado. */
function ExtractDataButton({ onPress }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onPress}
      style={{
        backgroundColor: C_BTN_BG,
        border: `1px solid ${C_BTN_BORDER}`,
        color: C_SLATE,
        fontWeight: 600,
        borderRadius: 4,
      }}
    >
      Extraer datos
    </Button>
  );
}

/** Tag de nivel: fondo = color del tramo al 15 %, sin borde, texto #506E91. */
function TierTagRow({ label, accentColor }) {
  return (
    <Box
      style={{
        backgroundColor: hexToRgba(accentColor, 0.15),
        border: "none",
        padding: "4px 10px",
        borderRadius: "6px",
        flexShrink: 0,
      }}
    >
      <Flex direction="row" align="center" justify="start" gap="xs">
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: accentColor,
            flexShrink: 0,
          }}
        />
        <Text format={{ fontSize: "small", fontWeight: "demibold" }} style={{ color: C_SLATE }}>
          {label}
        </Text>
      </Flex>
    </Box>
  );
}

function StateDataBox({ scoreText, presentation, onExtract }) {
  /* Padding 16px = token md en especificación Figma (Box HubSpot usa `style`). */
  return (
    <Box
      style={{
        width: "100%",
        backgroundColor: C_BG,
        padding: 16,
        borderRadius: 8,
        border: `1px solid ${C_MASTER_BORDER}`,
      }}
    >
      <Flex direction="column" align="start" justify="start" gap="sm" style={{ width: "100%" }}>
        <Flex direction="row" align="center" justify="start" gap="sm" wrap="wrap" style={{ width: "100%" }}>
          <Flex direction="row" align="center" justify="start" gap="xs" style={{ flexShrink: 0 }}>
            <Text
              format={{ fontWeight: "bold" }}
              style={{ fontSize: 24, color: C_TITLE, lineHeight: 1.2 }}
            >
              {scoreText}
            </Text>
            <Text format={{ fontSize: "small" }} style={{ color: C_SLATE, lineHeight: 1.2 }}>
              /1.00
            </Text>
          </Flex>
          <TierTagRow label={presentation.label} accentColor={presentation.accentColor} />
        </Flex>
        <Text format={{ fontSize: "small" }} style={{ display: "block", width: "100%", color: C_SLATE }}>
          {presentation.message}
        </Text>
        <Flex
          direction="row"
          align="start"
          justify="start"
          style={{ width: "100%", marginTop: 12 }}
        >
          <ExtractDataButton onPress={onExtract} />
        </Flex>
      </Flex>
    </Box>
  );
}

function ProgressTrack({ score01, accentColor }) {
  const pct = Number.isFinite(score01) ? Math.min(100, Math.max(0, score01 * 100)) : 0;
  const fill = accentColor ?? "#7C98B6";
  const tickStyle = { color: C_SLATE, fontSize: 11 };
  return (
    <Flex direction="column" align="start" gap="xs" style={{ width: "100%" }}>
      <Box
        style={{
          width: "100%",
          height: "10px",
          borderRadius: "5px",
          backgroundColor: "#E8ECF0",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "5px",
            backgroundColor: fill,
          }}
        />
      </Box>
      <Flex justify="between" align="start" style={{ width: "100%" }}>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          0.00
        </Text>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          0.20
        </Text>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          0.40
        </Text>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          0.60
        </Text>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          0.80
        </Text>
        <Text format={{ fontSize: "extra-small" }} style={tickStyle}>
          1.00
        </Text>
      </Flex>
    </Flex>
  );
}

function CardLayout({ syncTimeLabel, onRefresh, refreshDisabled, children }) {
  return (
    <Box style={{ width: "100%", backgroundColor: C_BG }}>
      <Flex
        direction="column"
        align="start"
        justify="start"
        gap="sm"
        style={{ width: "100%", backgroundColor: C_BG }}
      >
        <TitleRow />
        <DescriptionBlock />
        <SyncRow
          syncTimeLabel={syncTimeLabel}
          onRefresh={onRefresh}
          refreshDisabled={refreshDisabled}
        />
        {children}
      </Flex>
    </Box>
  );
}

/**
 * Vista de la tarjeta (HubSpot + Vite). `remoteFetch` compatible con hubspot.fetch / fetch.
 * `actions` opcional (p. ej. addAlert en HubSpot).
 */
export function ContactabilityCardApp({ context, remoteFetch, actions }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const loadFromEndpoint = useCallback(async () => {
    setLoading(true);
    setError(null);

    const url = buildLoveFetchUrl(context);
    if (!url) {
      setError(
        "Configura loveContactabilityFetchUrl (con {contactId}) o loveContactabilityApiBaseUrl en variables de perfil, y abre la tarjeta en un contacto."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await remoteFetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setPayload(normalizeLovePayload(data));
      setLastSyncedAt(new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError(e?.message || "No se pudo obtener datos del servicio externo.");
    } finally {
      setLoading(false);
    }
  }, [context, remoteFetch]);

  useEffect(() => {
    loadFromEndpoint();
  }, [loadFromEndpoint]);

  const syncLabel = lastSyncedAt || "—";

  const onExtractData = () => {
    if (actions?.addAlert) {
      actions.addAlert({
        type: "info",
        title: "Extraer datos",
        message: "Se iniciará el flujo para completar datos de contacto (integración pendiente).",
      });
      return;
    }
    window.alert("Se iniciará el flujo para completar datos de contacto (integración pendiente).");
  };

  if (loading) {
    return (
      <CardLayout
        syncTimeLabel={syncLabel}
        onRefresh={loadFromEndpoint}
        refreshDisabled
      >
        <Flex direction="column" align="start" justify="start" gap="md" style={{ width: "100%" }}>
          <LoadingSpinner label="Cargando…" size="medium" />
        </Flex>
      </CardLayout>
    );
  }

  if (error) {
    return (
      <CardLayout
        syncTimeLabel={syncLabel}
        onRefresh={loadFromEndpoint}
        refreshDisabled={false}
      >
        <Alert title="Error al cargar" variant="error">
          {error}
        </Alert>
      </CardLayout>
    );
  }

  const scoreNum = parseLoveScoreNumber(payload?.love_score);
  const scoreText = Number.isFinite(scoreNum) ? scoreNum.toFixed(2) : "—";
  const presentation = resolveDataFillPresentation(scoreNum);

  return (
    <CardLayout
      syncTimeLabel={syncLabel}
      onRefresh={loadFromEndpoint}
      refreshDisabled={loading}
    >
      <Flex
        direction="column"
        align="start"
        justify="start"
        gap="sm"
        style={{ width: "100%", backgroundColor: C_BG }}
      >
        <StateDataBox scoreText={scoreText} presentation={presentation} onExtract={onExtractData} />
        <ProgressTrack score01={scoreNum} accentColor={presentation.accentColor} />
      </Flex>
    </CardLayout>
  );
}
