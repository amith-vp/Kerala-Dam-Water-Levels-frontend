import type { DamSource, DamSourceFilter, DamsResponse } from "@/types/dam";
import { normalizeDam, normalizeDamResponse, toHistoricalFileName } from "@/lib/dam-data";

const DATA_BASE_URL = "https://raw.githubusercontent.com/amith-vp/Kerala-Dam-Water-Levels/main";

export const getLiveDataUrl = (source: DamSource = "KSEB") =>
  `${DATA_BASE_URL}/${source === "Irrigation" ? "irrigation_live.json" : "live.json"}`;

export const getHistoricalDataUrl = (damName: string, source: DamSource = "KSEB", historyFile?: string) => {
  const folder = source === "Irrigation" ? "irrigation_historic_data" : "historic_data";
  const fileName = historyFile || toHistoricalFileName(damName);
  return `${DATA_BASE_URL}/${folder}/${encodeURIComponent(fileName)}.json`;
};

const fetchSourceLiveDamData = async (source: DamSource): Promise<DamsResponse> => {
  try {
    const response = await fetch(getLiveDataUrl(source));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source} live data`);
    }
    return normalizeDamResponse(await response.json(), source);
  } catch (error) {
    console.error(`Error fetching ${source} live data:`, error);
    throw error;
  }
};

const fetchCombinedLiveDamData = async (): Promise<DamsResponse> => {
  const results = await Promise.allSettled([
    fetchSourceLiveDamData("KSEB"),
    fetchSourceLiveDamData("Irrigation"),
  ]);

  const fulfilled = results
    .filter((result): result is PromiseFulfilledResult<DamsResponse> => result.status === "fulfilled")
    .map((result) => result.value);

  if (fulfilled.length === 0) {
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
    throw rejected?.reason || new Error("Failed to fetch dam data");
  }

  const lastUpdates = fulfilled.reduce<DamsResponse["lastUpdates"]>((updates, response) => ({
    ...updates,
    ...response.lastUpdates,
  }), {});

  return {
    lastUpdate: Object.values(lastUpdates || {}).filter(Boolean).join(" / "),
    lastUpdates,
    dams: fulfilled.flatMap((response) => response.dams),
  };
};

export const fetchLiveDamData = async (source: DamSourceFilter = "KSEB") => {
  if (source === "all") {
    return fetchCombinedLiveDamData();
  }

  return fetchSourceLiveDamData(source);
};

export const fetchHistoricalDamData = async (damName: string, source: DamSource = "KSEB", historyFile?: string) => {
  try {
    const response = await fetch(getHistoricalDataUrl(damName, source, historyFile));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source} data for dam: ${damName}`);
    }
    return normalizeDam(await response.json(), source);
  } catch (error) {
    console.error(`Error fetching ${source} data for dam ${damName}:`, error);
    throw error;
  }
};
