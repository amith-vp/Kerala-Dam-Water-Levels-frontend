import type { Dam, DamData, DamSource, DamsResponse } from "@/types/dam";

export const DAM_SOURCES = ["KSEB", "Irrigation"] as const;

export const isDamSource = (value: unknown): value is DamSource =>
  value === "KSEB" || value === "Irrigation";

export const isUnavailableValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  const normalized = String(value).trim();
  if (!normalized) return true;
  return ["_", "-", "N/A", "NA", "NAN", "NULL"].includes(normalized.toUpperCase());
};

export const normalizeMetricValue = (value: unknown): string => {
  if (isUnavailableValue(value)) return "";
  return String(value).trim().replace(/,/g, "").replace(/%$/, "").trim();
};

export const parseDamNumber = (value: unknown): number | null => {
  const normalized = normalizeMetricValue(value);
  if (!normalized) return null;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatDamValue = (
  value: unknown,
  unit = "",
  decimals = 2
): string => {
  const parsed = parseDamNumber(value);
  if (parsed === null) return "N/A";
  return `${parsed.toFixed(decimals)}${unit}`;
};

export const getDamSource = (dam: Partial<Dam>): DamSource =>
  dam.source === "Irrigation" ? "Irrigation" : "KSEB";

const normalizeDamDataPoint = (point: Partial<DamData>): DamData => {
  const outflow = normalizeMetricValue(point.outflow);
  const totalOutflow = normalizeMetricValue(point.totalOutflow) || outflow;

  return {
    date: point.date || "",
    waterLevel: normalizeMetricValue(point.waterLevel),
    liveStorage: normalizeMetricValue(point.liveStorage),
    storagePercentage: normalizeMetricValue(point.storagePercentage),
    inflow: normalizeMetricValue(point.inflow),
    powerHouseDischarge: normalizeMetricValue(point.powerHouseDischarge),
    spillwayRelease: normalizeMetricValue(point.spillwayRelease),
    totalOutflow,
    outflow: outflow || totalOutflow,
    rainfall: normalizeMetricValue(point.rainfall),
    remarks: isUnavailableValue(point.remarks) ? "" : String(point.remarks).trim(),
  };
};

export const normalizeDam = (dam: Partial<Dam>, fallbackSource?: DamSource): Dam => {
  const source = fallbackSource || getDamSource(dam);
  const liveStorageAtFRL = normalizeMetricValue(dam.liveStorageAtFRL) || normalizeMetricValue(dam.grossStorage);

  return {
    id: dam.id || `${source}-${dam.name || dam.officialName || "dam"}`,
    name: dam.name || dam.officialName || "Unknown",
    officialName: dam.officialName || dam.name || "Unknown",
    source,
    district: dam.district || "",
    MWL: normalizeMetricValue(dam.MWL),
    FRL: normalizeMetricValue(dam.FRL),
    grossStorage: normalizeMetricValue(dam.grossStorage) || liveStorageAtFRL,
    liveStorageAtFRL,
    ruleLevel: normalizeMetricValue(dam.ruleLevel),
    blueLevel: normalizeMetricValue(dam.blueLevel),
    orangeLevel: normalizeMetricValue(dam.orangeLevel),
    redLevel: normalizeMetricValue(dam.redLevel),
    latitude: Number(dam.latitude) || 0,
    longitude: Number(dam.longitude) || 0,
    historyFile: dam.historyFile,
    data: Array.isArray(dam.data) ? dam.data.map(normalizeDamDataPoint) : [],
  };
};

export const normalizeDamResponse = (
  response: Partial<DamsResponse>,
  fallbackSource: DamSource
): DamsResponse => ({
  lastUpdate: response.lastUpdate || "",
  lastUpdates: {
    [fallbackSource]: response.lastUpdate || "",
  },
  dams: Array.isArray(response.dams)
    ? response.dams.map((dam) => normalizeDam(dam, fallbackSource))
    : [],
});

export const toHistoricalFileName = (damName: string): string =>
  damName.trim().replace(/\s+/g, "_");
